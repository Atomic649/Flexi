import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { API_URL } from "@/utils/config";
import { getToken } from "@/utils/utility";

export type ChatRole = "user" | "assistant" | "system";
export type ChatMessage = { role: ChatRole; content: string };

export const CallAI = {
  async chat(payload: {
    messages?: ChatMessage[];
    prompt?: string;
    system?: string;
    temperature?: number;
    sessionId?: string;
  }): Promise<{ message: string; sessionId?: string }> {
    const axios = await getAxiosWithAuth();
    const { data } = await axios.post("/ai/chat", payload);
    return data;
  },
};

export type StreamEvent = {
  token?: string;
  sessionId?: string;
  title?: string;
  done?: boolean;
  error?: string;
};

export async function streamChat(
  payload: { prompt?: string; messages?: ChatMessage[]; system?: string; temperature?: number; sessionId?: string },
  onEvent: (e: StreamEvent) => void
) {
  try {
    const token = await getToken();
    // If running on web, prefer SSE; on native, prefer WebSocket
    const isWeb = typeof window !== "undefined" && typeof (window as any).EventSource !== "undefined";
    if (!isWeb) {
      // WebSocket path for RN native
      const url = new URL(`${API_URL.replace(/\/$/, "")}/ai/chat/ws`);
      if (payload.prompt) url.searchParams.set("prompt", payload.prompt);
      if (payload.sessionId) url.searchParams.set("sessionId", payload.sessionId);
      if (payload.system) url.searchParams.set("system", payload.system);
      if (typeof payload.temperature !== "undefined") url.searchParams.set("temperature", String(payload.temperature));
      url.searchParams.set("token", token || "");
      await new Promise<void>((resolve) => {
        const ws = new WebSocket(url.toString());
        ws.onmessage = (ev) => {
          try { onEvent(JSON.parse(ev.data)); } catch {}
        };
        ws.onerror = () => {
          onEvent({ error: "ws error" });
          resolve();
        };
        ws.onclose = () => resolve();
      });
      return;
    }

    const res = await fetch(`${API_URL}ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // If streaming unsupported, fallback to single shot
    const body: any = (res as any).body;
    if (!body || typeof body.getReader !== "function") {
      const single = await (await getAxiosWithAuth()).post("/ai/chat", payload);
      const { message, sessionId } = single.data || {};
      if (sessionId) onEvent({ sessionId });
      if (message) onEvent({ token: message });
      onEvent({ done: true });
      return;
    }

  const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        if (chunk.startsWith("data:")) {
          const jsonStr = chunk.replace(/^data:\s?/, "");
          try {
            const evt = JSON.parse(jsonStr);
            onEvent(evt);
          } catch {}
        }
      }
    }
    onEvent({ done: true });
  } catch (e: any) {
    onEvent({ error: e?.message || "stream failed" });
    onEvent({ done: true });
  }
}
