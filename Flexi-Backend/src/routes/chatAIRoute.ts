import express from "express";
import { chatAIWithLangChain, chatAIStreamWithLangChain, clearChatSectionMessages, getChatSessions, getChatMessages } from "../controllers/chatAIController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

// Default chat uses LangChain (chains/tools friendly)
router.post("/chat", authenticateToken as any, chatAIWithLangChain);

// Streaming with LangChain (SSE)
router.post("/chat/stream", authenticateToken as any, chatAIStreamWithLangChain);

// Get all chat sessions for a specific member
router.get("/chat/sessions/:memberId", authenticateToken as any, getChatSessions as any);

// Get all chat sessions for the authenticated user (fallback)
router.get("/chat/sessions", authenticateToken as any, getChatSessions as any);

// Get messages for a specific session
router.get("/chat/session/:sessionId/messages", authenticateToken as any, getChatMessages as any);

// Clear a chat section's messages but keep the section
router.delete("/chat/section/:sessionId/messages", authenticateToken as any, clearChatSectionMessages as any);

export default router;
