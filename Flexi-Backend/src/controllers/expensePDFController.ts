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
      let text = data.text.normalize('NFC'); // Normalize Thai Sara Am for consistent matching
      console.log("🔥text", text);

      // Extract all transactions - handles SCB and KBank (Kasikornbank) formats
      const lines = text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);

      interface ParsedTransaction {
        dateTime: string;
        code: string;
        amount: number;
        desc: string;
        note: string;
      }

      // ── Bank detection ──────────────────────────────────────────────────────
      // KBank PDFs contain the format identifier "KBPDF" and channel name "K PLUS"
      const bankType = text.includes('กรุงศรีอยุธยา') ? 'KRUNGSRI'
        : (text.includes('KBPDF') || text.includes('K PLUS')) ? 'KBANK'
        : 'SCB';
      console.log("🏦 Detected bank:", bankType);

      let codeAmount: ParsedTransaction[] = [];

      if (bankType === 'KBANK') {
        // ── KBank (Kasikornbank) parser ───────────────────────────────────────
        // Transaction line format: DD-MM-YY HH:MM CHANNEL BALANCE DESCRIPTION TYPE AMOUNT
        // Expense types (outgoing money): ชำระเงิน | โอนเงิน | หักบัญชี
        // Income types  (skip):          รับโอนเงิน | รายการแก้ไข
        // ชำระเงิน appears with two different Unicode encodings depending on PDF font:
        //   ำ  = U+0E33 (sara am, single char)
        //   ํา = U+0E4D (maitaikhu) + U+0E32 (sara aa) — two chars, visually identical
        // Unicode NFC normalization does NOT unify these, so we match both explicitly.
        // Matches both Thai and English KBank transaction types
        const kbankTypeAmountRegex = /(ช(?:\u0E33|\u0E4D\u0E32)ระเงิน|โอนเงิน|หักบัญชี|รับโอนเงิน|รายการแก้ไข|Payment|Transfer Withdrawal|Transfer Deposit)(\d{1,3}(?:,\d{3})*\.\d{2})$/;
        const isKBankExpense = (type: string): boolean =>
          /^(?:ช(?:\u0E33|\u0E4D\u0E32)ระเงิน|โอนเงิน|หักบัญชี|Payment|Transfer Withdrawal)$/.test(type);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // KBank transaction lines start with DD-MM-YY immediately followed by HH:MM
          const dateTimeMatch = line.match(/^(\d{2})-(\d{2})-(\d{2})(\d{2}:\d{2})/);
          if (!dateTimeMatch) continue;
          const [, day, month, year, time] = dateTimeMatch;
          const dateTime = `20${year}-${month}-${day}T${time}:00.000Z`;

          // Some transactions span multiple lines; accumulate until type+amount is found
          let fullContent = line;
          let typeAmountMatch = fullContent.match(kbankTypeAmountRegex);
          if (!typeAmountMatch) {
            for (let j = i + 1; j <= i + 5 && j < lines.length; j++) {
              const nextLine = lines[j];
              // Stop when the next transaction starts (new DD-MM-YY HH:MM line)
              if (/^\d{2}-\d{2}-\d{2}\d{2}:\d{2}/.test(nextLine)) break;
              fullContent += ' ' + nextLine;
              typeAmountMatch = fullContent.match(kbankTypeAmountRegex);
              if (typeAmountMatch) break;
            }
          }
          if (!typeAmountMatch) continue;

          const transType = typeAmountMatch[1];
          if (!isKBankExpense(transType)) continue; // Skip income transactions
          const amount = parseFloat(typeAmountMatch[2].replace(/,/g, ''));

          // Extract description:
          //   1. Strip DD-MM-YYHH:MM prefix
          //   2. Strip TYPE+AMOUNT suffix
          //   3. Strip channel name (non-digit leading chars) + balance number
          let desc = fullContent
            .replace(/^\d{2}-\d{2}-\d{2}\d{2}:\d{2}/, '')
            .replace(kbankTypeAmountRegex, '')
            .trim();
          // Channel is non-digit text at start; balance is the first X,XXX.XX number
          desc = desc.replace(/^[^\d]*([\d,]+\.\d{2})/, '').trim();

          codeAmount.push({ dateTime, code: `KBANK/${transType}`, amount, desc, note: '' });
        }

      } else if (bankType === 'KRUNGSRI') {
        // ── Krungsri (Bank of Ayudhya) parser ────────────────────────────────
        // Transaction line format: DD/MM/YYYY HH:MM:SS TYPE AMOUNT BALANCE CHANNEL DESCRIPTION
        // Channels (no space before description): MOBILE | POS | ATM | INTERNET | BRANCH | ALS
        // ชำระด้วยบัตร has the same sara am encoding issue as KBank — match both forms.
        const isKrungsriExpense = (type: string): boolean =>
          /^(?:โอนเงินพร้อมเพย์|โอนเงิน|ช(?:\u0E33|\u0E4D\u0E32)ระด้วยบัตร|จ่ายบิล|จ่ายคิวอาร์|ถอนเงินสด)/.test(type);
        const isKrungsriIncome = (type: string): boolean =>
          /^(?:รับโอนเงิน|ฝากด้วยเช็ค)/.test(type);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Krungsri: full 4-digit year + seconds e.g. "27/01/2026 07:11:30"
          const dateTimeMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2}):\d{2}/);
          if (!dateTimeMatch) continue;
          const [, day, month, year, time] = dateTimeMatch;
          const dateTime = `${year}-${month}-${day}T${time}:00.000Z`;

          // Strip timestamp; remaining: TYPE AMOUNT BALANCE CHANNEL DESCRIPTION
          const afterTs = line.replace(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/, '');

          // TYPE is any non-digit text before the first number (amount)
          const typeAmountRest = afterTs.match(/^([^\d]+?)(\d{1,3}(?:,\d{3})*\.\d{2})(.*)/);
          if (!typeAmountRest) continue;
          const transType = typeAmountRest[1].trim();
          const amount = parseFloat(typeAmountRest[2].replace(/,/g, ''));
          const restAfterAmount = typeAmountRest[3];

          if (isKrungsriIncome(transType)) continue;
          if (!isKrungsriExpense(transType)) continue;

          // Strip balance (next number) then channel name (known uppercase prefix)
          let desc = restAfterAmount
            .replace(/^\d{1,3}(?:,\d{3})*\.\d{2}/, '')                          // Remove balance
            .replace(/^(?:MOBILE|POS|ATM|INTERNET|BRANCH|ALS)/, '')              // Remove channel
            .trim();

          codeAmount.push({ dateTime, code: `KRUNGSRI/${transType}`, amount, desc, note: '' });
        }

      } else {
        // ── SCB parser (existing logic, unchanged) ────────────────────────────
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
            const [, date, time, codeType, channel, amount] = newMatch;
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
              const [, codeType, channel, amount] = transMatch;
              const [day, month, year] = line.split('/');
              const dateTime = `20${year}-${month}-${day}T${timeLine}:00.000Z`;
              const code = `${codeType}/${channel}`;
              const amountNum = parseFloat(amount.replace(/,/g, ''));
              let desc = '';
              let note = '';

              // Old format: description follows transaction line directly
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

        // Filter only debit (X2) transactions for SCB
        codeAmount = allTransactions.filter(t => t.code.startsWith('X2'));
      }

      console.log("🔥codeAmount", codeAmount);

      // generate expNo in format EXPYYYYMMDDXXXX
      const datePart = format(new Date(), "yyyyMMdd");
      const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4 digit number
      const expNo = `EXP${datePart}${randomPart}`;

      // detect sName from desc for each transaction individually
      const codeAmountWithSName = codeAmount.map((item) => {
        let sName = null;

        if (item.code.startsWith('KRUNGSRI/')) {
          // Krungsri: desc is already the payee name (BANKCODE NAME or MERCHANT)
          // Skip card/ATM/cash descriptions that have no meaningful recipient
          if (item.desc && !/^จาก Card No\./i.test(item.desc) && !/^ถอนเงินสดผ่าน/.test(item.desc)) {
            // Remove leading bank code (2–5 uppercase ASCII letters + space, e.g. "SCB ", "KBANK ")
            sName = item.desc.replace(/^[A-Z]{2,5}\s+/, '').trim() || null;
            console.log(`🔍 Extracted sName (Krungsri) for "${item.desc}": "${sName}"`);
          }
        } else if (item.desc) {
          // KBank and SCB: keyword-based extraction
          // เพื่อช(?:\u0E33|\u0E4D\u0E32)ระ handles both Unicode forms of ชำระ (sara am encoding)
          const containsKeywords = /(?:โอน(?:เงิน)?|โอนไป|จ่ายบิล|PromptPay|เพื่อช(?:\u0E33|\u0E4D\u0E32)ระ|\bTo\b|Paid for)/.test(item.desc);

          if (containsKeywords) {
            const sNameMatch = item.desc.match(/(?:โอน(?:เงิน)?|โอนไป|จ่ายบิล|PromptPay|เพื่อช(?:\u0E33|\u0E4D\u0E32)ระ|\bTo\b|Paid for)\s+(.*)/);
            if (sNameMatch) {
              let extractedName = sNameMatch[1].trim();
              // Remove account references: optional bank code + X#### (SCB uses lowercase x, KBank uses uppercase X)
              extractedName = extractedName
                .replace(/^.*?[xX]\d{4}\s*/, '')      // Remove bank code + account number from start
                .replace(/\s*Ref\s+[xX]\d{4}.*/i, '') // Remove trailing Ref X#### reference
                .trim();
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
    await prisma.expense.updateMany({
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
