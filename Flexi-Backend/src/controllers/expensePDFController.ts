import { Bank, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from "fs";
import pdfParse from "pdf-parse";
import multer from "multer";
import multerConfig from "./multer_config";
import Joi from "joi";

const upload = multer(multerConfig.pdfMulterConfig.config).single(
  multerConfig.pdfMulterConfig.keyUpload
);
// Create instance of PrismaClient
const prisma = new PrismaClient();

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
}

// Interface for request body from client
interface DetectPDF {
  filePath: string;
  fileName: string;
  memberId: string;
  businessAcc: number;
}

// Add this helper function at the top of the file
const deleteUploadedFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    }
  });
};

export const pdfExtract = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const filePath = req.file?.path;
    console.log("🔥filePath", filePath);

    if (!filePath) {
      res.status(400).json({ message: "File path not found" });
      return;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      let text = data.text;
      console.log("🔥text", text);

      // pattern to match: datetime and X2/ENET only credit, excluding the second amount
      const pattern =
        /\b(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2})\s+X[2]\/ENET\d{1,3}(?:,\d{3})*\.\d{2}\d{1,3}(?:,\d{3})*\.\d{2}\b/g;
      const matches = text.match(pattern);

      // Extract DESC and note
      const descNotePattern =
        /(\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+X2\/ENET\d{1,3}(?:,\d{3})*\.\d{2}\d{1,3}(?:,\d{3})*\.\d{2})\s+(.+?)\s+(-)/g;
      const descNoteMatches: {
        transaction: string;
        desc: string;
        note: string;
      }[] = [];
      let match;
      while ((match = descNotePattern.exec(text)) !== null) {
        const [_, transaction, desc, note] = match;
        descNoteMatches.push({ transaction, desc, note });
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

      // Create a table Expense in the database with the following columns: dateTime, code, amount, desc, note using prisma
      const createExpenses = async () => {
        const expense: Expense = req.body;
        // Find business ID by member ID
        const businessAcc = await prisma.businessAcc.findFirst({
          where: {
            memberId: expense.memberId,
          },
          select: { id: true },
        });

        if (!codeAmount) {
          throw new Error("No codeAmount data found");
        }

        // check duplicate data before creating
        const duplicateData = await prisma.expense.findMany({
          where: {
            memberId: expense.memberId,
            date: {
              in: codeAmount.map((item) => item.dateTime),
            },
          },
        });

        if (duplicateData.length > 0) {
          throw new Error("Duplicate data found");
        }

        for (const item of codeAmount) {
          await prisma.expense.create({
            data: {
              date: item.dateTime,
              code: item.code,
              amount: item.amount,
              desc: item.desc,
              note: item.note,
              memberId: expense.memberId,
              businessAcc: businessAcc?.id ?? 0,
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
        res.status(201).json({
          message: "Expenses created successfully",
          expenses: await getExpenses(),
        });
      } catch (e: any) {
        console.error(e);
        res.status(500).json({ message: e.message });
      } finally {
        deleteUploadedFile(filePath); // Delete the uploaded file after processing
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: e.message });
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
