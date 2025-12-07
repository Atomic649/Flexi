import { Bank } from "../generated/client1/client";
import { Request, Response } from "express";
import fs from "fs";
import pdfParse from "pdf-parse";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { decrypt } from "node-qpdf2"; // Replace hummus-recipe with node-qpdf2
import { format } from "date-fns-tz";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";


const upload = multer(multerConfig.pdfMulterConfig.config).single(
  multerConfig.pdfMulterConfig.keyUpload
);
// Create instance of PrismaClient
const prisma = flexiDBPrismaClient;

// Interface for request body from client
interface Expense {
  date: Date;
  amount: number;
  group: string;
  image: string;
  memberId: string;
  businessAcc: number;
  note: string;
  desc: string;
  channel: Bank;
  expNo?: string;
}

// Add this helper function at the top of the file
const deleteUploadedFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    }
  });
};

const deleteFileIfExists = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    deleteUploadedFile(filePath);
  }
};

// Function to decrypt the PDF file
// Decrypt PDF and output to temporary file
const decryptPdf = async (inputPath: string, password: string): Promise<string> => {
  const outputPath = inputPath.replace(/\.pdf$/, '_unlocked.pdf');
  await decrypt({
    input: inputPath,
    password,
    output: outputPath,
  });
  return outputPath;
};


