import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "@/components/CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { CallAI, streamChat, StreamEvent } from "@/api/chat_ai_api";
import MarkdownMessage from "@/components/MarkdownMessage";
import * as Clipboard from "expo-clipboard";
import i18n from "@/i18n";

type Role = "assistant" | "user";
type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  pending?: boolean; // true when assistant response is streaming
};

const STORAGE_KEY = "chat_ai_messages_v1";

export default function ChatAI() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [useStream, setUseStream] = useState(true);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Initial seed message and restore from storage
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setMessages(JSON.parse(raw));
          return;
        }
      } catch {}
      setMessages([
        {
          id: String(Date.now()),
          role: "assistant",
          content:
            "Hi! I’m your Flexi AI assistant. Ask me anything about your business data, reports, or features.",
          createdAt: Date.now(),
        },
      ]);
    };
    load();
  }, []);

  // Persist messages
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    // For inverted FlatList, scroll to index 0 to go to bottom
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    scrollToBottom();

    setIsThinking(true);
    try {
      if (useStream) {
        // Create a placeholder assistant message we will grow with incoming tokens
        let assistantId = `${Date.now()}-assistant`;
        setMessages((prev) => [
          { id: assistantId, role: "assistant", content: "", createdAt: Date.now(), pending: true },
          ...prev,
        ]);

        // Consume SSE stream
  await streamChat({ prompt: text, sessionId }, ({ token, sessionId: sid, title, done, error }: StreamEvent) => {
          if (sid && !sessionId) setSessionId(sid);
          if (title) {
            // title UI not shown here, but could be lifted into state later
          }
          if (error) {
            // Replace assistant placeholder with error text
            setMessages((prev) => {
              return prev.map((m) =>
                m.id === assistantId ? { ...m, content: "Sorry, streaming failed.", pending: false } : m
              );
            });
          }
          if (typeof token === "string" && token.length) {
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)));
          }
          if (done) {
            // mark assistant message as complete
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)));
            scrollToBottom();
          }
        });
      } else {
        // Non-stream fallback
        const { message, sessionId: returnedSessionId } = await CallAI.chat({ prompt: text, sessionId } as any);
        if (!sessionId && returnedSessionId) setSessionId(returnedSessionId);
        const assistantMsg: Message = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: message || "",
          createdAt: Date.now(),
        };
        setMessages((prev) => [assistantMsg, ...prev]);
        scrollToBottom();
      }
    } catch (e: any) {
      const assistantMsg: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: "Sorry, I couldn’t get a response. Please try again.",
        createdAt: Date.now(),
      };
      setMessages((prev) => [assistantMsg, ...prev]);
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, scrollToBottom, messages]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <ChatBubble key={item.id} message={item} theme={theme} />
    ),
    [theme]
  );

  const listEmpty = useMemo(
    () => (
      <View className="flex-1 items-center justify-center py-10">
        <Ionicons
          name="chatbubbles-outline"
          size={48}
          color={theme === "dark" ? "#7a7a7a" : "#a1a1aa"}
        />
        <CustomText className={`mt-3 `}>Start the conversation</CustomText>
      </View>
    ),
    [theme]
  );

  const canSend = input.trim().length > 0 && !isThinking;

  return (
    <SafeAreaView
      edges={["left", "right"]}
      className={`flex-1 ${useBackgroundColorClass()}`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 0}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 py-2 flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="sparkles-outline"
              size={22}
              color={theme === "dark" ? "#a1a1aa" : "#3f3f46"}
            />
            <CustomText weight="semibold" className={`text-lg`}>
              Flexi AI
            </CustomText>
          </View>
          {isThinking && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator
                size="small"
                color={theme === "dark" ? "#a1a1aa" : "#3f3f46"}
              />
              <CustomText className={`text-xs`}>Thinking…</CustomText>
            </View>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        />

        {/* Composer */}
        <View className="px-3 pb-2">
          <View className="flex-row items-end gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-white dark:bg-zinc-900">
            <TouchableOpacity
              className="p-2 rounded-xl"
              accessibilityLabel="More actions"
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={theme === "dark" ? "#d4d4d8" : "#3f3f46"}
              />
            </TouchableOpacity>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message"
              placeholderTextColor={theme === "dark" ? "#71717a" : "#a1a1aa"}
              multiline
              className={`flex-1 pt-3 max-h-36 min-h-[40px] text-base`}
              style={[
          {
            fontFamily:
              i18n.language === "th"
                ? "IBMPlexSansThai-Medium"
                : "Poppins-Regular",
            color: theme === "dark" ? "#ffffff" : "#000000",
          },
        ]}
              autoCapitalize="sentences"
              autoCorrect
              returnKeyType="send"
              onSubmitEditing={() => onSend()}
            />

            <TouchableOpacity
              onPress={onSend}
              disabled={!canSend}
              className={`p-2 rounded-xl ${
                canSend ? "bg-teal-300" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
              accessibilityLabel="Send message"
            >
              <Ionicons
                name="send"
                size={18}
                color={
                  canSend ? "white" : theme === "dark" ? "#c4c4c5" : "#fafafa"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Typing bubble */}
          {isThinking && (
            <View className="mt-2 self-start max-w-[85%] rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-3 py-2">
              <TypingDots theme={theme} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChatBubble({
  message,
  theme,
}: {
  message: Message;
  theme: "light" | "dark";
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(message.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [message.content]);

  const iconColor = isUser ? "#ffffff" : theme === "dark" ? "#d4d4d8" : "#52525b";
  const showCopy = isUser || !message.pending;

  return (
    <View className={`w-full flex-row ${isUser ? "justify-end" : "justify-start"}`}>
      <View
        className={`max-w-[85%] px-3 py-2 rounded-2xl ${
          isUser
            ? "bg-teal-300 rounded-br-sm"
            : "bg-zinc-100 dark:bg-zinc-800 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <CustomText
            weight="regular"
            className={`${
              isUser
                ? "text-white"
                : theme === "dark"
                ? "text-zinc-200"
                : "text-zinc-800"
            }`}
          >
            {message.content}
          </CustomText>
        ) : (
          <MarkdownMessage content={message.content} />
        )}

        {/* Footer row: time left, copy button right */}
        <View className="mt-1 flex-row items-center justify-between">
          <CustomText
            className={`text-[10px] ${
              isUser ? "text-emerald-50/80" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {formatTime(message.createdAt)}
          </CustomText>
          {showCopy ? (
            <TouchableOpacity
              accessibilityLabel="Copy message"
              onPress={onCopy}
              className="p-1.5 rounded-md"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 } as any}
            >
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={14}
                color={copied ? (isUser ? "#ffffff" : "#22c55e") : iconColor}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 16, height: 16 }} />
          )}
        </View>
      </View>
    </View>
  );
}

function TypingDots({ theme }: { theme: "light" | "dark" }) {
  const dotColor = theme === "dark" ? "#d4d4d8" : "#52525b";
  return (
    <View className="flex-row items-center gap-1">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: dotColor,
            opacity: 0.6 + i * 0.15,
          }}
        />
      ))}
    </View>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
