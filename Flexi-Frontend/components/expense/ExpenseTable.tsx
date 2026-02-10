import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import ExpenseDetail from "@/app/expenseDetail"; // Ensure correct import
import CallAPIExpense from "@/api/expense_api";
import { getMemberId } from "@/utils/utility";
import { useTranslation } from "react-i18next";
import { CustomText } from "../CustomText";

interface Expense {
  date: string;
  note: string;
  desc: string;
  amount: string;
  image: string;
  pdf: string;
  group: string;
  id: number;
  vat: boolean;
  vatAmount: number;
  withHoldingTax: boolean;
  WHTpercent: number;
  WHTAmount: number;
  sTaxId?: string;
  sName?: string;
  taxInvoiceNo?: string;
  sAddress?: string;
  branch?: string;
  taxType?: "Individual" | "Juristic";
}

interface ExpenseTableProps {
  expenses: Expense[];
  onRowPress: (expense: Expense) => void;
  refreshTrigger?: number; // Add refresh trigger prop
}

const ExpenseTable = ({
  expenses,
  onRowPress,
  refreshTrigger = 0,
}: ExpenseTableProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenseList, setExpenseList] = useState(expenses);
  const [refreshing, setRefreshing] = useState(false);

  // Sort expenses by date (non-mutating)
  const sortedExpenses = useMemo(() => {
    return [...expenseList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenseList]);

  const cellClass = `flex-1 text-center pt-3 ${
    theme === "dark" ? "text-white" : "text-zinc-900"
  }`;
  const dateClass = `flex-1 text-center  text-sm p-3 ${
    theme === "dark" ? "text-white" : "text-zinc-900"
  }`;

  const handleDelete = async (id: number) => {
    try {
      const memberId = String(await getMemberId());
      console.log("Member ID:", memberId);
      if (memberId) {
  await CallAPIExpense.deleteExpenseAPI(id, memberId);
  setExpenseList((prev) => prev.filter((expense) => expense.id !== id));
      } else {
        console.log("Member ID is null");
      }
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  // Fetch expenses function
  const fetchExpenses = useCallback(async () => {
    try {
      setRefreshing(true);
      const memberId = String(await getMemberId());
      console.log("Fetching expenses for Member ID:", memberId);
      if (memberId) {
        const expenses = await CallAPIExpense.getAllExpensesAPI(memberId);
        console.log("Fetched expenses:", expenses);
        setExpenseList(expenses);
      }
    } catch (error) {
      console.error("Error refreshing expenses", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Note: Avoid syncing props to state via effects; use initial seed and explicit refresh instead

  // Refresh expenses when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchExpenses();
    }
  }, [refreshTrigger, fetchExpenses]);

  const onRefresh = useCallback(async () => {
    await fetchExpenses();
  }, [fetchExpenses]);

  const handleExpenseEdit = useCallback(() => {
    setIsModalVisible(false);
    setSelectedExpense(null);
    fetchExpenses(); // Refresh the expense list after edit
  }, [fetchExpenses]);

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity onPress={() => onRowPress(item)}>
      <View
        key={item.id}
        style={{
          backgroundColor: theme === "dark" ? "primary" : "#ffffff07",
        }}
      >
        <View
          className={`flex-row border-b ${
            theme === "dark" ? "border-zinc-700" : "border-gray-300"
          }`}
        >
          <View
            style={{
              width: "25%",
            }}
          >
            <Text className={dateClass} numberOfLines={2}>
              {item.date.split("T")[0].split("-").reverse().join("/")}
              {"\n"}
              {item.date.split("T")[1].replace(/:\d{2}\.\d{3}Z$/, "")}
            </Text>
          </View>
          <View
            style={{
              width: "45%",
            }}
          >
            <CustomText
              className={`flex-2 text-start`}
              weight="regular"
              style={{
                opacity: !item.sName ? 0.5 : 1,
                color: theme === "dark" ? "#ffffff" : "#18181b",
                fontSize:13,
                paddingTop: 9
              }}
              numberOfLines={1}
            >
              {item.sName || item.desc}
            </CustomText>
            <CustomText
              className={`flex-2 text-start py-2 $`}
              weight="regular"
              style={{
                color: theme === "dark" ? "#ffffff" : "#18181b",
                fontSize:13
              }}
              numberOfLines={1}
            >
              {item.note}
            </CustomText>
          </View>
          <View
            style={{
              width: "25%",
            }}
          >
            <Text className={cellClass} numberOfLines={1}>
              {formatNumber(Number(item.amount) || 0)}
            </Text>

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 m-2 justify-center items-center"
                disabled={!item.image && !item.pdf}
              >
                <Ionicons
                  className="text-center"
                  name="document-text-outline"
                  size={16}
                  color={
                    !item.image && !item.pdf
                      ? theme === "dark"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(103, 103, 103, 0.3)"
                      : theme === "dark"
                      ? "white"
                      : "#676767"
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="flex-1 m-2 justify-center items-center"
              >
                <Ionicons
                  className="text-center"
                  name="trash-outline"
                  size={16}
                  color={theme === "dark" ? "#676767" : "#d3d2d2"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      className="flex-1  "
      style={{
        width: Dimensions.get("window").width > 768 ? "55%" : "100%",
      }}
    >
      <View
        className="flex-row w-full justify-around p-1  "
        style={{
          backgroundColor: theme === "dark" ? "#3f3e3b" : "#5e5953",
          alignItems: "center",
        }}
      >
        <CustomText
          className={`w-2/7`}
          style={{
            fontWeight: "normal",
            color: theme === "dark" ? "#ffffff" : "#ffffff",
            fontSize: 12,
          }}
        >
          {t("expense.table.date")}
        </CustomText>
        <CustomText
          className={`w-1/7`}
          style={{
            fontWeight: "normal",
            color: theme === "dark" ? "#ffffff" : "#ffffff",
            fontSize: 12,
          }}
        >
          {t("expense.table.notedesc")}
        </CustomText>
        <CustomText
          className={`w-1/7`}
          style={{
            fontWeight: "normal",
            color: theme === "dark" ? "#ffffff" : "#ffffff",
            fontSize: 12,
          }}
        >
          {t("expense.table.amount")}
        </CustomText>
      </View>
      <FlatList
        data={sortedExpenses}
        renderItem={renderItem}
        keyExtractor={(_item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {selectedExpense && (
        <ExpenseDetail
          visible={isModalVisible}
          onClose={handleExpenseEdit}
          expense={selectedExpense}
        />
      )}
    </View>
  );
};

export default ExpenseTable;