export const pdfExtract = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Upload the file using multer
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    // console.log("🎃req.body", req.body);
    const password = req.body.password;
    console.log("🎃 password:" ,password)
    const filePath = req.file?.path;
    console.log("🔥filePath", filePath);

    if (!filePath) {
      return res.status(400).json({ message: "File path not found" });
    }

    let finalPath = filePath;
    const tempFiles: string[] = [filePath]; // Track all created files

    try {
      // Decrypt the PDF if a password is provided
      if (password) {
        finalPath = await decryptPdf(filePath, password);
        tempFiles.push(finalPath); // Add decrypted file to tempFiles
        console.log("✅ Decrypted PDF at", finalPath);
      }

      const buffer = fs.readFileSync(finalPath);      
      const data = await pdfParse(buffer); // 🔓 decrypted buffer
      let text = data.text;
      console.log("🔥text", text);

      // pattern to match: datetime and X2/ENET only credit, excluding the second amount
      const pattern =
        /\b(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2})\s+X[2]\/ENET\d{1,3}(?:,\d{3})*\.\d{2}\d{1,3}(?:,\d{3})*\.\d{2}\b/g;
      const matches = text.match(pattern);

      // Extract DESC and note - updated to handle the specific format
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const descNoteMatches: {
        transaction: string;
        desc: string;
        note: string;
      }[] = [];
      
      // Find lines that match the main pattern
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`🔍 Checking line ${i}: "${line}"`);
        
        // Match the transaction pattern - simplified to match actual format
        // Looking for: DD/MM/YY on one line, then HH:MM on next line, then X2/ENET... on third line
        const dateMatch = line.match(/^\d{2}\/\d{2}\/\d{2}$/);
        
        if (dateMatch && i + 2 < lines.length) {
          const timeLine = lines[i + 1];
          const transactionLine = lines[i + 2];
          
          console.log(`🔍 Found date: "${line}"`);
          console.log(`🔍 Time line: "${timeLine}"`);
          console.log(`🔍 Transaction line: "${transactionLine}"`);
          
          // Check if next line is time format and third line has transaction
          const timeMatch = timeLine.match(/^\d{2}:\d{2}$/);
          const transMatch = transactionLine.match(/^X[12]\/(?:ENET|ATS)/);
          
          if (timeMatch && transMatch) {
            const transaction = `${line} ${timeLine} ${transactionLine}`;
            let desc = '';
            let note = '';
            
            console.log(`🔍 Found transaction: "${transaction}"`);
            
            // Look for desc on the line after transaction (i+3)
            if (i + 3 < lines.length) {
              const descLine = lines[i + 3];
              if (descLine !== '-' && !descLine.startsWith('DESC :') && !descLine.startsWith('NOTE :')) {
                desc = descLine;
                console.log(`🔍 Found desc: "${desc}"`);
                
                // Look for note on the line after desc (i+4)
                if (i + 4 < lines.length) {
                  const noteLine = lines[i + 4];
                  if (noteLine !== '-' && !noteLine.startsWith('DESC :') && !noteLine.startsWith('NOTE :')) {
                    note = noteLine;
                    console.log(`🔍 Found note: "${note}"`);
                  }
                }
              }
            }
            
            console.log(`🔍 Final result - transaction: "${transaction}", desc: "${desc}", note: "${note}"`);
            descNoteMatches.push({ transaction, desc, note });
          }
        }
      }
      console.log("🔥descNoteMatches", descNoteMatches);

      // process matches to desired format
      const formattedMatches = matches?.map((match) => {
        const matchGroups = match.match(
          /(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2})\s+(X2\/ENET\d{1,3}(?:,\d{3})*\.\d{2}\d{1,3}(?:,\d{3})*\.\d{2})/
        );
        if (!matchGroups) {
          throw new Error("Match groups not found");
        }
        const [_, date, time, transaction] = matchGroups;
        const formattedTransaction = transaction.replace(
          /(\d{1,3}(?:,\d{3})*\.\d{2})\d{1,3}(?:,\d{3})*\.\d{2}/,
          "$1"
        );

        // combine date and time into the desired format
        const [day, month, year] = date.split("/");
        const formattedDateTime = `20${year}-${month}-${day}T${time}:00.000Z`;
        return {
          dateTime: formattedDateTime,
          transaction: formattedTransaction,
        };
      });

      console.log("🔥formattedMatches", formattedMatches);
      // separate Code and Amount from formattedMatches
      const codeAmount = formattedMatches?.map((match) => {
        const [code, amount] = match.transaction.split(/(?<=X2\/ENET)\s*/);
        const descMatch = descNoteMatches.find((descMatch) => {
          const [descDate, descTime] = descMatch.transaction.split(/\s+/);
          const formattedDescDateTime = `20${descDate.split("/")[2]}-${
            descDate.split("/")[1]
          }-${descDate.split("/")[0]}T${descTime}:00.000Z`;
          return formattedDescDateTime === match.dateTime;
        });
        return {
          dateTime: match.dateTime,
          code: code.trim(),
          amount: parseFloat(amount.replace(/,/g, "")),
          desc: descMatch?.desc,
          note: descMatch?.note,
        };
      });
      console.log("🔥codeAmount", codeAmount);

      // generate expNo in format EXPYYYYMMDDXXXX
      const datePart = format(new Date(), "yyyyMMdd");
      const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4 digit number
      const expNo = `EXP${datePart}${randomPart}`;

      // detect sName from desc for each transaction individually
      const codeAmountWithSName = codeAmount?.map((item) => {
        let sName = null;
        
        if (item.desc) {
          // Check if desc contains the keywords
          const containsKeywords = /(?:โอน(?:เงิน)?|โอนไป|จ่ายบิล|PromptPay)/.test(item.desc);
          
          if (containsKeywords) {
            // Updated regex to capture everything after the keyword + space
            const sNameMatch = item.desc.match(/(?:โอน(?:เงิน)?|โอนไป|จ่ายบิล|PromptPay)\s+(.*)/);
            if (sNameMatch) {
              let extractedName = sNameMatch[1].trim();
              // Remove bank codes like "SCB x1937" or just "x1937" from the name
              extractedName = extractedName.replace(/\b\w+\s+x\d{4}\s*/, "").replace(/\bx\d{4}\s*/, "").trim();
              sName = extractedName;
              console.log(`🔍 Extracted sName for "${item.desc}": "${sName}"`);
            }
          } else {
            console.log(`🔍 No keywords found in desc: "${item.desc}"`);
          }
        }
        
        return {
          ...item,
          sName: sName
        };
      });
      
      console.log("🔥codeAmountWithSName", codeAmountWithSName);
     
      

      // Create a table Expense in the database with the following columns: dateTime, code, amount, desc, note using prisma
      const createExpenses = async () => {
        const expense: Expense = req.body;
        // Find business ID by member ID
        // Find business ID by member ID from member table
    const businessAcc = await prisma.member.findUnique({
      where : { uniqueId: expense.memberId },
      select:{ businessId: true }
    });

        if (!codeAmountWithSName) {
          throw new Error("No codeAmountWithSName data found");
        }

        // check duplicate data before creating
        const duplicateData = await prisma.expense.findMany({
          where: {
            memberId: expense.memberId,
            date: {
              in: codeAmountWithSName.map((item) => item.dateTime),
            },
          },
        });

        if (duplicateData.length > 0) {
          // Return a 409 Conflict so clients can handle it explicitly
          res.status(409).json({ message: "Duplicate data found" });
          return;
        }

        for (const item of codeAmountWithSName) {
          await prisma.expense.create({
            data: {
              date: item.dateTime,
              code: item.code,
              amount: item.amount,
              desc: item.desc,
              note: item.note,
              memberId: expense.memberId,
              businessAcc: businessAcc?.businessId ?? 0,
              expNo: expNo,
              sName: item.sName,
            },
          });
        }
      };

      // get the data from the database just created with id
      const getExpenses = async () => {
        const expense: Expense = req.body;
        const expenses = await prisma.expense.findMany({
          where: {
            memberId: expense.memberId,
            save: false,
          },
        });
        return expenses;
      };

      try {
        await createExpenses();
        // If createExpenses already sent a response (e.g. duplicate data), stop here
        if (res.headersSent) return;
        res.status(201).json({
          message: "Expenses created successfully",
          expenses: await getExpenses(),
        });
      } catch (e: any) {
        console.error(e);
        if (res.headersSent) return;
        res.status(500).json({ message: e.message });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: e.message });
    } finally {
      // Ensure all temporary files are deleted
      tempFiles.forEach(deleteFileIfExists);
    }
  });
};

export const saveDetectExpense = async (req: Request, res: Response) => {
  const { ids } = req.body;

  try {
    const expense = await prisma.expense.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        save: true,
      },
    });
    res.json({ message: "Expenses saved successfully", ids: ids });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to save expense" });
  }
};
