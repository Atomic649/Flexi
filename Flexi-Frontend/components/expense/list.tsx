import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIReport from "@/api/report_api";
import { getMemberId } from "@/utils/utility";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ExpenseCard from "../ExpenseCard";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";

type Expense = {
  id: number;
  date: string;
  expenses: number;
  type: string;
  note: string;
  desc: string;
};

// Group expenses by date
const groupByDate = (expenses: Expense[]) => {
  return expenses.reduce((acc, expense) => {
    const date = expense.date.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
}

const List = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [expense, setExpense] = useState<Expense[]>([]);

  // Call API to get expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIReport.getAdsExpenseReportsAPI(memberId);
          setExpense(response);
        } else {
          console.error("Member ID is null");
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  // Refresh expenses
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIReport.getAdsExpenseReportsAPI(memberId);
        setExpense(response);
      } else {
        console.error("Member ID is null");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {};

  const groupedExpense = groupByDate(expense);
  const today = new Date().toISOString().split("T")[0];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
        <FlatList
          data={Object.keys(groupedExpense)}
          keyExtractor={(date) => date}
          renderItem={({ item: date }) => (
            <View>
              <Text
                className={`text-base font-bold ${
                  theme === "dark" ? "text-white" : "text-zinc-600"
                } p-4`}
              >
                {date === today ? "Today" : date}
              </Text>

              {groupedExpense[date].map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  id={expense.id}
                  date={expense.date}
                  type={expense.type}
                  expenses={expense.expenses}
                  note={expense.note}
                  desc={expense.desc}
                  Opacity={theme === "dark" ? 0.4 : 0.2}
                  AdsCardColor={theme === "dark" ? "#1d1d1d" : "#24232108"}
                  ExCardColor={theme === "dark" ? "#151515" : "#24232110"}
                  ExpenseColor={theme === "dark" ? "#ffaa00" : "#ffaa00"}
                  NoteColor={theme === "dark" ? "#868686" : "#656360"}
                  DescColor={theme === "dark" ? "#868686" : "#656360"}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}
          ListEmptyComponent={() => (
            <CustomText className="pt-10 text-center text-white">
              {t("common.notfound")}
            </CustomText>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default List;
