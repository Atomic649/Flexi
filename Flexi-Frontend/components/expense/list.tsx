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
import { getScreenWidth, isDesktop, isMobile, getDeviceType } from "@/utils/responsive";

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

  // Render table view for desktop
  const renderTableView = () => {
    // Flatten grouped expenses for table view
    const allExpenses = Object.values(groupedExpense).flat();

    // Get device info for responsive design
    const { width, height } = Dimensions.get("window");
    const deviceType = getDeviceType();

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
          width: "100%",
          height: "100%",
          backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
          style={{
            width: "100%",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth:
                deviceType === "mobile"
                  ? "100%"
                  : deviceType === "tablet"
                  ? 900
                  : 1200,
              alignSelf: "center",
            }}
          >
            {/* Table Header Row - Fixed Styling */}
            <View
              className="flex flex-row border-b pb-2 mb-2"
              style={{
                borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                width: "100%",
                flexDirection: "row",
                display: "flex"
              }}
            >
              <Text style={[headerTextStyle, { width: "16.66%" }]}>
                {t("expense.table.date")}
              </Text>
              <Text style={[headerTextStyle, { width: "16.66%" }]}>
                {t("expense.table.type")}
              </Text>
              <Text style={[headerTextStyle, { width: "33.33%" }]}>
                {t("expense.table.description")}
              </Text>
              <Text style={[headerTextStyle, { width: "16.66%" }]}>
                {t("expense.table.note")}
              </Text>
              <Text style={[headerTextStyle, { width: "8.33%" }]}>
                {t("expense.table.amount")}
              </Text>
              <Text style={[headerTextStyle, { width: "8.33%" }]}>
                {t("expense.table.delete")}
              </Text>
            </View>

            {/* Table Content */}
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={{ maxHeight: height * 0.8 }}
              contentContainerStyle={{ flexGrow: 1 }}
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
                          type: expense.type,
                        },
                      });
                    } else {
                      globalThis.console.warn(
                        "Edit functionality not available for ads expenses"
                      );
                    }
                  }} // Navigate to edit screen
                >
                  <View
                    className="flex flex-row border-b py-3"
                    style={{
                      borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } `}
                      style={{ width: "16.66%" }}
                    >
                      {formatDate(expense.date)}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } `}
                      style={{ width: "16.66%" }}
                    >
                      {expense.type}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } `}
                      style={{ width: "33.33%" }}
                      numberOfLines={1}
                    >
                      {expense.type === "ads" ? expense.note : expense.desc}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } `}
                      numberOfLines={1}
                      style={{ width: "16.66%" }}
                    >
                      {expense.type === "ads" ? "คาดการณ์ค่าโฆษณา" : expense.note}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      }  font-bold`}
                      style={{ width: "8.33%", textAlign: "center" } as TextStyle}
                    >
                      -{expense.expenses}
                    </Text>
                    <View className="flex flex-row w-24"
                      style={{ width: "8.33%", justifyContent: "center" }}>
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
      <SafeAreaView className={`h-full  ${useBackgroundColorClass()} `}>
        {isDesktop() ? renderTableView() : renderCardView()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default List;
