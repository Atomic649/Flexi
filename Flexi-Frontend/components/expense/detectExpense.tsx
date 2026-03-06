import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  TextInput,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import ExpenseTable from "./ExpenseTable";
import { getMemberId } from "@/utils/utility";
import CallAPIExpense from "@/api/expense_api";
import CallAPIBill from "@/api/bill_api";
import { router } from "expo-router";
import ExpenseDetail from "@/app/expenseDetail";
import CreateExpense from "@/app/createAExpense";
import { CustomText } from "../CustomText";
import { useTranslation } from "react-i18next";
import { TextButtonCancle, TextButtonComfirm } from "../CustomButton";
import i18n from "@/i18n";
import CustomAlert from "../CustomAlert";

export default function DetectExpense() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isCreateExpenseVisible, setIsCreateExpenseVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordPdf, setPasswordPdf] = useState<string>(""); // State for password
  const [passwordModalVisible, setPasswordModalVisible] =
    useState<boolean>(false); // State for password modal
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Added refresh trigger
  // Custom alert state (replaces Alert.alert)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  // FlexiID lookup modal state
  const [flexiModalVisible, setFlexiModalVisible] = useState(false);
  const [flexiIdInput, setFlexiIdInput] = useState("");
  const [flexiLoading, setFlexiLoading] = useState(false);
  const [flexiError, setFlexiError] = useState<string | null>(null);
  const [flexiPrefillData, setFlexiPrefillData] = useState<any>(null);

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
    onRefresh();
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    console.log("🔥result", result);

    const uri =
      result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
    if (!uri) {
      setError("");
      return;
    } else {
      try {
        let finalUri = uri;
        if (Platform.OS === "ios") {
          const destPath = `${FileSystem.documentDirectory}preview.pdf`;
          await FileSystem.copyAsync({
            from: uri,
            to: destPath,
          });
          finalUri = destPath;
        }

        if (Platform.OS !== "web") {
          const fileInfo = await FileSystem.getInfoAsync(finalUri);
          console.log("🔥fileInfo", fileInfo);
        } else {
          console.warn("File system operations are not supported on web.");
        }

        setPdfUri(finalUri);
        setModalVisible(true);
        console.log("🔥pdfUriChoose", finalUri);
      } catch (error) {
        console.error("🚨pickAndProcessPdf", error);
        // Clear inline error and show a CustomAlert instead
        setError(null);
        setAlertTitle(t("common.error"));
        setAlertMessage("Failed to process PDF");
        setAlertButtons([
          { text: t("common.ok"), onPress: () => setAlertVisible(false) },
        ]);
        setAlertVisible(true);
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

      // Axios error with response
        const status = error?.response?.status || error?.status || (error?.statusCode ?? null);
        const serverMessage =
          (error && typeof error === "object" && (error.message || error?.data?.message)) ||
          (typeof error === "string" ? error : undefined) ||
          error?.response?.data?.message;

        const msg = String(serverMessage || "");

        if (status === 409 || /duplicate/i.test(msg)) {
          // Duplicate data
          setAlertTitle(t("common.error"));
          setAlertMessage(t("Duplicate data found"));
          setAlertButtons([
            { text: t("common.ok"), onPress: () => setAlertVisible(false) },
          ]);
          setAlertVisible(true);
        } else if (/no password/i.test(msg) || msg === "No password given") {
          // Server demands a password — open password modal
          setPasswordModalVisible(true);
        } else {
          // Generic failure
          setAlertTitle(t("common.error"));
          setAlertMessage(
            t("expense.alerts.failedPdf") || "Failed to process PDF or Invalid Password\nPlease try again"
          );
          setAlertButtons([
            { text: t("common.ok"), onPress: () => setAlertVisible(false) },
          ]);
          setAlertVisible(true);
      }
    } finally {
      setPasswordPdf(""); // Clear the password after processing
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordPdf.trim() === "") {
      setAlertTitle(t("common.error"));
      setAlertMessage(t("expense.alerts.emptyPassword"));
      setAlertButtons([
        { text: t("common.ok"), onPress: () => setAlertVisible(false) },
      ]);
      setAlertVisible(true);
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
        // Increment refresh trigger to force reload of table
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setRefreshing(false);
    }
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
        setAlertTitle(t("expense.alerts.successTitle"));
        setAlertMessage(t("expense.alerts.successMessage"));
        setAlertButtons([
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertVisible(false);
              router.replace({
                pathname: "/(tabs)/expense",
              });
            },
          },
        ]);
        setAlertVisible(true);
        // Navigation will occur when the alert button's onPress is executed
      } catch (error) {
        console.error("Error saving expenses:", error);
      }
    }
  };

  const handleAdd = () => {
    setIsCreateExpenseVisible(true);
  };

  const handleFlexiLookup = async () => {
    const trimmed = flexiIdInput.trim();
    if (!trimmed) {
      setFlexiError(t("expense.flexi.emptyId", "กรุณากรอก FlexiID"));
      return;
    }
    setFlexiError(null);
    setFlexiLoading(true);
    try {
      const bill = await CallAPIBill.lookupBillByFlexiIdAPI(trimmed);

      const isInvoice = bill.documentType === "Invoice";
      const amount = Number(bill.totalAfterTax ?? bill.total ?? 0);

      // Build desc from product list
      const descLines: string[] = (bill.products ?? []).map((p: any) =>
        `${p.name} x${p.quantity}${p.unit && p.unit !== "NotSpecified" ? ` ${p.unit}` : ""} ${p.unitPrice} บาท`
      );
      const desc = descLines.join("\n");

      setFlexiPrefillData({
        sName: bill.supplier?.name ?? "",
        sTaxId: bill.supplier?.taxId ?? "",
        sAddress: bill.supplier?.address ?? "",
        taxType: bill.supplier?.taxType ?? bill.taxType ?? "Individual",
        taxInvoiceNo: bill.taxInvoiceNo ?? "",
        amount,
        vatIncluded: !!(bill.vatAmount && Number(bill.vatAmount) > 0),
        vatAmount: Number(bill.vatAmount ?? 0),
        withHoldingTax: !!bill.withHoldingTax,
        WHTpercent: Number(bill.WHTpercent ?? 0),
        WHTAmount: Number(bill.WHTAmount ?? 0),
        isDebt: isInvoice,
        desc,
        purchaseAt: bill.purchaseAt ?? new Date().toISOString(),
      });
      setFlexiModalVisible(false);
      setFlexiIdInput("");
      setIsCreateExpenseVisible(true);
    } catch (e: any) {
      const msg = e?.message || t("expense.flexi.notFound", "ไม่พบเอกสาร กรุณาตรวจสอบ FlexiID");
      setFlexiError(msg);
    } finally {
      setFlexiLoading(false);
    }
  };

  const toggleExpenseDetail = (expense: any) => {
    setSelectedExpense(expense);
    setRefreshTrigger((prev) => prev + 1); // Increment refresh trigger when viewing an expense
  };

  // Handle expense edit closure
  const handleExpenseDetailClose = () => {
    setSelectedExpense(null);
    onRefresh(); // Refresh the list when detail view is closed
  };

  return (
    <View
      className={`h-full ${useBackgroundColorClass()} items-center`}
      style={{ flex: 1, minHeight: 0 }}
    >
      <View
        className="flex-row items-center justify-between  py-1"
        style={{
          width: Dimensions.get("window").width > 768 ? "55%" : "100%",
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
          onLongPress={() => {
            setFlexiIdInput("");
            setFlexiError(null);
            setFlexiModalVisible(true);
          }}
          delayLongPress={500}
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
            backgroundColor: theme === "dark" ? "#04ecc1" : "#04ecc1",
            width: "33%",
            height: 50,
            alignSelf: "center",
          }}
          onPress={pickAndProcessPdf}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#3b3b3b" />
              <CustomText
                className="text-center text-xs font-bold pt-1"
                weight="semibold"
                style={{ color: "#3b3b3b" }}
              >
                {t("expense.buttons.detecting")}
              </CustomText>
            </>
          ) : (
            <>
              <FontAwesome
                name="file-pdf-o"
                size={24}
                color={theme === "dark" ? "primary" : "#3b3b3b"}
              />
              <CustomText
                className="text-center text-xs font-bold pt-1"
                weight="semibold"
                style={{ color: theme === "dark" ? "primary" : "#3b3b3b" }}
              >
                {t("expense.buttons.pdf")}
              </CustomText>
            </>
          )}
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
          <CustomText
            className="text-center text-base font-bold"
            weight="semibold"
            style={{ color: theme === "dark" ? "primary" : "#3b3b3b" }}
          >
            {t("expense.buttons.save")}
          </CustomText>
        </TouchableOpacity>
      </View>

      {expenses.length > 0 && (
        <ExpenseTable
          expenses={expenses}
          onRowPress={toggleExpenseDetail} // Pass the toggle function to the table
          refreshTrigger={refreshTrigger} // Pass the refresh trigger
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
            <CustomText className="text-center ">{error}</CustomText>
          </View>
        </View>
      )}

      {selectedExpense && (
        <ExpenseDetail
          visible={!!selectedExpense}
          onClose={handleExpenseDetailClose}
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
                  allowingReadAccessToURL={pdfUri}
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
              <TextButtonCancle
                title={t("common.cancel")}
                handlePress={() => setModalVisible(false)}
              />
              <TextButtonComfirm
                title={t("common.confirm")}
                handlePress={() => {
                  confirmAndProcessPdf();
                }}
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
                fontFamily:
                  i18n.language === "th"
                    ? "IBMPlexSansThai-Medium"
                    : "Poppins-Regular",
              }}
              placeholder={t("expense.alerts.password")}
              placeholderTextColor={theme === "dark" ? "#6d6c67" : "#adaaa6"}
              secureTextEntry={true}
              value={passwordPdf}
              onChangeText={setPasswordPdf}
              keyboardType="numeric"
            />
            <View className="flex-row justify-around">
              <TextButtonCancle
                title={t("common.cancel")}
                handlePress={() => setPasswordModalVisible(false)}
              />
              <TextButtonComfirm
                title={t("common.confirm")}
                handlePress={() => {
                  handlePasswordSubmit();
                  console.log("🔑Password", passwordPdf);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* FlexiID Lookup Modal */}
      <Modal
        visible={flexiModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFlexiModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme === "dark" ? "#000000bb" : "#00000055",
          }}
        >
          <View
            style={{
              width: "88%",
              borderRadius: 16,
              padding: 24,
              backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff",
            }}
          >
            <CustomText
              weight="semibold"
              style={{
                fontSize: 16,
                marginBottom: 6,
                color: theme === "dark" ? "#ffffff" : "#111111",
              }}
            >
              {t("expense.flexi.title", "ดึงเอกสารจาก FlexiID")}
            </CustomText>
            <CustomText
              style={{
                fontSize: 12,
                marginBottom: 16,
                color: theme === "dark" ? "#888" : "#777",
              }}
            >
              {t("expense.flexi.subtitle", "วางรหัส FlexiID ของใบเสร็จหรือใบแจ้งหนี้ที่ต้องการบันทึกเป็นรายจ่าย")}
            </CustomText>

            {/* Input row */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme === "dark" ? "#444" : "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: theme === "dark" ? "#fff" : "#111",
                  fontSize: 13,
                  fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Regular" : "Poppins-Regular",
                  backgroundColor: theme === "dark" ? "#2c2c2e" : "#f5f5f5",
                }}
                placeholder="FlexiID"
                placeholderTextColor={theme === "dark" ? "#555" : "#aaa"}
                value={flexiIdInput}
                onChangeText={(v) => { setFlexiIdInput(v); setFlexiError(null); }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={async () => {
                  const text = await Clipboard.getStringAsync();
                  if (text) { setFlexiIdInput(text.trim()); setFlexiError(null); }
                }}
                style={{
                  marginLeft: 8,
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: theme === "dark" ? "#2c2c2e" : "#f0f0f0",
                }}
              >
                <Ionicons name="clipboard-outline" size={20} color={theme === "dark" ? "#aaa" : "#555"} />
              </TouchableOpacity>
            </View>

            {flexiError && (
              <CustomText style={{ color: "#e74c3c", fontSize: 12, marginBottom: 10 }}>
                {flexiError}
              </CustomText>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
              <TextButtonCancle
                title={t("common.cancel")}
                handlePress={() => { setFlexiModalVisible(false); setFlexiIdInput(""); setFlexiError(null); }}
              />
              <TouchableOpacity
                onPress={handleFlexiLookup}
                disabled={flexiLoading}
                style={{
                  backgroundColor: "#04ecc1",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: flexiLoading ? 0.6 : 1,
                }}
              >
                {flexiLoading
                  ? <ActivityIndicator size="small" color="#004d40" />
                  : (
                    <CustomText weight="semibold" style={{ color: "#004d40", fontSize: 14 }}>
                      {t("expense.flexi.fetch", "ดึงเอกสาร")}
                    </CustomText>
                  )
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CreateExpense
        success={() => {
          onRefresh();
          console.log("🔥 Refreshed after create");
        }}
        visible={isCreateExpenseVisible}
        onClose={() => {
          setIsCreateExpenseVisible(false);
          setFlexiPrefillData(null);
        }}
        expense={{
          date: "",
          note: "",
          desc: "",
          amount: "",
          image: "",
          pdf: "",
          id: 0,
          group: "",
        }}
        prefillData={flexiPrefillData ?? undefined}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}
