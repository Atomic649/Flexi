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
import { Ionicons } from "@expo/vector-icons";
import {
  CallAI,
  streamChat,
  StreamEvent,
  ChatSession,
  ChatMessageFromServer,
} from "@/api/chat_ai_api";
import MarkdownMessage from "@/components/MarkdownMessage";
import * as Clipboard from "expo-clipboard";
import i18n from "@/i18n";
import { getMemberId } from "@/utils/utility";

type Role = "assistant" | "user";
type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  pending?: boolean; // true when assistant response is streaming
};

type ConversationFromServer = {
  session: ChatSession;
  messages: Message[];
};

const normalizeSessions = (payload: any): ChatSession[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.sessions)) return payload.sessions;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeMessages = (payload: any): ChatMessageFromServer[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const parseStoredMessage = (value: any): { role: Role; content: string } => {
  let messageObj = value;

  if (typeof messageObj === "string") {
    try {
      messageObj = JSON.parse(messageObj);
    } catch {
      messageObj = { role: "assistant", content: value };
    }
  }

  const rawRole = messageObj?.role;
  const role: Role = rawRole === "user" ? "user" : "assistant";
  const content =
    (typeof messageObj?.content === "string" && messageObj.content) ||
    (typeof messageObj?.text === "string" && messageObj.text) ||
    "";

  return { role, content };
};

export default function ChatAI() {
  const { theme } = useTheme();
  const [conversations, setConversations] = useState<ConversationFromServer[]>(
    []
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Responsive breakpoint detection
  const screenData = Dimensions.get("window");
  const isLargeScreen = screenData.width >= 768; // Tablet/desktop breakpoint

  const createNewConversation = useCallback(
    (): ConversationFromServer => ({
      session: {
        id: `temp-${Date.now()}`, // temporary ID until server provides one
        userId: "", // will be set by server
        title: undefined,
        summary: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      messages: [
        {
          id: `${Date.now()}-greet`,
          role: "assistant",
          content: "New chat started. Ask me anything!",
          createdAt: Date.now(),
        },
      ],
    }),
    []
  );

  // Load chat history from server
  const loadChatHistory = useCallback(async () => {
    try {
      setLoading(true);

      // Get current member ID
      const memberId = await getMemberId();
      if (!memberId) {
        console.error("No memberId found, creating new conversation");
        setConversations([createNewConversation()]);
        return;
      }

      // Fetch sessions for authenticated user (token-based), avoids stale memberId mismatches
      const sessionsResponse = await CallAI.getChatSessions();
      const sessions = normalizeSessions(sessionsResponse);

      if (sessions.length === 0) {
        // No sessions, create a new one
        setConversations([createNewConversation()]);
      } else {
        // Load sessions and their messages
        const conversationsWithMessages = await Promise.all(
          sessions.map(async (session) => {
            try {
              const serverMessagesResponse = await CallAI.getChatMessages(
                session.id
              );
              const serverMessages = normalizeMessages(serverMessagesResponse);
              const messages: Message[] = serverMessages
                .map((msg: any) => {
                  const parsed = parseStoredMessage(msg?.message ?? msg);
                  return {
                    id: String(msg?.id ?? `${Date.now()}-${Math.random()}`),
                    role: parsed.role,
                    content: parsed.content,
                    createdAt: new Date(msg?.createdAt ?? Date.now()).getTime(),
                  };
                })
                .filter((msg) => msg.content.trim().length > 0)
                .reverse(); // Reverse to show newest messages first (for inverted FlatList)
              return { session, messages };
            } catch (error) {
              console.error(
                `Failed to load messages for session ${session.id}:`,
                error
              );
              return { session, messages: [] };
            }
          })
        );
        setConversations(conversationsWithMessages);

        console.log(
          `Loaded ${conversationsWithMessages.length} chat sessions for member ${memberId}`
        );
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      // Fallback to new conversation
      setConversations([createNewConversation()]);
    } finally {
      setLoading(false);
    }
  }, [createNewConversation]);

  const deleteConversation = useCallback(
    (idx: number) => {
      setConversations((prev) => {
        const target = prev[idx];
        // fire and forget backend clear if sessionId exists
        if (target?.session.id && !target.session.id.startsWith("temp-")) {
          CallAI.clearSectionMessages(target.session.id).catch(() => {});
        }
        let next = prev.filter((_, i) => i !== idx);
        if (next.length === 0) {
          next = [createNewConversation()];
        }
        let newIdx = activeIndex;
        if (idx === activeIndex) newIdx = Math.min(idx, next.length - 1);
        else if (idx < activeIndex) newIdx = Math.max(0, activeIndex - 1);
        setActiveIndex(newIdx);
        return next;
      });
    },
    [activeIndex, createNewConversation]
  );

  // Load chat history from server on component mount
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const scrollToBottom = useCallback(() => {
    // For inverted FlatList, scroll to index 0 to go to bottom
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

  const activeConv = conversations[activeIndex];
  const sessionId =
    activeConv?.session.id && !activeConv.session.id.startsWith("temp-")
      ? activeConv.session.id
      : undefined;

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
      next[activeIndex] = conv;
      return next;
    });
    setInput("");
    scrollToBottom();

    setIsThinking(true);
    try {
      if (useStream) {
        console.log("🚀 [FRONTEND] About to call streamChat with:", { prompt: text, sessionId });
        // Create a placeholder assistant message we will grow with incoming tokens
        let assistantId = `${Date.now()}-assistant`;
        setConversations((prev) => {
          const next = [...prev];
          const conv = { ...next[activeIndex] };
          conv.messages = [
            {
              id: assistantId,
              role: "assistant",
              content: "",
              createdAt: Date.now(),
              pending: true,
            },
            ...(conv.messages || []),
          ];
          next[activeIndex] = conv;
          return next;
        });

        // Consume SSE stream
        await streamChat(
          { prompt: text, sessionId },
          ({ token, sessionId: sid, title, done, error }: StreamEvent) => {
            if (sid && !sessionId) {
              setConversations((prev) => {
                const next = [...prev];
                const conv = { ...next[activeIndex] };
                conv.session = { ...conv.session, id: sid };
                next[activeIndex] = conv;
                return next;
              });
            }
            if (title) {
              setConversations((prev) => {
                const next = [...prev];
                const conv = { ...next[activeIndex] };
                conv.session = { ...conv.session, title };
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
                  m.id === assistantId
                    ? {
                        ...m,
                        content: "Sorry, streaming failed.",
                        pending: false,
                      }
                    : m
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
                  m.id === assistantId
                    ? { ...m, content: m.content + token }
                    : m
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
                next[activeIndex] = conv;
                return next;
              });
              scrollToBottom();
            }
          }
        );
      } else {
        // Non-stream fallback
        const { message, sessionId: returnedSessionId } = await CallAI.chat({
          prompt: text,
          sessionId,
        } as any);
        const assistantMsg: Message = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: message || "",
          createdAt: Date.now(),
        };
        setConversations((prev) => {
          const next = [...prev];
          const conv = { ...next[activeIndex] };
          if (conv.session.id.startsWith("temp-") && returnedSessionId) {
            conv.session = { ...conv.session, id: returnedSessionId };
          }
          conv.messages = [assistantMsg, ...(conv.messages || [])];
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
        next[activeIndex] = conv;
        return next;
      });
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, scrollToBottom, conversations, activeIndex]);

  const messages = useMemo(
    () => conversations[activeIndex]?.messages ?? [],
    [conversations, activeIndex]
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

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
  const getConversationLabel = useCallback((c: ConversationFromServer) => {
    if (c.session.title && c.session.title.trim())
      return c.session.title.trim();
    const m = (c.messages || []).find((mm) => mm.role === "user");
    if (!m) return "New Chat";
    const s = (m.content || "").trim();
    if (!s) return "New Chat";
    return s.length > 50 ? s.slice(0, 50) + "…" : s;
  }, []);

  // Sidebar for large screens
  const renderSidebar = () => (
    <View
      className={`w-80 border-r border-zinc-200 dark:border-zinc-800 ${useBackgroundColorClass()}`}
    >
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
            const newConv = createNewConversation();
            setConversations((prev) => [newConv, ...prev]);
            setActiveIndex(0);
          }}
          className={`flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
            theme === "dark" ? "bg-teal-900/30" : "bg-teal-300"
          }`}
          accessibilityLabel="Create new chat section"
        >
          <Ionicons
            name="add"
            size={16}
            color={theme === "dark" ? "#34d399" : "#059669"}
          />
          <CustomText
            weight="semibold"
            style={{ color: theme === "dark" ? "#34d399" : "#065f46" }}
          >
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
              key={c.session.id}
              className={`mb-2 rounded-lg ${
                active
                  ? theme === "dark"
                    ? "bg-teal-900/30"
                    : "bg-teal-100"
                  : "bg-transparent"
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
                  {c.session.updatedAt && (
                    <CustomText
                      className={`text-xs mt-1 ${
                        theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {new Date(c.session.updatedAt).toLocaleDateString()}
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
    <View className={`border-t border-b ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-2 py-2"
      >
        {conversations.map((c, idx) => {
          const active = idx === activeIndex;
          const bg = active
            ? "bg-teal-300"
            : theme === "dark"
            ? "bg-zinc-800"
            : "bg-zinc-200";
          const textColor = active
            ? "text-white"
            : theme === "dark"
            ? "text-zinc-200"
            : "text-zinc-700";
          const iconColor = active
            ? "#ffffff"
            : theme === "dark"
            ? "#d4d4d8"
            : "#52525b";
          const label = getConversationLabel(c);
          const shortLabel =
            label.length > 24 ? label.slice(0, 24) + "…" : label;
          return (
            <View key={c.session.id} className={`mr-2 rounded-full ${bg}`}>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setActiveIndex(idx)}
                  className="px-3 py-1.5"
                >
                  <CustomText
                    weight="medium"
                    className={` text-xs pt-1`}
                    style={{color: textColor}}
                  >
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
            const newConv = createNewConversation();
            setConversations((prev) => [newConv, ...prev]);
            setActiveIndex(0);
          }}
          className={`px-3 py-1.5 rounded-full ${
            theme === "dark" ? "bg-teal-900/30" : "bg-teal-100"
          }`}
          accessibilityLabel="Create new chat section"
        >
          <View className="flex-row items-center">
            <Ionicons
              name="add"
              size={14}
              color={theme === "dark" ? "#34d399" : "#059669"}
            />
            <CustomText
              className="ml-1 text-xs pt-1"
              style={{ color: theme === "dark" ? "#34d399" : "#065f46" }}
            >
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
                  {conversations[activeIndex]?.session.title?.trim() ||
                    "New Chat"}
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
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator
                  size="large"
                  color={theme === "dark" ? "#34d399" : "#059669"}
                />
                <CustomText className="mt-2 text-center">
                  Loading chat history...
                </CustomText>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                inverted
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListEmptyComponent={listEmpty}
                contentContainerStyle={{ padding: 12, gap: 8 }}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* Composer */}
            <View className="px-3 pb-2">
              <View
                className={`flex-row items-end gap-2 rounded-2xl border px-3 py-2 ${
                  theme === "dark"
                    ? "border-zinc-800 bg-zinc-900"
                    : "border-zinc-200 bg-white"
                }`}
              >
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
                  placeholderTextColor={
                    theme === "dark" ? "#71717a" : "#a1a1aa"
                  }
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
                    canSend
                      ? "bg-teal-300"
                      : theme === "dark"
                      ? "bg-zinc-700"
                      : "bg-zinc-300"
                  }`}
                  accessibilityLabel="Send message"
                >
                  <Ionicons
                    name="send"
                    size={18}
                    color={
                      canSend
                        ? "white"
                        : theme === "dark"
                        ? "#c4c4c5"
                        : "#fafafa"
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Typing bubble */}
              {isThinking && (
                <View
                  className={`mt-2 self-start max-w-[85%] rounded-2xl px-3 py-2 ${
                    theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                  }`}
                >
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

const ChatBubble = React.memo(function ChatBubble({
  message,
}: {
  message: Message;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

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
    <View
      className={`w-full flex-row ${isUser ? "justify-end" : "justify-start"}`}
    >
      <View
        className={`max-w-[85%] px-3 py-2 rounded-2xl ${
          isUser
            ? "bg-teal-300 rounded-br-sm"
            : theme === "dark"
            ? "bg-zinc-800 rounded-bl-sm"
            : "bg-zinc-100 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <CustomText weight="regular" style={{ color: "#27272a" }}>
            {message.content}
          </CustomText>
        ) : (
          <MarkdownMessage content={message.content} />
        )}

        {/* Footer row: time left, copy button right */}
        <View className="mt-1 flex-row items-center justify-between">
          <CustomText
            className={`text-[10px]`}
            style={{ color: theme === "dark" ? "#27272a" : messageTextColor }}
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
                color={isUser ? "#27272a" : messageTextColor}
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
});

const TypingDots = React.memo(function TypingDots({
  theme,
}: {
  theme: "light" | "dark";
}) {
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
});

function formatTime(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
