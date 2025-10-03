import type { Server } from "http";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { ChatOpenAI } from "@langchain/openai";
import { PrismaClient as PrismaClient1 } from "../generated/client1";

const prisma = new PrismaClient1();
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
    const system = params.get("system") ||
      "You are Flexi AI for Flexi Business Hub. Be concise, actionable, and helpful.";
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

    // Store user message
    await prisma.chatMessage.create({ data: { sessionId, message: { role: "user", content: prompt } as any } });

    // Load history
    const history = await prisma.chatMessage.findMany({ where: { sessionId }, orderBy: { createdAt: "asc" }, take: 30 });
    const lcMessages = [
      { role: "system", content: system },
      ...history.map((m) => ({ role: (m.message as any).role, content: (m.message as any).content })),
    ];

    const llm = new ChatOpenAI({ model: MODEL_NAME, temperature, apiKey: process.env.OPENAI_API_KEY, streaming: true });

    let fullText = "";
    try {
      const stream = await llm.stream(lcMessages as any);
      for await (const chunk of stream) {
        const piece = typeof (chunk as any)?.content === "string"
          ? (chunk as any).content
          : Array.isArray((chunk as any)?.content)
          ? (chunk as any).content.map((c: any) => c?.text || c?.content || "").join("")
          : "";
        if (piece) {
          fullText += piece;
          ws.send(JSON.stringify({ token: piece }));
        }
      }
    } catch (e: any) {
      ws.send(JSON.stringify({ error: e?.message || "stream failed" }));
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
    const llm2 = new ChatOpenAI({ model: MODEL_NAME, temperature, apiKey: process.env.OPENAI_API_KEY });
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
