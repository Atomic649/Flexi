import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

type Conversation = {
  key: string; // local client key
  sessionId?: string; // server session id
  title?: string; // server-provided
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY_OLD = "chat_ai_messages_v1";
const STORAGE_KEY = "chat_ai_conversations_v1";

export default function ChatAI() {
  const { theme } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Responsive breakpoint detection
  const screenData = Dimensions.get('window');
  const isLargeScreen = screenData.width >= 768; // Tablet/desktop breakpoint

  const createInitialConversation = useCallback((): Conversation => ({
    key: String(Date.now()),
    messages: [
      {
        id: `${Date.now()}-greet`,
        role: "assistant",
        content: "New chat started. Ask me anything!",
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }), []);

  const deleteConversation = useCallback(
    (idx: number) => {
      setConversations((prev) => {
        const target = prev[idx];
        // fire and forget backend clear if sessionId exists
        if (target?.sessionId) {
          CallAI.clearSectionMessages(target.sessionId).catch(() => {});
        }
        let next = prev.filter((_, i) => i !== idx);
        if (next.length === 0) {
          next = [createInitialConversation()];
        }
        let newIdx = activeIndex;
        if (idx === activeIndex) newIdx = Math.min(idx, next.length - 1);
        else if (idx < activeIndex) newIdx = Math.max(0, activeIndex - 1);
        setActiveIndex(newIdx);
        return next;
      });
    },
    [activeIndex, createInitialConversation]
  );

  // Initial load: restore conversations or migrate from old storage
  useEffect(() => {
    const load = async () => {
      try {
        const rawNew = await AsyncStorage.getItem(STORAGE_KEY);
        if (rawNew) {
          const parsed: Conversation[] = JSON.parse(rawNew);
          setConversations(parsed);
          return;
        }
        // migrate old single-message storage if present
        const rawOld = await AsyncStorage.getItem(STORAGE_KEY_OLD);
        if (rawOld) {
          const oldMsgs: Message[] = JSON.parse(rawOld);
          const conv: Conversation = {
            key: String(Date.now()),
            messages: oldMsgs,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setConversations([conv]);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([conv]));
          await AsyncStorage.removeItem(STORAGE_KEY_OLD);
          return;
        }
      } catch {}
      // seed with a first conversation and a greeting message
  setConversations([createInitialConversation()]);
    };
    load();
  }, []);

  // Persist conversations
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)).catch(() => {});
  }, [conversations]);

  const scrollToBottom = useCallback(() => {
    // For inverted FlatList, scroll to index 0 to go to bottom
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

  const activeConv = conversations[activeIndex];
  const sessionId = activeConv?.sessionId;

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setConversations((prev) => {
      const next = [...prev];
      const conv = { ...next[activeIndex] };
      conv.messages = [userMsg, ...(conv.messages || [])];
      conv.updatedAt = Date.now();
      next[activeIndex] = conv;
      return next;
    });
    setInput("");
    scrollToBottom();

    setIsThinking(true);
    try {
      if (useStream) {
        // Create a placeholder assistant message we will grow with incoming tokens
        let assistantId = `${Date.now()}-assistant`;
        setConversations((prev) => {
          const next = [...prev];
          const conv = { ...next[activeIndex] };
          conv.messages = [
            { id: assistantId, role: "assistant", content: "", createdAt: Date.now(), pending: true },
            ...(conv.messages || []),
          ];
          conv.updatedAt = Date.now();
          next[activeIndex] = conv;
          return next;
        });

        // Consume SSE stream
  await streamChat({ prompt: text, sessionId }, ({ token, sessionId: sid, title, done, error }: StreamEvent) => {
          if (sid && !sessionId) {
            setConversations((prev) => {
              const next = [...prev];
              const conv = { ...next[activeIndex], sessionId: sid };
              next[activeIndex] = conv;
              return next;
            });
          }
          if (title) {
            setConversations((prev) => {
              const next = [...prev];
              const conv = { ...next[activeIndex], title };
              next[activeIndex] = conv;
              return next;
            });
          }
          if (error) {
            // Replace assistant placeholder with error text
            setConversations((prev) => {
              const next = [...prev];
              const conv = { ...next[activeIndex] };
              conv.messages = conv.messages.map((m) =>
                m.id === assistantId ? { ...m, content: "Sorry, streaming failed.", pending: false } : m
              );
              next[activeIndex] = conv;
              return next;
            });
          }
          if (typeof token === "string" && token.length) {
            setConversations((prev) => {
              const next = [...prev];
              const conv = { ...next[activeIndex] };
              conv.messages = conv.messages.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + token } : m
              );
              next[activeIndex] = conv;
              return next;
            });
          }
          if (done) {
            // mark assistant message as complete
            setConversations((prev) => {
              const next = [...prev];
              const conv = { ...next[activeIndex] };
              conv.messages = conv.messages.map((m) =>
                m.id === assistantId ? { ...m, pending: false } : m
              );
              conv.updatedAt = Date.now();
              next[activeIndex] = conv;
              return next;
            });
            scrollToBottom();
          }
        });
      } else {
        // Non-stream fallback
        const { message, sessionId: returnedSessionId } = await CallAI.chat({ prompt: text, sessionId } as any);
        const assistantMsg: Message = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: message || "",
          createdAt: Date.now(),
        };
        setConversations((prev) => {
          const next = [...prev];
          const conv = { ...next[activeIndex] };
          if (!conv.sessionId && returnedSessionId) conv.sessionId = returnedSessionId;
          conv.messages = [assistantMsg, ...(conv.messages || [])];
          conv.updatedAt = Date.now();
          next[activeIndex] = conv;
          return next;
        });
        scrollToBottom();
      }
    } catch (e: any) {
      const assistantMsg: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: "Sorry, I couldn’t get a response. Please try again.",
        createdAt: Date.now(),
      };
      setConversations((prev) => {
        const next = [...prev];
        const conv = { ...next[activeIndex] };
        conv.messages = [assistantMsg, ...(conv.messages || [])];
        conv.updatedAt = Date.now();
        next[activeIndex] = conv;
        return next;
      });
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, scrollToBottom, conversations, activeIndex]);

  const messages = useMemo(() => conversations[activeIndex]?.messages ?? [], [conversations, activeIndex]);

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

  // Helper to render conversation label
  const getConversationLabel = useCallback((c: Conversation) => {
    if (c.title && c.title.trim()) return c.title.trim();
    const m = (c.messages || []).find((mm) => mm.role === "user");
    if (!m) return "New Chat";
    const s = (m.content || "").trim();
    if (!s) return "New Chat";
    return s.length > 50 ? s.slice(0, 50) + "…" : s;
  }, []);

  // Sidebar for large screens
  const renderSidebar = () => (
    <View className={`w-80 border-r border-zinc-200 dark:border-zinc-800 ${useBackgroundColorClass()}`}>
      {/* Sidebar Header */}
      <View className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={theme === "dark" ? "#a1a1aa" : "#3f3f46"}
          />
          <CustomText weight="semibold" className="text-lg">
            Flexi AI
          </CustomText>
        </View>
      </View>

      {/* New Chat Button */}
      <View className="p-3">
        <TouchableOpacity
          onPress={() => {
            const newConv = createInitialConversation();
            setConversations((prev) => [newConv, ...prev]);
            setActiveIndex(0);
          }}
          className="flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-300 dark:bg-teal-900/30"
          accessibilityLabel="Create new chat section"
        >
          <Ionicons name="add" size={16} color={theme === "dark" ? "#34d399" : "#059669"} />
          <CustomText weight="semibold" style={{ color: theme === "dark" ? "#34d399" : "#065f46" }}>
            New Chat
          </CustomText>
        </TouchableOpacity>
      </View>

      {/* Chat History */}
      <ScrollView className="flex-1 px-3">
        {conversations.map((c, idx) => {
          const active = idx === activeIndex;
          const label = getConversationLabel(c);
          return (
            <View
              key={c.key}
              className={`mb-2 rounded-lg ${
                active ? "bg-teal-100 dark:bg-teal-900/30" : "bg-transparent"
              }`}
            >
              <TouchableOpacity
                onPress={() => setActiveIndex(idx)}
                className="p-3 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  <CustomText
                    weight={active ? "semibold" : "regular"}
                    className={`text-sm ${
                      active
                        ? theme === "dark"
                          ? "text-teal-300"
                          : "text-teal-700"
                        : theme === "dark"
                        ? "text-zinc-200"
                        : "text-zinc-700"
                    }`}
                    numberOfLines={2}
                  >
                    {label}
                  </CustomText>
                  {c.updatedAt && (
                    <CustomText
                      className={`text-xs mt-1 ${
                        theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </CustomText>
                  )}
                </View>
                <TouchableOpacity
                  accessibilityLabel="Delete chat section"
                  onPress={() => deleteConversation(idx)}
                  disabled={active && isThinking}
                  className="p-1"
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 } as any}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={theme === "dark" ? "#9ca3af" : "#6b7280"}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  // Mobile horizontal tabs
  const renderMobileTabs = () => (
    <View className="border-b border-zinc-200 dark:border-zinc-800">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2 py-2">
        {conversations.map((c, idx) => {
          const active = idx === activeIndex;
          const bg = active ? "bg-teal-300" : "bg-zinc-200 dark:bg-zinc-800";
          const textColor = active ? "text-white" : theme === "dark" ? "text-zinc-200" : "text-zinc-700";
          const iconColor = active ? "#ffffff" : theme === "dark" ? "#d4d4d8" : "#52525b";
          const label = getConversationLabel(c);
          const shortLabel = label.length > 24 ? label.slice(0, 24) + "…" : label;
          return (
            <View key={c.key} className={`mr-2 rounded-full ${bg}`}>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => setActiveIndex(idx)} className="px-3 py-1.5">
                  <CustomText weight="semibold" className={`${textColor} text-xs pt-1`}>
                    {shortLabel}
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Delete chat section"
                  onPress={() => deleteConversation(idx)}
                  disabled={active && isThinking}
                  className="px-2 py-1.5"
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 } as any}
                >
                  <Ionicons name="close" size={12} color={iconColor} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <TouchableOpacity
          onPress={() => {
            const newConv = createInitialConversation();
            setConversations((prev) => [newConv, ...prev]);
            setActiveIndex(0);
          }}
          className="px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30"
          accessibilityLabel="Create new chat section"
        >
          <View className="flex-row items-center">
            <Ionicons name="add" size={14} color={theme === "dark" ? "#34d399" : "#059669"} />
            <CustomText className="ml-1 text-xs pt-1" style={{ color: theme === "dark" ? "#34d399" : "#065f46" }}>
              New
            </CustomText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      edges={["left", "right"]}
      className={`flex-1 ${useBackgroundColorClass()}`}
    >
      <View className="flex-1 flex-row">
        {/* Sidebar for large screens */}
        {isLargeScreen && renderSidebar()}

        {/* Main chat area */}
        <View className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 0}
            className="flex-1"
          >
            {/* Header for mobile (large screens have sidebar header) */}
            {/* {!isLargeScreen && (
              <View className="px-4 py-2 flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="sparkles-outline"
                    size={22}
                    color={theme === "dark" ? "#a1a1aa" : "#3f3f46"}
                  />
                  <CustomText weight="semibold" className="text-lg">
                    {conversations[activeIndex]?.title?.trim() || "Flexi AI"}
                  </CustomText>
                </View>
                {isThinking && (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator
                      size="small"
                      color={theme === "dark" ? "#a1a1aa" : "#3f3f46"}
                    />
                    <CustomText className="text-xs">Thinking…</CustomText>
                  </View>
                )}
              </View>
            )} */}

            {/* Mobile tabs */}
            {!isLargeScreen && renderMobileTabs()}

            {/* Large screen header with current chat title */}
            {isLargeScreen && (
              <View className="px-4 py-2 flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                <CustomText weight="semibold" className="text-lg">
                  {conversations[activeIndex]?.title?.trim() || "New Chat"}
                </CustomText>
                {isThinking && (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator
                      size="small"
                      color={theme === "dark" ? "#a1a1aa" : "#3f3f46"}
                    />
                    <CustomText className="text-xs">Thinking…</CustomText>
                  </View>
                )}
              </View>
            )}

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
        </View>
      </View>
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

  // Make copy icon color match the message text color
  const messageTextColor = theme === "dark" ? "#b4b3b3" : "#2a2a2a";
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
                color={messageTextColor}
                opacity={copied ? 0.9 : 0.6}
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
