import express from "express";
import { checkCustomer } from "../controllers/customerController";

const router = express.Router();

router.post("/check", checkCustomer);

export default router;
