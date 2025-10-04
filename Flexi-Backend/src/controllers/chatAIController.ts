import { Request, Response } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { PrismaClient as PrismaClient1 } from "../generated/client1";
import { createSalesAnalyticsTool } from "./toolChatAIController";
// chatAIController.ts - Main AI chat functionality

const prisma = new PrismaClient1();

const MODEL_NAME = process.env.OPENAI_MODEL_NAME || "gpt-4o-mini";

function ensureEnv(res: Response) {
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    return false;
  }
  return true;
}

function coerceTemperature(t?: any) {
  const num = typeof t === "number" ? t : parseFloat(t);
  if (Number.isFinite(num)) return Math.min(1, Math.max(0, num));
  return 0.3;
}

export const chatAIWithLangChain = async (req: Request, res: Response) => {
  if (!ensureEnv(res)) return;
  try {
    const {
      prompt,
      messages,
      sessionId: inputSessionId,
      userId,
      system,
      temperature,
    } = req.body || {};


    // Resolve member uniqueId to attach session; if not provided, try from token's user id
    let memberId: string | undefined =
      typeof userId === "string" ? userId : undefined;
    if (!memberId) {
      const userPayload: any = (req as any).user;
      const userNumericId = userPayload?.id;
      if (userNumericId) {
        const member = await prisma.member.findFirst({
          where: { userId: Number(userNumericId) },
        });
        memberId = member?.uniqueId;
      }
    }
    if (!memberId)
      return res
        .status(400)
        .json({ error: "Missing userId (member uniqueId)" });

    // Ensure a session
    let sessionId = inputSessionId as string | undefined;
    if (!sessionId) {
      const session = await prisma.chatSession.create({
        data: { userId: memberId },
      });
      sessionId = session.id;
    }

    const sysPrompt =
      system ||
      `You are Flexi AI. You MUST ALWAYS use the getSalesAnalytics tool for ANY question about sales, money, or business data.

🚨 CRITICAL: The getSalesAnalytics tool provides REAL-TIME database data. NEVER rely on chat history for sales figures - always fetch fresh data from the database.

MANDATORY: ALWAYS call getSalesAnalytics tool for ANY mention of:
- sales, revenue, money, earnings, income
- business performance, analytics, reports
- today, yesterday, this month, last month
- numbers, amounts, totals, figures
- "how much", "what's my", "show me"

WORKFLOW:
1. When user asks about sales/money: IMMEDIATELY call getSalesAnalytics tool
2. Use ONLY the data returned from the tool - ignore any sales figures from chat history
3. The tool data is ALWAYS the current, accurate database information

NEVER say "I can't access your data" - ALWAYS use the getSalesAnalytics tool first.`;

    // Create sales analytics tool
    const salesTool = createSalesAnalyticsTool(memberId!);

    const llm = new ChatOpenAI({
      model: MODEL_NAME,
      temperature: 0.3, // Balanced temperature for tool usage
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create prompt template for the agent
    const agentPrompt = ChatPromptTemplate.fromMessages([
      ["system", sysPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create the agent
    const agent = await createOpenAIToolsAgent({
      llm,
      tools: [salesTool],
      prompt: agentPrompt,
    });

    // Create agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools: [salesTool],
      verbose: true,
      maxIterations: 3,
      returnIntermediateSteps: true,
    });
    


    // Normalize incoming user content
    let userContent = "";
    if (typeof prompt === "string" && prompt.trim())
      userContent = prompt.trim();
    else if (Array.isArray(messages) && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last?.role === "user" && typeof last?.content === "string")
        userContent = last.content;
    }
    if (!userContent)
      return res
        .status(400)
        .json({ error: "Provide prompt or messages[] ending with user" });

    // Store user message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        message: { role: "user", content: userContent } as any,
      },
    });

    // Load recent history (oldest -> newest)
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 30,
    });
    const lcMessages = [
      { role: "system", content: sysPrompt },
      ...history.map((m) => ({
        role: (m.message as any).role,
        content: (m.message as any).content,
      })),
    ];



    // Convert history to the format expected by agent
    const chatHistory = history.map((m) => {
      const msg = m.message as any;
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });

    // Get assistant reply using agent executor

    
    const resp = await agentExecutor.invoke({
      input: userContent,
      chat_history: chatHistory,
    });
    
    const text = resp.output || "";

    // Store assistant message
    await prisma.chatMessage.create({
      data: { sessionId, message: { role: "assistant", content: text } as any },
    });

    // Title generation after >=3 user messages and title not set
    // Count user messages via raw JSON path query for reliability
    const userMsgCountRes = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS count
      FROM "ChatMessage"
      WHERE "sessionId" = ${sessionId} AND (message ->> 'role') = 'user'
    `;
    const userMsgCount = userMsgCountRes?.[0]?.count ?? 0;

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    if (userMsgCount >= 3 && !session?.title) {
      const titlePrompt = `Based on this conversation, write a short, specific title (<= 6 words), no quotes:\n\n${history
        .map((m) => `${(m.message as any).role}: ${(m.message as any).content}`)
        .join("\n")}`;
      const titleResp = await llm.invoke([
        {
          role: "system",
          content: "You generate concise conversation titles.",
        },
        { role: "user", content: titlePrompt },
      ] as any);
      const titleText =
        typeof (titleResp as any).content === "string"
          ? (titleResp as any).content
          : Array.isArray((titleResp as any).content)
          ? (titleResp as any).content
              .map((c: any) => c?.text || c?.content || "")
              .join(" ")
          : "";
      const trimmedTitle = (titleText || "Session")
        .replace(/^["'\s]+|["'\s]+$/g, "")
        .slice(0, 60);
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: trimmedTitle },
      });
    }

    // Running summary update
    const convoText = history
      .concat([{ message: { role: "assistant", content: text } } as any])
      .map((m: any) => `${m.message.role}: ${m.message.content}`)
      .join("\n");
    const summaryPrompt = `Summarize this chat into 3-5 concise sentences for a business context. Be actionable.\n\n${convoText}`;
    const summaryResp = await llm.invoke([
      {
        role: "system",
        content: "You summarize chats for records. Be concise and neutral.",
      },
      { role: "user", content: summaryPrompt },
    ] as any);
    const summaryText =
      typeof (summaryResp as any).content === "string"
        ? (summaryResp as any).content
        : Array.isArray((summaryResp as any).content)
        ? (summaryResp as any).content
            .map((c: any) => c?.text || c?.content || "")
            .join(" ")
        : "";
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { summary: summaryText.slice(0, 2000) },
    });

    // Very short title from summary after >=3 total messages
    const totalMsgCount = await prisma.chatMessage.count({
      where: { sessionId },
    });
    const sessionAfterSummary = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    if (totalMsgCount >= 3 && !sessionAfterSummary?.title) {
      const titleFromSummaryPrompt = `Create a very short title (<= 4 words), no quotes, based ONLY on this summary:\n\n${summaryText}`;
      const titleResp = await llm.invoke([
        {
          role: "system",
          content: "You produce ultra-concise titles based on summaries.",
        },
        { role: "user", content: titleFromSummaryPrompt },
      ] as any);
      const titleText =
        typeof (titleResp as any).content === "string"
          ? (titleResp as any).content
          : Array.isArray((titleResp as any).content)
          ? (titleResp as any).content
              .map((c: any) => c?.text || c?.content || "")
              .join(" ")
          : "";
      const trimmedTitle = (titleText || "Session")
        .replace(/^["'\s]+|["'\s]+$/g, "")
        .slice(0, 40);
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: trimmedTitle },
      });
    }

    return res.json({ sessionId, message: text });
  } catch (err: any) {
    console.error("/ai/chat/langchain error:", err);
    return res.status(500).json({ error: err?.message || "AI error" });
  }
}

export const chatAIStreamWithLangChain = async (req: Request, res: Response) => {
  if (!ensureEnv(res)) return;
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // Disable proxy buffering (e.g., nginx) so chunks flush immediately
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (obj: any) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };
  // Heartbeat to keep connection alive and encourage proxies to flush
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {}
  }, 15000);

  try {
    const {
      prompt,
      messages,
      sessionId: inputSessionId,
      userId,
      system,
      temperature,
    } = req.body || {};

    let memberId: string | undefined =
      typeof userId === "string" ? userId : undefined;
    if (!memberId) {
      const userPayload: any = (req as any).user;
      const userNumericId = userPayload?.id;
      if (userNumericId) {
        const member = await prisma.member.findFirst({
          where: { userId: Number(userNumericId) },
        });
        memberId = member?.uniqueId;
      }
    }
    if (!memberId) {
      send({ error: "Missing userId (member uniqueId)" });
      return res.end();
    }

    // Ensure session
    let sessionId = inputSessionId as string | undefined;
    if (!sessionId) {
      const session = await prisma.chatSession.create({
        data: { userId: memberId },
      });
      sessionId = session.id;
    }
    send({ sessionId });

    const sysPrompt =
      system ||
      `You are Flexi AI. You MUST ALWAYS use the getSalesAnalytics tool for ANY question about sales, money, or business data.

