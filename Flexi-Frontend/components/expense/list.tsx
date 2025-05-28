import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Platform,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIReport from "@/api/report_api";
import { getMemberId } from "@/utils/utility";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ExpenseCard from "../ExpenseCard";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";
import { Ionicons } from "@expo/vector-icons";
import i18n from "@/i18n";
import { useRouter } from "expo-router";

type Expense = {
  id: number;
  date: string;
  expenses: number;
  type: string;
  note: string;
  desc: string;
  image: string;
};

// Group expenses by date
const groupByDate = (expenses: Expense[]) => {
  // Check if expenses is an array and not empty
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return {}; // Return empty object if expenses is not an array or is empty
  }

  return expenses.reduce((acc, expense) => {
    const expenseDate = new Date(expense.date);
    const day = expenseDate.getDate().toString().padStart(2, "0");
    const month = (expenseDate.getMonth() + 1).toString().padStart(2, "0");
    const year = expenseDate.getFullYear();
    const date = `${day}/${month}/${year}`;

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
};

// Format date for display purposes
const formatDate = (date: string) => {
  return date.replace("T", " ").replace(/:\d{2}\.\d{3}Z$/, "");
};

const List = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [expense, setExpense] = useState<Expense[]>([]);
  const isDesktop = Platform.OS === "web";
  const router = useRouter();

  // Table header text style
  const headerTextStyle: TextStyle = {
    fontWeight: "900" as "900", // or any other acceptable value
    fontSize: 13,
    color: theme === "dark" ? "#27272a" : "#4b5563",
    fontFamily:
      i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
  };

  // Call API to get expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIReport.getAdsExpenseReportsAPI(
            memberId
          );
          // Ensure response is an array before setting state
          setExpense(Array.isArray(response) ? response : []);
        } else {
          console.error("Member ID is null");
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setExpense([]); // Set empty array on error
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
        // Ensure response is an array before setting state
        setExpense(Array.isArray(response) ? response : []);
      } else {
        console.error("Member ID is null");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpense([]); // Set empty array on error
    }
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {};

  // Safely compute groupedExpense by ensuring expense is an array
  const groupedExpense = groupByDate(expense || []);
  const today = new Date().toISOString().split("T")[0];

  // Function to get expense text color
  const getExpenseTextColor = (type: string) => {
    switch (type) {
      case "ads":
        return "#ffab02";
      case "expense":
        return "#ff2a00";
      default:
        return "#61fff2";
    }
  };

  // Render table view for desktop
  const renderTableView = () => {
    // Flatten grouped expenses for table view
    const allExpenses = Object.values(groupedExpense).flat();

    if (allExpenses.length === 0) {
      return (
        <CustomText className="pt-10 text-center text-white">
          {t("common.notfound")}
        </CustomText>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <ScrollView horizontal={true}>
          <View style={{ paddingTop: 16, width: "100%" }}>
            <View
              className="flex flex-row border-b  pb-2 mb-2"
              style={{
                borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
              }}
            >
              <Text
                style={headerTextStyle}
                className={`w-36`}
              >
                {t("expense.table.date")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-36`}
              >
                {t("expense.table.type")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-96`}
              >
                {t("expense.table.description")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-64`}
              >
                {t("expense.table.note")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-36`}
              >
                {t("expense.table.amount")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-24`}
              >
                {t("expense.table.delete")}
              </Text>
            </View>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={{ maxHeight: Dimensions.get("window").height * 0.8 }}
            >
              {allExpenses.map((expense) => (
                <TouchableOpacity
                  key={expense.id}
                  onPress={() => {
                    if (expense.type === "expense") {
                      router.push({
                        pathname: "/expenseDetailScreen",
                        params: {
                          id: expense.id,
                          date: expense.date,
                          expenses: expense.expenses,
                          note: expense.note,
                          desc: expense.desc,
                          image: expense.image,
                          type: expense.type
                        }
                      });
                    } else {
                      globalThis.console.warn("Edit functionality not available for ads expenses");
                    }
                  }} // Navigate to edit screen
                >
                  <View
                    className="flex flex-row border-b py-3"
                    style={{
                      borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
                    }}
                  >
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-36`}
                    >
                      {formatDate(expense.date)}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-36`}
                    >
                      {expense.type}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-96`} // Increased width from w-64 to w-96 for Description
                      numberOfLines={1}
                    >
                      {expense.type === "ads" ? expense.note : expense.desc}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-64`}
                      numberOfLines={1}
                    >
                      {expense.type === "ads" ? "คาดการณ์ค่าโฆษณา": expense.note}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-36 font-bold`}
                      //style={{ color: getExpenseTextColor(expense.type) }}
                    >
                      -{expense.expenses}
                    </Text>
                    <View className="flex flex-row w-24">
                      <TouchableOpacity
                        onPress={() => handleDelete(expense.id)}
                        className="mr-3"
                      >
                        <Ionicons
                          name="trash"
                          size={20}
                          color={theme === "dark" ? "#999999" : "#9e9d9d"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Render card view for mobile
  const renderCardView = () => {
    return (
      <FlatList
        data={Object.keys(groupedExpense)}
        keyExtractor={(date) => date}
        renderItem={({ item: date }) => (
          <View
            style={{
              alignItems: Platform.OS === "web" ? "center" : "center",
            }}
          >
            <Text
              className={`text-base font-bold ${
                theme === "dark" ? "text-white" : "text-zinc-600"
              } p-4`}
            >
              {date === today ? t("common.today") : date}
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
                image={expense.image}
                Opacity={theme === "dark" ? 0.4 : 0.2}
                AdsCardColor={theme === "dark" ? "#1d1d1d" : "#f4f4f4f4"}
                ExCardColor={theme === "dark" ? "#151515" : "#f3f3f3ff"}
                ExpenseColor={theme === "dark" ? "#ffaa00" : "#ffaa00"}
                NoteColor={theme === "dark" ? "#868686" : "#656360"}
                DescColor={theme === "dark" ? "#868686" : "#656360"}
                onDelete={handleDelete}
                bgExpenseDetail={theme === "dark" ? "#000000ff" : "#bfbfbfaa"}
                titleColor={theme === "dark" ? "#818181" : "#68655f"}
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
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={`h-full  ${useBackgroundColorClass()}`}>
        {isDesktop ? renderTableView() : renderCardView()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default List;
