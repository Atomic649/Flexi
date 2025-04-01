import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
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
  const [selectedDates, setSelectedDates] = useState<{ [date: string]: any }>(
    {}
  );

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    const newSelectedDates = { ...selectedDates };

    // Toggle the selected date
    if (newSelectedDates[dateString]) {
      delete newSelectedDates[dateString]; // Deselect the date
    } else {
      const selectedDateKeys = Object.keys(newSelectedDates);
      if (selectedDateKeys.length > 0) {
        const firstSelectedDate = new Date(selectedDateKeys[0]);
        const newDate = new Date(dateString);

        if (newDate < firstSelectedDate) {
          // If the new date is before the first selected date, select the range
          const datesInRange = eachDayOfInterval({ start: newDate, end: firstSelectedDate });
          datesInRange.forEach(date => {
            newSelectedDates[format(date, "yyyy-MM-dd")] = {
              selected: true,
              selectedColor: theme === "dark" ? "#ffb30e" : "#ffb30e",
            };
          });
        } else {
          // If the new date is after the first selected date, select the range
          const datesInRange = eachDayOfInterval({ start: firstSelectedDate, end: newDate });
          datesInRange.forEach(date => {
            newSelectedDates[format(date, "yyyy-MM-dd")] = {
              selected: true,
              selectedColor: theme === "dark" ? "#ffb30e" : "#ffb30e",
            };
          });
        }
      } else {
        newSelectedDates[dateString] = {
          selected: true,
          selectedColor: theme === "dark" ? "#ffb30e" : "#ffb30e",
        }; // Select the date
      }
    }

    setSelectedDates(newSelectedDates);
    onDatesChange(Object.keys(newSelectedDates)); // Pass the selected dates to the parent
  };

  const calendarTheme =
    theme === "dark"
      ? {
          backgroundColor: "#8d8c8b",
          calendarBackground: "#18181b",
          textSectionTitleColor: "#ffffff",
          textSectionTitleDisabledColor: "#868282",
          dayTextColor: "#ffb30e",
          todayTextColor: "#5bffef",
          selectedDayTextColor: "#ffffff",
          selectedDayBackgroundColor: "#ffb30e",
          arrowColor: "#ffffff",
          monthTextColor: "#ffffff",
          indicatorColor: "#ffffff",
        }
      : {
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#000000",
          textSectionTitleDisabledColor: "#aaaaaa",
          dayTextColor: "#000000",
          todayTextColor: "#ffb30e",
          selectedDayTextColor: "#ffffff",
          selectedDayBackgroundColor: "#ffb30e",
          arrowColor: "#ffb30e",
          monthTextColor: "#000000",
          indicatorColor: "#000000",
        };

  const selectedDateKeys = Object.keys(selectedDates);
  const selectedDateRange =
    selectedDateKeys.length > 1
      ? ` ${selectedDateKeys[0]} ${t('common.to')} ${selectedDateKeys[selectedDateKeys.length - 1]}`
      : selectedDateKeys.length === 1
      ? `${selectedDateKeys[0]}`
      : "";

  return (
    <View style={styles.container}>
      <Text style={[styles.selectedDatesText, { color: "#ffb30e" }]}>
        {selectedDateRange}
      </Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={selectedDates}
        theme={calendarTheme}
        enableMultiSelect={false} // Disable multi-date selection
        maxDate={new Date().toISOString().split("T")[0]} // Disable future dates
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