🚨 CRITICAL: The getSalesAnalytics tool provides REAL-TIME database data. NEVER rely on chat history for sales figures - always fetch fresh data from the database.

MANDATORY: ALWAYS call getSalesAnalytics tool for ANY mention of:
- sales, revenue, money, earnings, income
- business performance, analytics, reports
- today, yesterday, this month, last month
- numbers, amounts, totals, figures
- "how much", "what's my", "show me"

WORKFLOW:
1. When user asks about sales/money: IMMEDIATELY call getSalesAnalytics tool
2. Use ONLY the data returned from the tool - ignore any sales figures from chat history
3. The tool data is ALWAYS the current, accurate database information

NEVER say "I can't access your data" - ALWAYS use the getSalesAnalytics tool first.`;

    // Create sales analytics tool
    const salesTool = createSalesAnalyticsTool(memberId!);

    const llm = new ChatOpenAI({
      model: MODEL_NAME,
      temperature: 0.3, // Balanced temperature for tool usage
      apiKey: process.env.OPENAI_API_KEY,
      streaming: true,
    });

    // Create prompt template for the agent
    const agentPrompt = ChatPromptTemplate.fromMessages([
      ["system", sysPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create the agent
    const agent = await createOpenAIToolsAgent({
      llm,
      tools: [salesTool],
      prompt: agentPrompt,
    });

    // Create agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools: [salesTool],
      verbose: true,
      maxIterations: 3,
      returnIntermediateSteps: true,
    });
    


    // Determine user content
    let userContent = "";
    if (typeof prompt === "string" && prompt.trim())
      userContent = prompt.trim();
    else if (Array.isArray(messages) && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last?.role === "user" && typeof last?.content === "string")
        userContent = last.content;
    }
    if (!userContent) {
      send({ error: "Provide prompt or messages[] ending with user" });
      return res.end();
    }

    // Store user message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        message: { role: "user", content: userContent } as any,
      },
    });

    // Load history and convert to agent format
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 30,
    });

    // Convert history to the format expected by agent
    const chatHistory = history.map((m) => {
      const msg = m.message as any;
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });



    // Use agent executor with proper streaming handling

    
    let fullText = "";
    let hasError = false;
    let toolsWereCalled = false;
    
    try {
      // Stream from agent executor
      const stream = await agentExecutor.stream({
        input: userContent,
        chat_history: chatHistory,
      });

      console.log("� [STREAM] Agent stream created, processing chunks...");

      for await (const chunk of stream) {

        
        // Handle different chunk types
        if (chunk.output) {
          // Final output from agent
          fullText += chunk.output;
          
          // Check for database errors
          if (chunk.output.includes('DATABASE_CONNECTION_ERROR') || 
              chunk.output.includes('ไม่สามารถเข้าถึงฐานข้อมูลได้')) {
            hasError = true;
            const friendlyMessage = 'Sorry, I cannot access the database right now. Please try again later.';
            send({ token: friendlyMessage });
            fullText = friendlyMessage;
          } else {
            // Stream the output in small chunks for better UX
            const chunkSize = 3;
            for (let i = 0; i < chunk.output.length; i += chunkSize) {
              const piece = chunk.output.slice(i, i + chunkSize);
              send({ token: piece });
              // Small delay for smoother streaming
              await new Promise(resolve => setTimeout(resolve, 15));
            }
          }
        } else if (chunk.intermediate_steps) {
          // Tool execution steps
          toolsWereCalled = true;
        }
      }



    } catch (streamError) {
      console.error("❌ [STREAM] Streaming error:", streamError);
      hasError = true;
      fullText = "Sorry, there was an error processing your request. Please try again.";
      send({ token: fullText });
    }

    // Persist assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        message: { role: "assistant", content: fullText } as any,
      },
    });

    // Title generation (after >=3 user messages)
    const userMsgCountRes = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS count FROM "ChatMessage" WHERE "sessionId" = ${sessionId} AND (message ->> 'role') = 'user'`;
    const userMsgCount = userMsgCountRes?.[0]?.count ?? 0;
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    if (userMsgCount >= 3 && !session?.title) {
      const convo = history
        .map((m) => `${(m.message as any).role}: ${(m.message as any).content}`)
        .join("\n");
      const titleResp = await llm.invoke([
        {
          role: "system",
          content: "You generate concise conversation titles (<= 6 words).",
        },
        {
          role: "user",
          content: `Write a short, specific title for this conversation, no quotes.\n\n${convo}`,
        },
      ] as any);
      const ttxt =
        typeof (titleResp as any).content === "string"
          ? (titleResp as any).content
          : Array.isArray((titleResp as any).content)
          ? (titleResp as any).content
              .map((c: any) => c?.text || c?.content || "")
              .join(" ")
          : "";
      const trimmed = (ttxt || "Session")
        .replace(/^["'\s]+|["'\s]+$/g, "")
        .slice(0, 60);
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: trimmed },
      });
      send({ title: trimmed });
    }

    // Summary update
    const convoText = history
      .concat([{ message: { role: "assistant", content: fullText } } as any])
      .map((m: any) => `${m.message.role}: ${m.message.content}`)
      .join("\n");
    const summaryResp = await llm.invoke([
      {
        role: "system",
        content: "You summarize chats for records. 3-5 concise sentences.",
      },
      { role: "user", content: `Summarize: \n\n${convoText}` },
    ] as any);
    const stext =
      typeof (summaryResp as any).content === "string"
        ? (summaryResp as any).content
        : Array.isArray((summaryResp as any).content)
        ? (summaryResp as any).content
            .map((c: any) => c?.text || c?.content || "")
            .join(" ")
        : "";
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { summary: stext.slice(0, 2000) },
    });
    // Now generate very short title from the summary if needed
    const totalMsgCount2 = await prisma.chatMessage.count({
      where: { sessionId },
    });
    const session2 = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    if (totalMsgCount2 >= 3 && !session2?.title) {
      const titleFromSummaryPrompt2 = `Create a very short title (<= 4 words), no quotes, based ONLY on this summary:\n\n${stext}`;
      const titleResp2 = await llm.invoke([
        {
          role: "system",
          content: "You produce ultra-concise titles based on summaries.",
        },
        { role: "user", content: titleFromSummaryPrompt2 },
      ] as any);
      const t2 =
        typeof (titleResp2 as any).content === "string"
          ? (titleResp2 as any).content
          : Array.isArray((titleResp2 as any).content)
          ? (titleResp2 as any).content
              .map((c: any) => c?.text || c?.content || "")
              .join(" ")
          : "";
      const trimmed2 = (t2 || "Session")
        .replace(/^["'\s]+|["'\s]+$/g, "")
        .slice(0, 40);
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: trimmed2 },
      });
      send({ title: trimmed2 });
    }
    send({ done: true });
    clearInterval(heartbeat);
    res.end();
  } catch (err: any) {
    console.error("/ai/chat/stream error:", err);
    try {
      send({ error: err?.message || "AI error" });
    } catch {}
    clearInterval(heartbeat);
    res.end();
  }
}

