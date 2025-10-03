import express from "express";
import { chatAIWithLangChain, chatAIStreamWithLangChain } from "../controllers/chatAIController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

// Default chat uses LangChain (chains/tools friendly)
router.post("/chat", authenticateToken as any, chatAIWithLangChain);

// Streaming with LangChain (SSE)
router.post("/chat/stream", authenticateToken as any, chatAIStreamWithLangChain);

export default router;
