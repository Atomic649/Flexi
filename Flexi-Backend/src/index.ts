import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

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
app.get(`/test`, (req, res) => {
    res.send("Hello - API");
  });

// --------------IMPORT ROUTES-----------------

// Import User Routes
import authRoutes from "./routes/authRoute";

// Import Bill Routes
import billRoutes from "./routes/billRoute";

// Import Member Routes
import memberRoutes from "./routes/memberRoute";

// Import Business Account Routes
import businessAccRoutes from "./routes/businessAccRoute";

// Import Ads Cost Routes
import adsCostRoutes from "./routes/adsCostRoute";

// Import platform Routes
import platformRoutes from "./routes/platformRoute";

// Import Expense Routes
import expenseRoutes from "./routes/expenseRoute";

// Import Product Routes
import productRoutes from "./routes/productRoute";

// Import Dashboard Routes
import dashboardRoutes from "./routes/dashboardRoute";

// Import Credit Routes
import  creditRoutes from "./routes/creditRoute";

// Import user Routes
import userRoutes from "./routes/userRoute";

// Import Post Routes
import postRoutes from "./routes/postRoute";

// Import Comment Routes
import commentRoutes from "./routes/commentRoute";

// Import report Routes
import  reportRoutes  from "./routes/reportRoute";

// Import pdf Rou
import pdfRoutes from "./routes/pdfRoute";

// Import Store Routes
import storeRoutes  from "./routes/storeRoute";

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

//---------- Start the server ----------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
