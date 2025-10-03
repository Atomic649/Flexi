import React, { useMemo, memo } from "react";
import { Platform, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";
import { marked } from "marked";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";

type Props = {
  content: string;
};

// Configure marked to support GitHub-Flavored Markdown (tables, etc.)
marked.setOptions({
  gfm: true,
  breaks: true,
});

const MarkdownMessage = memo(function MarkdownMessage({ content }: Props) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { i18n } = useTranslation();

  const html = useMemo(() => {
    try {
      return marked.parse(content || "");
    } catch {
      return content || "";
    }
  }, [content]);

  const isDark = theme === "dark";
  const isThai = i18n.language === "th";

  const font = (weight: "thin" | "extralight" | "light" | "regular" | "medium" | "semibold" | "bold" | "extrabold" | "black") => {
    const prefix = isThai ? "IBMPlexSansThai" : "Poppins";
    const cap = weight.charAt(0).toUpperCase() + weight.slice(1);
    return `${prefix}-${cap}`;
  };

  return (
    <RenderHTML
      contentWidth={width - 48}
      source={{ html: String(html) }}
      systemFonts={[
        font("thin"),
        font("extralight"),
        font("light"),
        font("regular"),
        font("medium"),
        font("semibold"),
        font("bold"),
        font("extrabold"),
        font("black"),
      ]}
      baseStyle={{
        color: isDark ? "#b4b3b3" : "#2a2a2a",
        fontSize: 14,
        lineHeight: 22,
        fontFamily: font("regular"),
      }}
      tagsStyles={{
        h1: { fontSize: 20, fontFamily: font("semibold"), marginBottom: 6 },
        h2: { fontSize: 18, fontFamily: font("medium"), marginBottom: 6 },
        h3: { fontSize: 16, fontFamily: font("medium"), marginBottom: 6 },
        strong: { fontFamily: font("medium") },
        em: { fontStyle: "italic" },
        p: { marginBottom: 6, fontFamily: font("regular") },
        ul: { paddingLeft: 18, marginBottom: 6, fontFamily: font("regular") },
        ol: { paddingLeft: 18, marginBottom: 6, fontFamily: font("regular") },
        li: { marginBottom: 4, fontFamily: font("regular") },
        code: {
          fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) as string,
          backgroundColor: isDark ? "#27272a" : "#f1f5f9",
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
        },
        pre: {
          backgroundColor: isDark ? "#27272a" : "#f1f5f9",
          padding: 8,
          borderRadius: 8,
          marginVertical: 8,
        },
        table: {
          borderWidth: 1,
          borderColor: isDark ? "#3f3f46" : "#e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
          marginVertical: 8,
        },
        thead: {
          backgroundColor: isDark ? "#3f3f46" : "#f7fafc",
        },
        th: {
          fontFamily: font("semibold"),
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRightWidth: 1,
          borderRightColor: isDark ? "#52525b" : "#e5e7eb",
        },
        td: {
          fontFamily: font("medium"),
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#3f3f46" : "#e5e7eb",
          borderRightWidth: 1,
          borderRightColor: isDark ? "#3f3f46" : "#e5e7eb",
        },
        tr: {
          backgroundColor: isDark ? "#18181b" : "#ffffff",
        },
      }}
    />
  );
});

export default MarkdownMessage;
