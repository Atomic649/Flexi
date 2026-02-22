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
    
    console.log("🎃req.body", req.body);
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

      // Extract all transactions - handles both old format (separate lines) and new format (combined line)
      const lines = text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);

      interface ParsedTransaction {
        dateTime: string;
        code: string;
        amount: number;
        desc: string;
        note: string;
      }

      const allTransactions: ParsedTransaction[] = [];

      // New format: all fields on one line e.g. "16/02/2617:38X2ENET40.0062.31"
      const newFormatLineRegex = /^(\d{2}\/\d{2}\/\d{2})(\d{2}:\d{2})(X[12])(ENET|TELL|ATS)(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/;
      // Old format: date on its own line, time on next, then X1/ENET or X2/ENET transaction
      const oldFormatDateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
      const oldFormatTransRegex = /^(X[12])\/(ENET|TELL|ATS)(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // New format: combined line with date+time+code+channel+amount+balance
        const newMatch = line.match(newFormatLineRegex);
        if (newMatch) {
          const [_, date, time, codeType, channel, amount] = newMatch;
          const [day, month, year] = date.split('/');
          const dateTime = `20${year}-${month}-${day}T${time}:00.000Z`;
          const code = `${codeType}/${channel}`;
          const amountNum = parseFloat(amount.replace(/,/g, ''));
          let desc = '';
          let note = '';

          // New format: "DESC :" label -> desc text -> "NOTE :" label -> note text
          if (i + 1 < lines.length && lines[i + 1] === 'DESC :') {
            if (i + 2 < lines.length && lines[i + 2] !== 'NOTE :') {
              desc = lines[i + 2];
            }
            if (i + 3 < lines.length && lines[i + 3] === 'NOTE :' && i + 4 < lines.length) {
              const potentialNote = lines[i + 4];
              if (potentialNote !== '-') {
                note = potentialNote;
              }
            }
          }

          allTransactions.push({ dateTime, code, amount: amountNum, desc, note });
          continue;
        }

        // Old format: date on its own line, then time, then transaction
        const oldDateMatch = line.match(oldFormatDateRegex);
        if (oldDateMatch && i + 2 < lines.length) {
          const timeLine = lines[i + 1];
          const transactionLine = lines[i + 2];

          const timeMatch = timeLine.match(/^\d{2}:\d{2}$/);
          const transMatch = transactionLine.match(oldFormatTransRegex);

          if (timeMatch && transMatch) {
            const [__, codeType, channel, amount] = transMatch;
            const [day, month, year] = line.split('/');
            const dateTime = `20${year}-${month}-${day}T${timeLine}:00.000Z`;
            const code = `${codeType}/${channel}`;
            const amountNum = parseFloat(amount.replace(/,/g, ''));
            let desc = '';
            let note = '';

            // Old format: description follows transaction line directly (before DESC:/NOTE: labels)
            if (i + 3 < lines.length) {
              const descLine = lines[i + 3];
              if (descLine !== '-' && !descLine.startsWith('DESC :') && !descLine.startsWith('NOTE :')) {
                desc = descLine;
                if (i + 4 < lines.length) {
                  const noteLine = lines[i + 4];
                  if (noteLine !== '-' && !noteLine.startsWith('DESC :') && !noteLine.startsWith('NOTE :')) {
                    note = noteLine;
                  }
                }
              }
            }

            allTransactions.push({ dateTime, code, amount: amountNum, desc, note });
          }
        }
      }

      // Filter only debit (X2) transactions
      const codeAmount = allTransactions.filter(t => t.code.startsWith('X2'));
      console.log("🔥codeAmount", codeAmount);

      // generate expNo in format EXPYYYYMMDDXXXX
      const datePart = format(new Date(), "yyyyMMdd");
      const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4 digit number
      const expNo = `EXP${datePart}${randomPart}`;

      // detect sName from desc for each transaction individually
      const codeAmountWithSName = codeAmount.map((item) => {
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

        if (codeAmountWithSName.length === 0) {
          throw new Error("No transactions found in PDF");
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
