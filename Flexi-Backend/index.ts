import express from "express";
import mime from "mime-types";
import send from "send";
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

// Normalize mime API for Express/send compatibility using mime-types
const mimeAny: any = mime as any;
if (mimeAny) {
  if (typeof mimeAny.lookup === "function") {
    mimeAny.getType = mimeAny.lookup.bind(mimeAny);
  }
  if (!mimeAny.charsets || typeof mimeAny.charsets.lookup !== "function") {
    mimeAny.charsets = { lookup: () => "UTF-8" };
  }
}

const sendMime: any = send?.mime;
if (sendMime) {
  if (!sendMime.charsets || typeof sendMime.charsets.lookup !== "function") {
    sendMime.charsets = { lookup: () => "UTF-8" };
  }
  if (typeof sendMime.lookup !== "function" && typeof mimeAny.lookup === "function") {
    sendMime.lookup = mimeAny.lookup.bind(mimeAny);
  }
  if (typeof sendMime.getType !== "function" && typeof sendMime.lookup === "function") {
    sendMime.getType = sendMime.lookup.bind(sendMime);
  }
}

// Use Static Files
app.use("/uploads", express.static("uploads"));
app.use("/uploads/images", express.static("uploads/images"));
// Serve PDFs from configured upload directory (fallback to default)
const pdfStaticDir = process.env.PDF_UPLOAD_DIR || "uploads/pdf";
app.use("/uploads/pdf", express.static(pdfStaticDir));
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

// AdsEvent Routes
import adsEventRoutes from "./src/routes/adsEventRoute";
// Facebook Ads Routes
import facebookRoutes from "./src/routes/facebookRoute";

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

// AdsTracking Routes
app.use("/ads-tracking", adsEventRoutes);;

// Facebook Ads Routes
app.use("/facebook", facebookRoutes);


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
attachChatAIWSServer(httpServer);

