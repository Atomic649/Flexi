import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DateTimePicker, {
  type DateType,
  useDefaultStyles,
} from "react-native-ui-datepicker";
import { useTheme } from "@/providers/ThemeProvider";
import { eachDayOfInterval, format } from "date-fns";
import { useTranslation } from "react-i18next";

interface MultiDateCalendarProps {
  onDatesChange: (dates: string[]) => void;
}

const MultiDateCalendar: React.FC<MultiDateCalendarProps> = ({
  onDatesChange,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const defaultStyles = useDefaultStyles(theme === "dark" ? "dark" : "light");
  const [startDate, setStartDate] = useState<DateType>();
  const [endDate, setEndDate] = useState<DateType>();

  const toDate = (value?: DateType): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof (value as any)?.toDate === "function") return (value as any).toDate();
    return new Date(value as any);
  };

  const maxDate = useMemo(() => new Date(), []);

  const selectedDates = useMemo(() => {
    const start = toDate(startDate);
    const end = toDate(endDate);
    if (!start) return [] as string[];

    if (!end) return [format(start, "yyyy-MM-dd")];

    const startDay = start < end ? start : end;
    const endDay = start < end ? end : start;
    return eachDayOfInterval({ start: startDay, end: endDay }).map((d) =>
      format(d, "yyyy-MM-dd")
    );
  }, [startDate, endDate]);

  useEffect(() => {
    onDatesChange(selectedDates);
  }, [onDatesChange, selectedDates]);

  const selectedDateRange =
    selectedDates.length > 1
      ? ` ${selectedDates[0]} ${t("common.to")} ${selectedDates[selectedDates.length - 1]}`
      : selectedDates.length === 1
        ? `${selectedDates[0]}`
        : "";

  const calendarStyles =
    theme === "dark"
      ? {
          ...defaultStyles,
          today: { borderColor: "#5bffef", borderWidth: 1 },
          selected: { backgroundColor: "#ffb30e" },
          selected_label: { color: "#ffffff" },
        }
      : {
          ...defaultStyles,
          today: { borderColor: "#ffb30e", borderWidth: 1 },
          selected: { backgroundColor: "#ffb30e" },
          selected_label: { color: "#ffffff" },
        };

  const pickerContainerStyle = useMemo(
    () => ({ backgroundColor: theme === "dark" ? "#18181b" : "#ffffff" }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.selectedDatesText, { color: "#ffb30e" }]}>
        {selectedDateRange}
      </Text>
      <DateTimePicker
        mode="range"
        startDate={startDate}
        endDate={endDate}
        onChange={({ startDate: nextStart, endDate: nextEnd }) => {
          setStartDate(nextStart);
          setEndDate(nextEnd);
        }}
        maxDate={maxDate}
        style={pickerContainerStyle}
        styles={calendarStyles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,

  },
  selectedDatesText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight:"bold",
    textAlign: "center",
    
  },
});

export default MultiDateCalendar;
