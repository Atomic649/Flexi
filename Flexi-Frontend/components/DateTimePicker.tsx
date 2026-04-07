import React, { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

type Props = {
  visible: boolean;
  value: Date;
  onChange: (next: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

const clampInt = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export default function DateTimePicker({
  visible,
  value,
  onChange,
  onClose,
  minDate,
  maxDate,
}: Props) {
  const { theme } = useTheme();

  const effectiveValue = useMemo(() => {
    return isValidDate(value) ? value : new Date();
  }, [value]);

  const [cursorMonth, setCursorMonth] = useState<Date>(() =>
    startOfMonth(effectiveValue)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => new Date(effectiveValue)
  );
  const [hour, setHour] = useState(() => effectiveValue.getHours());
  const [minute, setMinute] = useState(() => effectiveValue.getMinutes());
  const [pickerMode, setPickerMode] = useState<"day" | "month" | "year">("day");
  const [yearCursor, setYearCursor] = useState(() => effectiveValue.getFullYear());
  const [decadeCursor, setDecadeCursor] = useState(() =>
    Math.floor(effectiveValue.getFullYear() / 12) * 12
  );

  const yearGrid = useMemo(
    () => Array.from({ length: 12 }, (_, i) => decadeCursor + i),
    [decadeCursor]
  );

  useEffect(() => {
    if (!visible) return;
    setCursorMonth(startOfMonth(effectiveValue));
    setSelectedDate(new Date(effectiveValue));
    setHour(effectiveValue.getHours());
    setMinute(effectiveValue.getMinutes());
    setPickerMode("day");
    setYearCursor(effectiveValue.getFullYear());
  }, [visible, effectiveValue]);

  const colors = useMemo(() => {
    const isDark = theme === "dark";
    return {
      overlay: isDark ? "#000000b5" : "#b4cac6a9",
      cardBg: isDark ? "#18181b" : "#ffffff",
      text: isDark ? "#ffffff" : "#222222",
      mutedText: isDark ? "#a1a1aa" : "#6b7280",
      border: isDark ? "#3f3f46" : "#e5e7eb",
      cellBg: isDark ? "#27272a" : "#f4f4f5",
      accent: "#04ecc1",
    };
  }, [theme]);

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(cursorMonth);
    const monthEnd = endOfMonth(cursorMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursorMonth]);

  const isDisabled = (day: Date) => {
    if (minDate && isBefore(day, startOfDay(minDate))) return true;
    if (maxDate && isAfter(day, endOfDay(maxDate))) return true;
    return false;
  };

  const commit = () => {
    const nextHour = clampInt(Number(hour), 0, 23);
    const nextMinute = clampInt(Number(minute), 0, 59);
    const next = new Date(selectedDate);
    next.setHours(nextHour, nextMinute, 0, 0);
    onChange(next);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            },
          ]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => {
            // @ts-ignore
            e?.stopPropagation?.();
          }}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                if (pickerMode === "day") setCursorMonth((d) => subMonths(d, 1));
                else if (pickerMode === "month") setYearCursor((y) => y - 1);
                else setDecadeCursor((d) => d - 12);
              }}
              style={[styles.navBtn, { borderColor: colors.border }]}
            >
              <CustomText style={{ color: colors.text }}>{"<"}</CustomText>
            </TouchableOpacity>
            <View style={styles.headerLabel}>
              {/* Month label — tappable in day mode */}
              {pickerMode === "day" && (
                <TouchableOpacity
                  onPress={() => {
                    setYearCursor(cursorMonth.getFullYear());
                    setPickerMode("month");
                  }}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <CustomText weight="bold" style={{ color: colors.accent }}>
                    {format(cursorMonth, "MMMM yyyy")}
                  </CustomText>
                  <CustomText style={{ color: colors.mutedText, fontSize: 11, marginLeft: 4 }}>
                    {"▼"}
                  </CustomText>
                </TouchableOpacity>
              )}
              {/* Year label — tappable in month mode to open year grid */}
              {pickerMode === "month" && (
                <TouchableOpacity
                  onPress={() => {
                    setDecadeCursor(Math.floor(yearCursor / 12) * 12);
                    setPickerMode("year");
                  }}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <CustomText weight="bold" style={{ color: colors.accent }}>
                    {String(yearCursor)}
                  </CustomText>
                  <CustomText style={{ color: colors.mutedText, fontSize: 11, marginLeft: 4 }}>
                    {"▼"}
                  </CustomText>
                </TouchableOpacity>
              )}
              {/* Decade range label in year mode */}
              {pickerMode === "year" && (
                <TouchableOpacity
                  onPress={() => setPickerMode("month")}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <CustomText weight="bold" style={{ color: colors.accent }}>
                    {`${decadeCursor} – ${decadeCursor + 11}`}
                  </CustomText>
                  <CustomText style={{ color: colors.mutedText, fontSize: 11, marginLeft: 4 }}>
                    {"▲"}
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                if (pickerMode === "day") setCursorMonth((d) => addMonths(d, 1));
                else if (pickerMode === "month") setYearCursor((y) => y + 1);
                else setDecadeCursor((d) => d + 12);
              }}
              style={[styles.navBtn, { borderColor: colors.border }]}
            >
              <CustomText style={{ color: colors.text }}>{">"}</CustomText>
            </TouchableOpacity>
          </View>

          {pickerMode === "year" ? (
            /* Year grid */
            <View style={styles.monthGrid}>
              {yearGrid.map((yr) => {
                const isActive = cursorMonth.getFullYear() === yr;
                return (
                  <TouchableOpacity
                    key={yr}
                    onPress={() => {
                      setYearCursor(yr);
                      setPickerMode("month");
                    }}
                    style={[
                      styles.monthCell,
                      {
                        backgroundColor: isActive ? colors.accent : colors.cellBg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <CustomText
                      style={{ color: isActive ? "#0b0b0b" : colors.text, fontSize: 13 }}
                    >
                      {String(yr)}
                    </CustomText>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : pickerMode === "month" ? (
            /* Month grid */
            <View style={styles.monthGrid}>
              {MONTHS.map((name, idx) => {
                const isActive =
                  cursorMonth.getFullYear() === yearCursor &&
                  cursorMonth.getMonth() === idx;
                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => {
                      setCursorMonth(new Date(yearCursor, idx, 1));
                      setPickerMode("day");
                    }}
                    style={[
                      styles.monthCell,
                      {
                        backgroundColor: isActive ? colors.accent : colors.cellBg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <CustomText
                      style={{ color: isActive ? "#0b0b0b" : colors.text, fontSize: 13 }}
                    >
                      {name}
                    </CustomText>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <>
              {/* Weekdays */}
              <View style={styles.weekRow}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                  <CustomText
                    key={`${d}-${idx}`}
                    style={[styles.weekday, { color: colors.mutedText }]}
                  >
                    {d}
                  </CustomText>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.grid}>
                {gridDays.map((day) => {
                  const outside = !isSameMonth(day, cursorMonth);
                  const selected = isSameDay(day, selectedDate);
                  const disabled = isDisabled(day);

                  return (
                    <TouchableOpacity
                      key={day.toISOString()}
                      disabled={disabled}
                      onPress={() => {
                        if (disabled) return;
                        const next = new Date(selectedDate);
                        next.setFullYear(
                          day.getFullYear(),
                          day.getMonth(),
                          day.getDate()
                        );
                        setSelectedDate(next);
                      }}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: selected ? colors.accent : colors.cellBg,
                          opacity: outside ? 0.45 : 1,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <CustomText
                        style={{
                          color: selected ? "#0b0b0b" : colors.text,
                          opacity: disabled ? 0.4 : 1,
                        }}
                      >
                        {format(day, "d")}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Time inputs */}
          <View style={styles.timeRow}>
            <CustomText style={{ color: colors.mutedText }}>Time</CustomText>
            <View style={styles.timeControls}>
              <View style={styles.timeBlock}>
                <TouchableOpacity
                  onPress={() => setHour((h) => (h + 23) % 24)}
                  style={[styles.stepBtn, { borderColor: colors.border }]}
                >
                  <CustomText style={{ color: colors.text }}>{"-"}</CustomText>
                </TouchableOpacity>
                <CustomText weight="bold" style={{ color: colors.text }}>
                  {pad2(hour)}
                </CustomText>
                <TouchableOpacity
                  onPress={() => setHour((h) => (h + 1) % 24)}
                  style={[styles.stepBtn, { borderColor: colors.border }]}
                >
                  <CustomText style={{ color: colors.text }}>{"+"}</CustomText>
                </TouchableOpacity>
              </View>

              <CustomText style={{ color: colors.mutedText }}>:</CustomText>

              <View style={styles.timeBlock}>
                <TouchableOpacity
                  onPress={() => setMinute((m) => (m + 59) % 60)}
                  style={[styles.stepBtn, { borderColor: colors.border }]}
                >
                  <CustomText style={{ color: colors.text }}>{"-"}</CustomText>
                </TouchableOpacity>
                <CustomText weight="bold" style={{ color: colors.text }}>
                  {pad2(minute)}
                </CustomText>
                <TouchableOpacity
                  onPress={() => setMinute((m) => (m + 1) % 60)}
                  style={[styles.stepBtn, { borderColor: colors.border }]}
                >
                  <CustomText style={{ color: colors.text }}>{"+"}</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.actionBtn, { borderColor: colors.border }]}
            >
              <CustomText style={{ color: colors.mutedText }}>
                Cancel
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={commit}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <CustomText style={{ color: "#0b0b0b" }} weight="bold">
                Done
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isValidDate(d: Date) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 45,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekday: {
    width: "14.2857%",
    textAlign: "center",
    fontSize: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.2857%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  timeRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 92,
    alignItems: "center",
  },
  headerLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  monthCell: {
    width: "33.333%",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
});