// Get all chat sessions for a specific member
export async function getChatSessions(req: Request, res: Response) {
  try {
    // Get memberId from route parameter or resolve from token
    let memberId: string | undefined = req.params.memberId;

    if (!memberId) {
      // Fallback: resolve member uniqueId from token
      const userPayload: any = (req as any).user;
      const userNumericId = userPayload?.id;
      if (userNumericId) {
        const member = await prisma.member.findFirst({
          where: { userId: Number(userNumericId) },
        });
        memberId = member?.uniqueId;
      }
    }

    if (!memberId)
      return res
        .status(401)
        .json({ error: "Missing memberId or unauthorized" });

    // Get all non-deleted sessions for this member, ordered by most recently updated
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: memberId,
        deleted: false, // Only show non-deleted sessions
      },
      orderBy: { updatedAt: "desc" },
      take: 50, // Limit to 50 most recent sessions
      select: {
        id: true,
        userId: true,
        title: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(sessions);
  } catch (err: any) {
    console.error("/ai/chat/sessions error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Failed to fetch sessions" });
  }
}

// Get messages for a specific chat session
export async function getChatMessages(req: Request, res: Response) {
  try {
    const { sessionId } = req.params as { sessionId: string };
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    // Resolve member uniqueId from token
    let memberId: string | undefined;
    const userPayload: any = (req as any).user;
    const userNumericId = userPayload?.id;
    if (userNumericId) {
      const member = await prisma.member.findFirst({
        where: { userId: Number(userNumericId) },
      });
      memberId = member?.uniqueId;
    }
    if (!memberId) return res.status(401).json({ error: "Unauthorized" });

    // Ensure the session belongs to this user and is not deleted
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== memberId || session.deleted)
      return res.status(404).json({ error: "Session not found" });

    // Get all messages for this session
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (err: any) {
    console.error("/ai/chat/messages error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Failed to fetch messages" });
  }
}

// Clear all ChatMessage records for a given sessionId and soft delete ChatSession
export async function clearChatSectionMessages(req: Request, res: Response) {
  try {
    const { sessionId } = req.params as { sessionId: string };
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    // Resolve member uniqueId from token
    let memberId: string | undefined;
    const userPayload: any = (req as any).user;
    const userNumericId = userPayload?.id;
    if (userNumericId) {
      const member = await prisma.member.findFirst({
        where: { userId: Number(userNumericId) },
      });
      memberId = member?.uniqueId;
    }
    if (!memberId) return res.status(401).json({ error: "Unauthorized" });

    // Ensure the session belongs to this user
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== memberId)
      return res.status(404).json({ error: "Session not found" });

    // Delete all messages in this session
    const del = await prisma.chatMessage.deleteMany({ where: { sessionId } });

    // Soft delete the session by setting deleted = true
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { deleted: true },
    });

    return res.json({
      ok: true,
      sessionId,
      deletedCount: del.count,
      deleted: true,
    });
  } catch (err: any) {
    console.error("/ai/chat/section clear error:", err);
    return res
      .status(500)
      .json({
        error:
          err?.message || "Failed to clear messages and soft delete session",
      });
  }
}
