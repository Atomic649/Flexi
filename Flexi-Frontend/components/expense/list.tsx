import React, { useEffect, useState } from "react";
import {
  View,
  Text,
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
import {
  getScreenWidth,
  isDesktop,
  isMobile,
  getDeviceType,
  getResponsiveStyles,
} from "@/utils/responsive";

type Expense = {
  id: number;
  date: string;
  dueDate?: string;
  expenses: number;
  debtAmount?: number;
  DocumentType?: string;
  type: string;
  note: string;
  sName: string;
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

interface ListProps {
  refreshTrigger?: number;
}

const List = ({ refreshTrigger = 0 }: ListProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  const [refreshing, setRefreshing] = useState(false);
  const [expense, setExpense] = useState<Expense[]>([]);
  const router = useRouter();

  
  // Fetch expenses function
  const fetchExpenses = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIReport.getAdsExpenseReportsAPI(
          memberId
        );
  // DEBUG: log full response to inspect fields like sName
  // Keep log to help diagnose missing sName; can be removed later
  // console.log('DEBUG: AdsExpenseReport response =>', response);
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

  // Call API to get expenses initially
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Reload expenses when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchExpenses();
    }
  }, [refreshTrigger]);

  // Refresh expenses
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchExpenses();
    } catch (error) {
      console.error("Error refreshing expenses:", error);
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
        <CustomText className="pt-10 text-center text-zinc-500">
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
                display: "flex",
              }}
            >
              <CustomText
              weight="bold"
               style={{ width: "16.66%",fontSize: getResponsiveStyles().bodyFontSize  }}>
                {t("expense.table.date")}
              </CustomText>
              <CustomText weight="bold" style={{ width: "16.66%",fontSize: getResponsiveStyles().bodyFontSize  }}>
                {t("expense.table.type")}
              </CustomText>
              <CustomText weight="bold" style={{ width: "33.33%",fontSize: getResponsiveStyles().bodyFontSize  }}>
                {t("expense.table.description")}
              </CustomText>
              <CustomText weight="bold" style={{ width: "16.66%",fontSize: getResponsiveStyles().bodyFontSize  }}>
                {t("expense.table.note")}
              </CustomText>
              <CustomText weight="bold" style={{ width: "8.33%",fontSize: getResponsiveStyles().bodyFontSize  }}>
                {t("expense.table.amount")}
              </CustomText>
              <CustomText weight="bold" style={{ width: "8.33%",fontSize: getResponsiveStyles().bodyFontSize  }}>
                {t("expense.table.delete")}
              </CustomText>
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
                          sName: expense.sName,
                        },
                      });
                    } else if (expense.type === "ads") {
                      router.push({
                        pathname: "/editAdsCost",
                        params: {
                          id: expense.id,
                          date: expense.date,
                          expenses: expense.expenses,
                          note: expense.note,
                          desc: expense.desc,
                        },
                      });
                    } else {
                      globalThis.console.warn(
                        `Edit functionality not available for expense type: ${expense.type}`
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
                    <View style={{ width: "16.66%" }}>
                      {expense.DocumentType === "Invoice" && expense.dueDate ? (
                        <>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 1 }}>
                            <View style={{ backgroundColor: "#ff2a00", borderRadius: 3, paddingHorizontal: 3, paddingVertical: 1 }}>
                              <CustomText style={{ fontSize: 8, fontWeight: "700", color: "#fff" }}>INV</CustomText>
                            </View>
                            <CustomText style={{ fontSize: getResponsiveStyles().smallFontSize, color: "#ff2a00" }}>
                              {formatDate(expense.dueDate)}
                            </CustomText>
                          </View>
                          <CustomText style={{ fontSize: (getResponsiveStyles().smallFontSize ?? 12) - 1, color: theme === "dark" ? "#666" : "#aaa" }}>
                            {formatDate(expense.date)}
                          </CustomText>
                        </>
                      ) : (
                        <CustomText style={{ fontSize: getResponsiveStyles().smallFontSize }}>
                          {formatDate(expense.date)}
                        </CustomText>
                      )}
                    </View>
                    <CustomText
                      
                      style={{ width: "16.66%", fontSize: getResponsiveStyles().smallFontSize }}
                    >
                      {expense.type}
                    </CustomText>
                    <CustomText                      
                      style={{ width: "33.33%", fontSize: getResponsiveStyles().smallFontSize }}
                      numberOfLines={1}
                    >
                      {expense.type === "ads" ? expense.note : (expense.sName || expense.desc )}
                    </CustomText>
                    <CustomText                     
                      numberOfLines={1}
                      style={{ width: "16.66%", fontSize: getResponsiveStyles().smallFontSize }}
                    >
                      {expense.type === "ads"
                        ? t("expense.forecastAdsCost")
                        : (expense.sName || expense.note)}
                    </CustomText>
                    <CustomText                      
                      style={{
                        width: "8.33%", textAlign: "center", fontSize: getResponsiveStyles().smallFontSize
                      } as TextStyle}
                    >
                      -{formatNumber(Number(expense.debtAmount) || Number(expense.expenses) || 0)}
                    </CustomText>
                    <View
                      className="flex flex-row w-24"
                      style={{ width: "8.33%", justifyContent: "center" }}
                    >
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
                expenses={Number(expense.debtAmount) || expense.expenses}
                sName={expense.sName}
                note={expense.note}
                desc={expense.desc}
                image={expense.image}
                DocumentType={expense.DocumentType}
                debtAmount={expense.debtAmount}
                dueDate={expense.dueDate}
                onPaid={fetchExpenses}
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
      <View className={`h-full  ${useBackgroundColorClass()} `}>
        {isDesktop() ? renderTableView() : renderCardView()}
      </View>
    </GestureHandlerRootView>
  );
};

export default List;
