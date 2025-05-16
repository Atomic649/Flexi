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
  Platform, // Import Platform for platform checks
  TextInput, // Import TextInput for password input
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
  const [passwordPdf, setPasswordPdf] = useState<string>(""); // State for password
  const [passwordModalVisible, setPasswordModalVisible] =
    useState<boolean>(false); // State for password modal

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

    const uri =
      result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
    if (!uri) {
      setError("No PDF selected or invalid file.");
      return;
    } else {
      try {
        if (Platform.OS !== "web") {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          console.log("🔥fileInfo", fileInfo);
        } else {
          console.warn("File system operations are not supported on web.");
        }

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
    onRefresh(); // refreshing the table
    try {
      const memberId = await getMemberId();
      const password = passwordPdf; // Use the password from state
      const filePath = pdfUri;
      console.log("🔥filePath", filePath);

      if (memberId && filePath) {
        const formData = new FormData();

        if (Platform.OS === "web") {
          // Handle file upload for web
          const response = await fetch(filePath);
          const blob = await response.blob();
          formData.append("filePath", blob, "file.pdf");
        } else {
          // Handle file upload for native platforms
          formData.append("filePath", {
            uri: filePath,
            name: "file.pdf",
            type: "application/pdf",           
          } as unknown as Blob);
        }

        formData.append("memberId", memberId);
        formData.append("password", password); // Append the password to the form data
        console.log("💡formData", formData);

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
      } else if (error.message === "No password given") {
        setPasswordModalVisible(true);
      } else {
        setError("Failed to process PDF or Invalid Password \n Please try again");
      }
    } finally {
      setPasswordPdf(""); // Clear the password after processing
      setLoading(false);
    }
  };


  const handlePasswordSubmit = () => {
    if (passwordPdf.trim() === "") {
      Alert.alert(t("common.error"), t("expense.alerts.emptyPassword"));
      return;
    }
    setPasswordModalVisible(false);
    confirmAndProcessPdf(); // Proceed with PDF processing
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
              onPress: () => router.push("/(tabs)/expense"),
            },
          ]
        );
        router.push("/(tabs)/expense");
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
    <SafeAreaView
      className={`h-full ${useBackgroundColorClass()} items-center`}
    >
      <View
        className="flex-row items-center justify-between  py-1"
        style={{
          width: Dimensions.get("window").width > 768  ? "50%" : "100%",
        }}
      >
        <TouchableOpacity
          className="items-center justify-center"
          style={{
            backgroundColor: theme === "dark" ? "#6efdd4" : "#6efdd4",
            width: "33%",
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
            width: "33%",
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
            width: "33%",
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
            style={{
              backgroundColor: theme === "dark" ? "#282625" : "#edeceb",
            }}
          >
            <CustomText className="text-center ">
              {error}
            </CustomText>
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
            {pdfUri &&
              (Platform.OS !== "web" ? (
                <WebView
                  className="flex-1 w-full h-full"
                  originWhitelist={["*"]}
                  source={{ uri: pdfUri }}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <iframe
                    src={pdfUri}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                    title="PDF Preview"
                  />
                </View>
              ))}
            <View className="flex-row justify-between px-10 mt-4">
              <Button
                title={t("common.cancel")}
                onPress={() => setModalVisible(false)}
                color="#006eff"
              />
              <Button
                title={t("common.confirm")}
                onPress={() => {
                  confirmAndProcessPdf();       
                                             }}
                color="#ff1713"
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{
            backgroundColor: theme === "dark" ? "#000000aa" : "#efefefaa",
          }}
        >
          <View
            className=" p-6 rounded-lg"
            style={{
              width: "90%",
              maxHeight: "30%",
              backgroundColor: theme === "dark" ? "#171717" : "#ffffff",
            }}
          >
            <CustomText className="text-center text-lg font-pmedium mb-4">
              {t("expense.alerts.enterPassword")}
            </CustomText>
            {/* <Text className="text-center text-base font-normal mb-2 ">
              {t("expense.alerts.deleteFile")}
            </Text> */}
            <TextInput
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme === "dark" ? "#6d6c67" : "#adaaa6",
                borderRadius: 8,
                padding: 10,
                marginBottom: 20,
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
              placeholder={t("expense.alerts.password")}
              placeholderTextColor={theme === "dark" ? "#6d6c67" : "#adaaa6"}
              secureTextEntry={true}
              value={passwordPdf}
              onChangeText={setPasswordPdf}
              keyboardType="numeric"
            />
            <View className="flex-row justify-between">
              <Button
                title={t("common.cancel")}
                onPress={() => setPasswordModalVisible(false)}
                color="#0d70f0"                
              />
              <Button
                title={t("common.confirm")}
                onPress={() => {
                  handlePasswordSubmit();
                  console.log("🔑Password", passwordPdf);
                }}                
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
