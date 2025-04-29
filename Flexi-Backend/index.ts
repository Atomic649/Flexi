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

// Use Cors
app.use(cors());

// Use Static Files
app.use("/uploads", express.static("uploads"));
app.use("/uploads/images", express.static("uploads/images"));
app.use("/uploads/pdf", express.static("uploads/pdf"));
app.get(`/test`, (_, res) => {
  res.send("whatever it takes 🔥 ");
});
app.get(`/`, (_, res) => {
  res.send("Hello - Flexi API 🚀");
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

// Import Credit Routes
import creditRoutes from "./src/routes/creditRoute";

// Import user Routes
import userRoutes from "./src/routes/userRoute";

// Import Post Routes
import postRoutes from "./src/routes/postRoute";

// Import Comment Routes
import commentRoutes from "./src/routes/commentRoute";

// Import report Routes
import reportRoutes from "./src/routes/reportRoute";

// Import pdf Rou
import pdfRoutes from "./src/routes/pdfRoute";

// Import Store Routes
import storeRoutes from "./src/routes/storeRoute";

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

// Credit Routes
app.use("/credit", creditRoutes);

// User Routes
app.use("/user", userRoutes);

// Post Routes
app.use("/post", postRoutes);

// Comment Routes
app.use("/comment", commentRoutes);

// Report Routes
app.use("/report", reportRoutes);

// Pdf Routes
app.use("/pdf", pdfRoutes);

// Store Routes
app.use("/store", storeRoutes);


// --------------START SERVER-----------------
//-- Up to .env file "development" and "production" mode
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: "*" })); // Allow all origins in development
} else {
  app.use(cors()); // Use default CORS settings in production
}

if (process.env.NODE_ENV === "production") {
  // Load SSL certificates
  const sslOptions = {
    key: fs.readFileSync("./ssl/key.pem"),
    cert: fs.readFileSync("./ssl/cert.pem"),
  };

  // Start HTTPS server in production
  https.createServer(sslOptions, app).listen(port, (err?: Error) => {
    if (err) {
      console.error("Failed to start HTTPS server:", err);
    } else {
      console.log(`Server started on HTTPS port ${port}`);
    }
  });
} else {
  // Start HTTP server in development
  app.listen(port, (err?: Error) => {
    if (err) {
      console.error("Failed to start HTTP server:", err);
    } else {
      console.log(`Server started on HTTP port ${port}`);
    }
  });
}