import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import ExpenseDetail from "@/app/expenseDetail"; // Ensure correct import
import CallAPIExpense from "@/api/expense_api";
import { getMemberId } from "@/utils/utility";
import { useTranslation } from "react-i18next";

interface Expense {
  date: string;
  note: string;
  desc: string;
  amount: string;
  image: string;
  group: string;
  id: number;
}

interface ExpenseTableProps {
  expenses: Expense[];
  onRowPress: (expense: Expense) => void;
}

const ExpenseTable = ({ expenses, onRowPress }: ExpenseTableProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenseList, setExpenseList] = useState(expenses);
  const [refreshing, setRefreshing] = useState(false);

  // Sort expenses by date
  const sortedExpenses = expenseList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const headerClass = `font-bold p-2  ${
    theme === "dark" ? "text-white" : "text-[#ffffff]"
  }`;
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
        setExpenseList(expenseList.filter((expense) => expense.id !== id));
      } else {
        console.log("Member ID is null");
      }
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const memberId = String(await getMemberId());
      console.log("Member ID:", memberId);
      if (memberId) {
        const expenses = await CallAPIExpense.getAllExpensesAPI(memberId);
        setExpenseList(expenses);
      }
    } catch (error) {
      console.error("Error refreshing expenses", error);
    }
    setRefreshing(false);
  }
  , []);

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
          <View className=" w-1/4">
            <Text className={dateClass} numberOfLines={2}>
              {item.date.split("T")[0]}
              {"\n"}
              {item.date.split("T")[1].replace(/:\d{2}\.\d{3}Z$/, "")}
            </Text>
          </View>
          <View className=" w-3/6">
            <Text
              className={`flex-2 text-end pt-3  ${
                theme === "dark" ? "text-white" : "text-zinc-900"
              }`}
              numberOfLines={1}
            >
              {item.desc}
            </Text>
            <Text
              className={`flex-2 text-end p-3  ${
                theme === "dark" ? "text-white" : "text-zinc-900"
              }`}
              numberOfLines={1}
            >
              {item.note}
            </Text>
          </View>
          <View className=" w-1/5">
            <Text className={cellClass} numberOfLines={1}>
              {item.amount}
            </Text>

            <View className="flex-row">
              <TouchableOpacity               
                className="flex-1 m-2 justify-center items-center"
                disabled={!item.image}
              >
                <Ionicons
                  className="text-center"
                  name="document-text-outline"
                  size={16}
                  color={
                    !item.image
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
                  color={theme === "dark" ? "white" : "#d3d2d2"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 w-full ">
      <View
        className="flex-row w-full justify-between p-1 px-4 "
        style={{ backgroundColor: theme === "dark" ? "#3f3e3b" : "#5e5953" }}
      >
        <Text className={`${headerClass} w-1/6`}>{t('expense.table.date')}</Text>
        <Text className={`${headerClass} w-1/2`}>{t('expense.table.notedesc')}</Text>
        <Text className={`${headerClass} w-1/4`}>{t('expense.table.amount')}</Text>
        {/* <Text className={`${headerClass} w-1/6`}>File</Text> */}
      </View>
      <FlatList
        data={sortedExpenses} // Use sorted expenses
        renderItem={renderItem}
        keyExtractor={(_item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {selectedExpense && (
        <ExpenseDetail
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}         
          expense={selectedExpense} // Pass the selected expense with 
          
        />
      )}
    </View>
  );
};

export default ExpenseTable;
