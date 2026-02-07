import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";

// Initialize dotenv
dotenv.config();


// Create a new express application instance
const app = express();

// Express middleware
app.use(express.json());

// Parse incoming JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Use Cors only when not behind nginx proxy
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "*" })); // Allow all origins in development
}

// Normalize mime API for Express/send compatibility (mime v3+ lacks charsets)
const mimeAny: any = mime as any;
if (mimeAny) {
  if (!mimeAny.charsets || typeof mimeAny.charsets.lookup !== "function") {
    mimeAny.charsets = { lookup: () => "UTF-8" };
  }
  if (typeof mimeAny.getType !== "function" && typeof (mimeAny as any).lookup === "function") {
    mimeAny.getType = (mimeAny as any).lookup.bind(mimeAny);
  }
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const send = require("send");
  if (send && send.mime) {
    if (!send.mime.charsets || typeof send.mime.charsets.lookup !== "function") {
      send.mime.charsets = { lookup: () => "UTF-8" };
    }
    if (typeof send.mime.getType !== "function" && typeof send.mime.lookup === "function") {
      send.mime.getType = send.mime.lookup.bind(send.mime);
    }
  }
} catch {}

// Use Static Files
app.use("/uploads", express.static("uploads"));
app.use("/uploads/images", express.static("uploads/images"));
app.use("/uploads/pdf", express.static("uploads/pdf"));
app.get(`/test`, (_, res) => {
  res.send("whatever it takes 🔥 ");
});
app.get(`/`, (_, res) => {
  res.send("Hello - Flexi Business Hub API 🚀");
});

// --------------IMPORT ROUTES-----------------

// Import User Routes
import authRoutes from "./src/routes/authRoute";

// Import Bill Routes
import billRoutes from "./src/routes/billRoute";

// Import Member Routes
import memberRoutes from "./src/routes/memberRoute";

// Import Business Account Routes
import businessAccRoutes from "./src/routes/businessAccRoute";

// Import Ads Cost Routes
import adsCostRoutes from "./src/routes/adsCostRoute";

// Import platform Routes
import platformRoutes from "./src/routes/platformRoute";

// Import Expense Routes
import expenseRoutes from "./src/routes/expenseRoute";

// Import Product Routes
import productRoutes from "./src/routes/productRoute";

// Import Dashboard Routes
import dashboardRoutes from "./src/routes/dashboardRoute";

// Import user Routes
import userRoutes from "./src/routes/userRoute";

// Import report Routes
import reportRoutes from "./src/routes/reportRoute";

// Import pdf Routes
import pdfRoutes from "./src/routes/pdfRoute";
// Import B2B Routes
import b2BRoutes from "./src/routes/B2BRoute";

// Import Print Routes
import printRoutes from "./src/routes/printRoute";
// Import AI Chat Routes
import chatAIRoutes from "./src/routes/chatAIRoute";

// --------------USE ROUTES-----------------

// User Routes
app.use("/auth", authRoutes);

// Bill Routes
app.use("/bill", billRoutes);

// Member Routes
app.use("/member", memberRoutes);

// Business Account Routes
app.use("/businessacc", businessAccRoutes);

// Ads Cost Routes
app.use("/ads", adsCostRoutes);

// platform Routes
app.use("/platform", platformRoutes);

// Expense Routes
app.use("/expense", expenseRoutes);

// Product Routes
app.use("/product", productRoutes);

// Dashboard Routes
app.use("/dashboard", dashboardRoutes);

// User Routes
app.use("/user", userRoutes);

// Report Routes
app.use("/report", reportRoutes);

// Pdf Routes
app.use("/pdf", pdfRoutes);
// B2B Routes
app.use("/b2b", b2BRoutes);

// Print Routes
app.use("/print", printRoutes);

// AI Chat Routes
app.use("/ai", chatAIRoutes);


// start server with out SSL
const port = process.env.PORT || 3000;
const httpServer = app.listen(port, (err?: Error) => {
  if (err) {
    console.error("Failed to start server:", err);
  } else {
    console.log(`Server started on port ${port}`);
  }
});
// Attach WebSocket streaming server
import { attachChatAIWSServer } from "./src/ws/chatAIWS";
import mime from "mime";
attachChatAIWSServer(httpServer);

