import express from "express";
import { chatAIWithLangChain, chatAIStreamWithLangChain, clearChatSectionMessages } from "../controllers/chatAIController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

// Default chat uses LangChain (chains/tools friendly)
router.post("/chat", authenticateToken as any, chatAIWithLangChain);

// Streaming with LangChain (SSE)
router.post("/chat/stream", authenticateToken as any, chatAIStreamWithLangChain);

// Clear a chat section's messages but keep the section
router.delete("/chat/section/:sessionId/messages", authenticateToken as any, clearChatSectionMessages as any);

export default router;
