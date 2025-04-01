import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
  Dimensions,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import ExpenseTable from "./ExpenseTable";
import { getMemberId } from "@/utils/utility";
import CallAPIExpense from "@/api/expense_api";
import { router } from "expo-router";
import ExpenseDetail from "@/app/expenseDetail"; // Import the ExpenseDetail component
import CreateExpense from "@/app/createAExpense"; // Import the CreateExpense component
import { CustomText } from "../CustomText";
import { useTranslation } from "react-i18next";

export default function DetectExpense() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const screenWidth = Dimensions.get("window").width;
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isCreateExpenseVisible, setIsCreateExpenseVisible] = useState(false);
  const [isCreateSuccess, setIsCreateSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // auto delete if save is false
  const autoDelete = async () => {
    try {
      const response = await CallAPIExpense.autoDeleteExpenseAPI();
      console.log("🔥response", response);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const pickAndProcessPdf = async () => {
    autoDelete();
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    console.log("🔥result", result);

    //get uri from result
    const uri =
      result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
    if (!uri) {
      setError("No PDF selected or invalid file.");
      return;
    }
    else{
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log("🔥fileInfo", fileInfo);
  
        setPdfUri(uri);
        setModalVisible(true);
        console.log("🔥pdfUriChoose", pdfUri);
      } catch (error) {
        console.error("🚨pickAndProcessPdf", error);
        setError("Failed to process PDF");
      }

    }
    
  };

  const confirmAndProcessPdf = async () => {
    setModalVisible(false);
    setLoading(true);    
    onRefresh();//refreshing the table
    try {
      const memberId = await getMemberId();
      const filePath = pdfUri;
      console.log("🔥filePath", filePath);

      if (memberId && filePath) {
        const formData = new FormData();
        formData.append("filePath", {
          uri: filePath,
          name: "file.pdf",
          type: "application/pdf",
        } as unknown as Blob);
        formData.append("memberId", memberId);

        const response = await CallAPIExpense.extractPDFExpenseAPI(formData);
        if (response.message === "Expenses created successfully") {
          setError(null);
          setExpenses(response.expenses);
          console.log("🔥response", response);
        } else {
          console.error("No expenses found in the PDF.");
        }
      } else {
        console.error("Member ID is null or filePath is null");
      }
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      if (error.message === "Duplicate data found") {
        setError("Duplicate data found");
      } else {
        setError("Failed to process PDF");
      }
    } finally {
      setLoading(false);
    }
  };

  // refreshing table
  const onRefresh = useCallback(async () => {
      setRefreshing(true);
      console.log("🔥 Refreshing...");
      
      try {
        const memberId = String(await getMemberId());
        console.log("Member ID:", memberId);
        if (memberId) {
          const expenses = await CallAPIExpense.getAllExpensesAPI(memberId);
          setExpenses(expenses);
          setError(null);
          setRefreshing(true);
         
        }
      } catch (error) {
        console.error("Error refreshing expenses", error);
      }
      setRefreshing(false);
    }, []);
  

  const handleSave = async () => {
    const allExpenseIds = expenses.map((expense) => expense.id);
    console.log("🔥allExpenseIds", allExpenseIds);

    if (allExpenseIds.length > 0) {
      try {
        const response = await CallAPIExpense.saveDetectExpenseAPI(
          allExpenseIds
        );
        console.log("🔥response", response);
        setExpenses([]); // Clear all data in
        Alert.alert(
          t("expense.alerts.successTitle"),
          t("expense.alerts.successMessage"),
          [
            {
              text: t("common.ok"),
              onPress: () => router.push("(tabs)/expense"),
            },
          ]
        );
          router.push("(tabs)/expense");
      } catch (error) {
        console.error("Error saving expenses:", error);
      }
    }
  };

  // if create success, refresh the page
  useEffect(() => {
    if (isCreateSuccess) {
      onRefresh();
      setIsCreateSuccess(false);
      console.log("🔥 Refreshing... after create");
    }
  }, [isCreateSuccess]);

  

  const handleAdd = () => {
    setIsCreateExpenseVisible(true);
  };

  const toggleExpenseDetail = (expense: any) => {
    setSelectedExpense(expense);
  };

  
  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity
          className="items-center justify-center"
          style={{
            backgroundColor: theme === "dark" ? "#6efdd4" : "#6efdd4",
            width: screenWidth / 3 - 10,
            height: 50,
            alignSelf: "center",
          }}
          onPress={handleAdd}
        >
          <Ionicons
            name="add"
            size={24}
            color={theme === "dark" ? "primary" : "#3b3b3b"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center justify-center "
          style={{
            backgroundColor: theme === "dark" ? "#0feac2" : "#0feac2",
            width: screenWidth / 3 - 10,
            height: 50,
            alignSelf: "center",
          }}
          onPress={pickAndProcessPdf}
        >
          <FontAwesome
            name="file-pdf-o"
            size={24}
            color={theme === "dark" ? "primary" : "#3b3b3b"}
          />
            <Text
            className="text-center text-xs font-bold"
            style={{ color: theme === "dark" ? "primary" : "#3b3b3b" }}
            >
            {t("expense.buttons.pdf")}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center justify-center"
          style={{
            backgroundColor: theme === "dark" ? "#fbac03ff" : "#ffd000",
            width: screenWidth / 3 - 10,
            height: 50,
            alignSelf: "center",
          }}
          onPress={handleSave}
        >
          <Text
            className="text-center text-base font-bold"
            style={{ color: theme === "dark" ? "primary" : "#3b3b3b" }}
          >
            {t("expense.buttons.save")}
          </Text>
        </TouchableOpacity>
      </View>

      {expenses.length > 0 && (
        <ExpenseTable
          expenses={expenses}
          onRowPress={toggleExpenseDetail} // Pass the toggle function to the table
        />
      )}
      {error && (
        <View className="flex-1 justify-center items-center ">
          <View
            className="p-8 rounded-2xl"
            style={{ backgroundColor: theme === "dark" ? "#282625" : "#edeceb" }}
          >
            <CustomText className="text-center ">{t("expense.table.pdferror")}</CustomText>
          </View>
        </View>
      )}

      {selectedExpense && (
        <ExpenseDetail
          visible={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          expense={selectedExpense}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center "
          style={{
            backgroundColor: theme === "dark" ? "#000000aa" : "#ffffffaa",
          }}
        >
          <View
            className="bg-white p-4 rounded-lg "
            style={{ width: "90%", height: "62%" }}
          >
            {loading && <ActivityIndicator size="large" />}
            {pdfUri && (
              <WebView
                className="flex-1 w-full h-full"
                originWhitelist={["*"]}
                source={{ uri: pdfUri }}
              />
            )}
            <View className="flex-row justify-between px-10 mt-4">
              <Button
              title={t("common.cancel")}
              onPress={() => setModalVisible(false)}
              color="#006eff"
              />
              <Button
              title={t("common.confirm")}
              onPress={confirmAndProcessPdf}
              color="#ff1713"
              />
            </View>
          </View>
        </View>
      </Modal>

      <CreateExpense
        success={() => {
          setIsCreateSuccess(true);
          onRefresh();
          console.log("🔥isCreateSuccess", isCreateSuccess);
        }}
        visible={isCreateExpenseVisible}
        onClose={() => setIsCreateExpenseVisible(false)}
        expense={{
          date: "",
          note: "",
          desc: "",
          amount: "",
          image: "",
          id: 0,
          group: "",
        }}
      />
    </SafeAreaView>
  );
}
