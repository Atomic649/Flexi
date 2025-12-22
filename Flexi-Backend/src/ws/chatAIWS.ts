import type { Server } from "http";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createSalesAnalyticsTool } from "../controllers/toolChatAIController";

// WebSocket handler for AI chat functionality

import { flexiDBPrismaClient } from "../../lib/PrismaClient1";;

const prisma = flexiDBPrismaClient;


const MODEL_NAME = process.env.OPENAI_MODEL_NAME || "gpt-4o-mini";

function coerceTemperature(t?: any) {
  const num = typeof t === "number" ? t : parseFloat(t);
  if (Number.isFinite(num)) return Math.min(1, Math.max(0, num));
  return 0.3;
}

export function attachChatAIWSServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ai/chat/ws" });

  wss.on("connection", async (ws, req) => {
    const params = new URLSearchParams((req.url || "").split("?")[1]);
    const token = params.get("token");
    const temperature = coerceTemperature(params.get("temperature"));
    let sessionId = params.get("sessionId") || undefined;
    const prompt = params.get("prompt") || "";



    // Verify token
    let userNumericId: number | undefined;
    try {
      const payload: any = jwt.verify(token || "", "secret");
      userNumericId = payload?.id;
    } catch {
      ws.close(4001, "unauthorized");
      return;
    }

    // Resolve memberId
    let memberId: string | undefined;
    if (userNumericId) {
      const member = await prisma.member.findFirst({ where: { userId: Number(userNumericId) } });
      memberId = member?.uniqueId;
    }
    if (!memberId) {
      ws.close(4002, "no member");
      return;
    }



    // Ensure session
    if (!sessionId) {
      const s = await prisma.chatSession.create({ data: { userId: memberId } });
      sessionId = s.id;
      ws.send(JSON.stringify({ sessionId }));
    }

    if (!prompt.trim()) {
      ws.send(JSON.stringify({ error: "Empty prompt provided" }));
      ws.close();
      return;
    }

    // Store user message
    await prisma.chatMessage.create({ data: { sessionId, message: { role: "user", content: prompt } as any } });

    const sysPrompt = `You are Flexi AI. You MUST ALWAYS use the getSalesAnalytics tool for ANY question about sales, money, or business data.

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

    // Load recent history (oldest -> newest)
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

    let fullText = "";
    try {
      // Get assistant reply using agent executor
      const resp = await agentExecutor.invoke({
        input: prompt,
        chat_history: chatHistory,
      });

      fullText = resp.output || "";
      
      // Send the complete response (WebSocket doesn't need streaming like SSE)
      ws.send(JSON.stringify({ token: fullText }));
      
    } catch (e: any) {
      console.error("Agent execution error:", e);
      ws.send(JSON.stringify({ error: e?.message || "Agent execution failed" }));
      ws.close();
      return;
    }

    // Persist assistant message
    await prisma.chatMessage.create({ data: { sessionId, message: { role: "assistant", content: fullText } as any } });

    // Update summary and maybe title (short from summary)
    const convoText = history
      .concat([{ message: { role: "assistant", content: fullText } } as any])
      .map((m: any) => `${m.message.role}: ${m.message.content}`)
      .join("\n");
    const llm2 = new ChatOpenAI({ model: MODEL_NAME, temperature: 0.3, apiKey: process.env.OPENAI_API_KEY });
    const summaryResp = await llm2.invoke([
      { role: "system", content: "You summarize chats for records. 3-5 concise sentences." },
      { role: "user", content: `Summarize: \n\n${convoText}` },
    ] as any);
    const stext = typeof (summaryResp as any).content === "string" ? (summaryResp as any).content : Array.isArray((summaryResp as any).content) ? (summaryResp as any).content.map((c: any) => c?.text || c?.content || "").join(" ") : "";
    await prisma.chatSession.update({ where: { id: sessionId }, data: { summary: stext.slice(0, 2000) } });

    const count = await prisma.chatMessage.count({ where: { sessionId } });
    const sFetched = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (count >= 3 && !sFetched?.title) {
      const titleResp = await llm2.invoke([
        { role: "system", content: "You produce ultra-concise titles based on summaries." },
        { role: "user", content: `Create a very short title (<= 4 words), no quotes, based ONLY on this summary:\n\n${stext}` },
      ] as any);
      const t2 = typeof (titleResp as any).content === "string" ? (titleResp as any).content : Array.isArray((titleResp as any).content) ? (titleResp as any).content.map((c: any) => c?.text || c?.content || "").join(" ") : "";
      const trimmed2 = (t2 || "Session").replace(/^["'\s]+|["'\s]+$/g, "").slice(0, 40);
      await prisma.chatSession.update({ where: { id: sessionId }, data: { title: trimmed2 } });
      ws.send(JSON.stringify({ title: trimmed2 }));
    }
    ws.send(JSON.stringify({ done: true }));
    ws.close();
  });

  return wss;
}
