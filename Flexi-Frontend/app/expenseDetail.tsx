import {
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { View } from "@/components/Themed";
import * as Print from "expo-print";
import { SecondaryButton } from "@/components/CustomButton";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIExpense from "@/api/expense_api";
import { getMemberId } from "@/utils/utility";
import i18n from "@/i18n";
import { useBusiness } from "@/providers/BusinessProvider";

// Format date in DD/MM/YYYY H:MM AM/PM format
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  // Get hours in 12-hour format
  let hours = parsedDate.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Get minutes
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

interface ExpenseDetailProps {
  visible: boolean;
  onClose: () => void;
  expense: {
    date: string;
    note: string;
    desc: string;
    amount: string;
    image: string;
    id: number;
    group: string;
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
  };
}

export default function ExpenseDetail({
  visible,
  onClose,
  expense,
}: ExpenseDetailProps) {
  console.log("🔍 Initial expense prop:", expense);
  console.log("🔍 Initial expense.group:", expense.group);

  const { t } = useTranslation();
  const { theme } = useTheme();
  const [date, setDate] = useState(expense.date);
  const [note, setNote] = useState(expense.note);
  const [desc, setDesc] = useState(expense.desc);
  const [amount, setAmount] = useState(expense.amount);
  const [image, setImage] = useState(expense.image);
  const [group, setGroup] = useState(expense.group);
  const [error, setError] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isVisible, setIsVisible] = useState(visible);
  const { vat, DocumentType } = useBusiness();
  const [vatIncluded, setVatIncluded] = useState(expense.vat);
  const [vatAmount, setVatAmount] = useState(expense.vatAmount);
  const [withHoldingTax, setWithHoldingTax] = useState(
    expense.withHoldingTax || false
  );
  const [WHTpercent, setWHTpercent] = useState(expense.WHTpercent || 0);
  const [WHTAmount, setWHTAmount] = useState(expense.WHTAmount || 0);
  const [taxType, setTaxType] = useState<"Individual" | "Juristic">(
    "Individual"
  );
  const [branch, setBranch] = useState<string>("headOffice");
  const [sTaxId, setSTaxId] = useState(expense.sTaxId || "");
  const [sName, setSName] = useState(expense.sName || "");
  const [taxInvoiceNo, setTaxInvoiceNo] = useState(expense.taxInvoiceNo || "");
  const [sAddress, setSAddress] = useState(expense.sAddress || "");
  const [isDownloadingWHT, setIsDownloadingWHT] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        console.log("Fetching expense with ID:", expense.id);
        const fetchedExpense = await CallAPIExpense.getExpenseByIdAPI(
          expense.id
        );
        console.log("Fetched expense:", fetchedExpense);
        setDate(fetchedExpense.date);
        setNote(fetchedExpense.note);
        setDesc(fetchedExpense.desc);
        setAmount(fetchedExpense.amount);
        setImage(fetchedExpense.image);
        setGroup(fetchedExpense.group);
        setVatIncluded(fetchedExpense.vat);
        setVatAmount(fetchedExpense.vatAmount);
        setWithHoldingTax(fetchedExpense.withHoldingTax || false);
        setWHTpercent(fetchedExpense.WHTpercent || 0);
        setWHTAmount(fetchedExpense.WHTAmount || 0);
        setSTaxId(fetchedExpense.sTaxId || "");
        setSName(fetchedExpense.sName || "");
        setTaxInvoiceNo(fetchedExpense.taxInvoiceNo || "");
        setSAddress(fetchedExpense.sAddress || "");
        setTaxType(fetchedExpense.taxType || "Individual");
        setBranch(fetchedExpense.branch || "");
      } catch (error) {
        console.error("Error fetching expense:", error);
      }
    };

    fetchExpense();
  }, [expense.id]);

  // Track changes to expense data
  useEffect(() => {
    const checkChanges = () => {
      if (
        note !== expense.note ||
        desc !== expense.desc ||
        amount !== expense.amount ||
        group !== expense.group ||
        image !== expense.image ||
        vatIncluded !== expense.vat ||
        vatAmount !== expense.vatAmount ||
        withHoldingTax !== (expense.withHoldingTax || false) ||
        WHTpercent !== (expense.WHTpercent || 0) ||
        WHTAmount !== (expense.WHTAmount || 0) ||
        sTaxId !== (expense.sTaxId || "") ||
        sName !== (expense.sName || "") ||
        taxInvoiceNo !== (expense.taxInvoiceNo || "") ||
        branch !== (expense.branch || "") ||
        taxType !== (expense.taxType || "Individual") ||
        sAddress !== (expense.sAddress || "")
      ) {
        setHasChanges(true);
      } else {
        setHasChanges(false);
      }
    };

    checkChanges();
  }, [
    note,
    desc,
    amount,
    group,
    image,
    vatIncluded,
    vatAmount,
    withHoldingTax,
    WHTpercent,
    WHTAmount,
    sTaxId,
    sName,
    taxInvoiceNo,
    sAddress,
    taxType,
    branch,
  ]);
  // Update WHTAmount when amount or WHTpercent changes
  useEffect(() => {
    if (withHoldingTax) {
      const amt = Number(amount);
      const percent = Number(WHTpercent);
      setWHTAmount(amt && percent ? (amt * percent) / 100 : 0);
    } else {
      setWHTAmount(0);
    }
  }, [amount, WHTpercent, withHoldingTax]);

  // Handle group changes - disable VAT and WHT for Fuel group
  useEffect(() => {
    if (group === "Fuel") {
      setVatIncluded(false);
      setWithHoldingTax(false);
      setWHTpercent(0);
      setWHTAmount(0);
      setVatAmount(0);
    }
  }, [group]);

  // Update modal visibility when prop changes
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const pickImage = async (allowsEditing = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setHasChanges(true);
    }
  };

  // Function to show delete confirmation
  const showDeleteConfirmation = () => {
    setAlertConfig({
      visible: true,
      title: t("common.delete"),
      message:
        t("expense.detail.deleteConfirmation") ||
        "Are you sure you want to delete this expense?",
      buttons: [
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            deleteExpense();
          },
        },
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () =>
            setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
      ],
    });
  };

  // Function to delete expense
  const deleteExpense = async () => {
    // get memberId from local storage
    const memberId = String(await getMemberId());
    console.log("Member ID:", memberId);
    try {
      const data = await CallAPIExpense.deleteExpenseAPI(expense.id, memberId);
      handleCloseAfterChanges(); // Close modal after successful delete
      if (data.error) throw new Error(data.error);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Add alert config state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  // Close the modal and navigate back to the expense table
  const handleCloseAfterChanges = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Handle update
  const handleUpdateExpense = async () => {
    setError("");

    // Check if all fields are filled
    if (!date || !note || !amount) {
      setAlertConfig({
        visible: true,
        title: t("expense.updated"),
        message: t("expense.updated.message"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("date", date);
      formData.append("note", note);
      formData.append("desc", desc);
      formData.append("amount", amount);
      formData.append("group", group);
      formData.append("vat", vatIncluded ? "true" : "false");
      // Only send withHoldingTax and WHTpercent, let backend calculate WHTAmount
      formData.append("withHoldingTax", withHoldingTax ? "true" : "false");
      formData.append("WHTpercent", WHTpercent.toString());
      formData.append("sTaxId", sTaxId);
      formData.append("sName", sName);
      formData.append("taxInvoiceNo", taxInvoiceNo);
      formData.append("sAddress", sAddress);
      formData.append("taxType", taxType);
      formData.append("branch", branch);
      if (image) {
        formData.append("image", {
          uri: image,
          name: "image.jpg",
          type: "image/jpeg",
        } as unknown as Blob);
      }
      const data = await CallAPIExpense.updateExpenseAPI(expense.id, formData);
      handleCloseAfterChanges(); // Close modal after successful update

      if (data.error) throw new Error(data.error);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Setting Button Group of Expense
  const groupButtonClass = (groupName: string) =>
    `px-4 py-2 rounded-lg mx-1 border-2 ${
      group === groupName
        ? theme === "dark"
          ? "bg-zinc-800 border-secondary"
          : "bg-zinc-200 border-secondary"
        : theme === "dark"
        ? "bg-zinc-800 border-transparent"
        : "bg-zinc-200 border-transparent"
    }`;

  async function downloadWHTDoc(): Promise<void> {
    setIsDownloadingWHT(true);
    try {
      // Prepare data for WHT document
      const supplierName = sName || "";
      const supplierTaxId = sTaxId || "";
      const supplierAddress = sAddress || "";
      const amountStr = amount ? amount.toString() : "";
      const dateStr = date ? formatDate(date) : "";
      const memberId = String(await getMemberId());

      // Debug: Check WHTAmount value
      console.log(
        "🔍 Debug WHTAmount in downloadWHTDoc:",
        WHTAmount,
        typeof WHTAmount
      );
      console.log("🔍 Debug group in downloadWHTDoc:", group, typeof group);

      // Call API to get WHT document PDF blob
      const pdfBlob = await CallAPIExpense.downloadWHTDocAPI({
        sName: supplierName,
        sTaxId: supplierTaxId,
        sAddress: supplierAddress,
        amount: amountStr,
        date: dateStr,
        taxInvoiceNo: taxInvoiceNo || "",
        memberId: memberId || "",
        WHTAmount:
          WHTAmount !== undefined && WHTAmount !== null
            ? WHTAmount.toString()
            : "0",
        group: group || expense?.group || "",
      });
      const fileName = `WHTDocument_${expense.id}.pdf`;
      let fileUri: string;
      if (Platform.OS === "web") {
        // For web, create object URL and print
        fileUri = window.URL.createObjectURL(pdfBlob);
        await Print.printAsync({ uri: fileUri });
        window.URL.revokeObjectURL(fileUri);
      } else {
        // For mobile, save and print
        fileUri = `${require("expo-file-system").documentDirectory}${fileName}`;
        const reader = new FileReader();
        reader.onload = async () => {
          const resultStr =
            typeof reader.result === "string" ? reader.result : "";
          const base64 = resultStr.split(",")[1] || "";
          await require("expo-file-system").writeAsStringAsync(
            fileUri,
            base64,
            { encoding: require("expo-file-system").EncodingType.Base64 }
          );
          await Print.printAsync({ uri: fileUri });
        };
        reader.readAsDataURL(pdfBlob);
      }
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: t("expense.detail.downloadWHTDoc"),
        message: error.message || t("expense.detail.downloadWHTDocError"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
      setIsDownloadingWHT(false);
    }
  }
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={() => onClose()}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#000000aa" : "#bfbfbfaa",
        }}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
            style={{
              width: Platform.OS === "web" ? "50%" : "100%",
              alignSelf: "center",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                flex:
                  Platform.OS === "web"
                    ? image
                      ? 0.8
                      : 0.4
                    : image
                    ? 0.2
                    : 0.1,
                justifyContent: "center",
                width: "100%",
                backgroundColor: theme === "dark" ? "#181818" : "#ffffff",
                borderRadius: 10,
                padding: Platform.OS === "web" ? 20 : 0,
              }}
              onPress={() => {}}
            >
              <View
                className="flex-1 justify-center h-full py-6 px-4 rounded-lg"
                style={{ backgroundColor: "transparent" }}
              >
                <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                  {image && (
                    <Image
                      source={{ uri: image }}
                      style={{ width: 300, height: 300 }}
                      className="mt-4 mb-6 self-center rounded-md"
                    />
                  )}
                </TouchableOpacity>
                <CustomText className="text-center font-bold">
                  {formatDate(date)}
                </CustomText>

                <TextInput
                  style={{
                    fontFamily:
                      i18n.language === "th"
                        ? "IBMPlexSansThai-Medium"
                        : "Poppins-Regular",
                    textAlign: "center",
                    fontSize: 16,
                    color: theme === "dark" ? "#818181" : "#68655f",
                  }}
                  value={desc}
                  onChangeText={setDesc}
                  placeholder={t("expense.detail.description")}
                  placeholderTextColor={
                    theme === "dark" ? "#6d6c67" : "#adaaa6"
                  }
                />
                <TextInput
                  className={`text-center text-2xl font-bold py-3 ${
                    theme === "dark" ? "text-secondary-100" : "text-secondary"
                  }`}
                  value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChangeText={(val) => setAmount(val.replace(/,/g, ""))}
                  placeholder="0.00"
                  placeholderTextColor={
                    theme === "dark" ? "#6d6c67" : "#adaaa6"
                  }
                  keyboardType="numeric"
                />

                {((vat && vatIncluded) ||
                  (DocumentType &&
                    DocumentType.includes("WithholdingTax") &&
                    withHoldingTax)) && (
                  <View
                    style={{
                      marginTop: 8,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      {vat && vatIncluded && (
                        <>
                          <CustomText style={{ textAlign: "right" }}>
                            {t("expense.detail.exclVat") + " :"}
                          </CustomText>
                          <CustomText style={{ textAlign: "right" }}>
                            {t("expense.detail.vat") + " :"}
                          </CustomText>
                        </>
                      )}
                      {DocumentType &&
                        DocumentType.includes("WithholdingTax") &&
                        withHoldingTax && (
                          <CustomText style={{ textAlign: "right" }}>
                            {t("expense.detail.WHTAmount") + " :"}
                          </CustomText>
                        )}
                    </View>
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-end",
                        marginLeft: 12,
                      }}
                    >
                      {vat && vatIncluded && (
                        <>
                          <CustomText style={{ textAlign: "left" }}>
                            {(Number(amount) / 1.07)
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </CustomText>
                          <CustomText style={{ textAlign: "left" }}>
                            {(Number(amount) * 0.07)
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </CustomText>
                        </>
                      )}
                      {DocumentType &&
                        DocumentType.includes("WithholdingTax") &&
                        withHoldingTax && (
                          <CustomText style={{ textAlign: "left" }}>
                            {typeof WHTAmount === "number" && !isNaN(WHTAmount)
                              ? WHTAmount.toFixed(2).replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              : "0.00"}
                          </CustomText>
                        )}
                    </View>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                >
                  {vat && (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 24,
                        opacity: group === "Fuel" ? 0.5 : 1,
                      }}
                      onPress={() => {
                        if (group !== "Fuel") {
                          setVatIncluded(!vatIncluded);
                        }
                      }}
                      disabled={group === "Fuel"}
                    >
                      <Ionicons
                        name={vatIncluded ? "checkbox" : "square-outline"}
                        size={22}
                        color={
                          group === "Fuel"
                            ? theme === "dark"
                              ? "#666666"
                              : "#999999"
                            : theme === "dark"
                            ? "#d0d0d0"
                            : "#c1c1c1"
                        }
                      />
                      <CustomText
                        className="ml-2"
                        style={{
                          color:
                            group === "Fuel"
                              ? theme === "dark"
                                ? "#666666"
                                : "#999999"
                              : undefined,
                        }}
                      >
                        {t("expense.detail.vatIncluded")}
                      </CustomText>
                    </TouchableOpacity>
                  )}
                  {DocumentType && DocumentType.includes("WithholdingTax") && (
                    <>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 8,
                          opacity: group === "Fuel" ? 0.5 : 1,
                        }}
                        onPress={() => {
                          if (group !== "Fuel") {
                            setWithHoldingTax(!withHoldingTax);
                          }
                        }}
                        disabled={group === "Fuel"}
                      >
                        <Ionicons
                          name={withHoldingTax ? "checkbox" : "square-outline"}
                          size={22}
                          color={
                            group === "Fuel"
                              ? theme === "dark"
                                ? "#666666"
                                : "#999999"
                              : theme === "dark"
                              ? "#d0d0d0"
                              : "#c1c1c1"
                          }
                        />
                        <CustomText
                          style={{
                            textAlign: "right",
                            marginLeft: 8,
                            color:
                              group === "Fuel"
                                ? theme === "dark"
                                  ? "#666666"
                                  : "#999999"
                                : undefined,
                          }}
                        >
                          {t("expense.detail.withHoldingTax")}
                        </CustomText>
                      </TouchableOpacity>
                      {withHoldingTax && (
                        <>
                          <TextInput
                            style={{
                              width: 60,
                              borderWidth: 1,
                              borderColor: theme === "dark" ? "#444" : "#ccc",
                              borderRadius: 8,
                              padding: 4,
                              color: theme === "dark" ? "#fff" : "#000",
                              textAlign: "center",
                              opacity: group === "Fuel" ? 0.5 : 1,
                              fontFamily:
                                i18n.language === "th"
                                  ? "IBMPlexSansThai-Medium"
                                  : "Poppins-Regular",
                            }}
                            value={WHTpercent.toString()}
                            onChangeText={(val) => {
                              if (group !== "Fuel") {
                                const num = parseFloat(val);
                                setWHTpercent(isNaN(num) ? 0 : num);
                              }
                            }}
                            placeholder={t("expense.detail.percent")}
                            editable={group !== "Fuel"}
                            keyboardType="numeric"
                          />
                          <CustomText style={{ marginLeft: 4 }}>%</CustomText>
                        </>
                      )}
                    </>
                  )}
                </View>

                <FloatingLabelInput
                  label={t("expense.detail.note")}
                  value={note}
                  onChangeText={setNote}
                />

                {(vatIncluded || withHoldingTax) && (
                  <>
                    <FloatingLabelInput
                      label={t("expense.detail.sName")}
                      value={sName}
                      onChangeText={setSName}
                    />
                    {/* Tax Type Checkboxes Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        marginTop: 8,
                        marginBottom: 8,
                        backgroundColor: "transparent",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 24,
                        }}
                        onPress={() => {
                          setTaxType("Individual");
                          setBranch("");
                        }}
                      >
                        <Ionicons
                          name={
                            taxType === "Individual"
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={22}
                          color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
                        />
                        <CustomText className="ml-2">
                          {t("auth.businessRegister.taxTypeOption.Individual")}
                        </CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 8,
                        }}
                        onPress={() => {
                          setTaxType("Juristic");
                          setBranch("headOffice");
                        }}
                      >
                        <Ionicons
                          name={
                            taxType === "Juristic"
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={22}
                          color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
                        />
                        <CustomText className="ml-2">
                          {t("auth.businessRegister.taxTypeOption.Juristic")}
                        </CustomText>
                      </TouchableOpacity>
                      {taxType === "Juristic" && (
                        <>
                          <TextInput
                            style={{
                              width: 90,
                              borderWidth: 1,
                              borderColor: theme === "dark" ? "#444" : "#ccc",
                              borderRadius: 8,
                              padding: 4,
                              color: theme === "dark" ? "#fff" : "#000",
                              textAlign: "center",
                              marginLeft: 8,
                              fontFamily:
                                i18n.language === "th"
                                  ? "IBMPlexSansThai-Medium"
                                  : "Poppins-Regular",
                              fontSize: 11,
                            }}
                            value={
                              branch === "headOffice"
                                ? t("expense.detail.headOffice")
                                : branch
                            }
                            onChangeText={(text) => {
                              // If user clears the field or types something different, store the raw text
                              if (text === t("expense.detail.headOffice")) {
                                setBranch("headOffice");
                              } else {
                                setBranch(text);
                              }
                            }}
                            placeholder={t("expense.detail.branch")}
                          />
                        </>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginTop: 8,
                        marginBottom: 8,
                        marginHorizontal: 0,
                      }}
                    >
                      <FloatingLabelInput
                        label={t("expense.detail.sTaxId")}
                        value={sTaxId}
                        onChangeText={setSTaxId}
                        containerStyle={{ flex: 1, marginVertical: 0 }}
                      />

                      <FloatingLabelInput
                        label={t("expense.detail.taxInvoiceNo")}
                        value={taxInvoiceNo}
                        onChangeText={setTaxInvoiceNo}
                        containerStyle={{ flex: 1, marginVertical: 0 }}
                      />
                    </View>
                    <FloatingLabelInput
                      label={t("expense.detail.sAddress")}
                      value={sAddress}
                      onChangeText={setSAddress}
                    />
                  </>
                )}
                <View className="flex-row justify-evenly items-center">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row m-1 "
                  >
                    {[
                      {
                        key: "Employee",
                        label: t("expense.detail.group.employee"),
                      },
                      {
                        key: "Freelancer",
                        label: t("expense.detail.group.freelancer"),
                      },
                      {
                        key: "Office",
                        label: t("expense.detail.group.office"),
                      },
                      {
                        key: "OfficeRental",
                        label: t("expense.detail.group.officeRental"),
                      },
                      {
                        key: "CarRental",
                        label: t("expense.detail.group.carRental"),
                      },
                      {
                        key: "Commission",
                        label: t("expense.detail.group.commission"),
                      },
                      {
                        key: "Advertising",
                        label: t("expense.detail.group.advertising"),
                      },
                      {
                        key: "Marketing",
                        label: t("expense.detail.group.marketing"),
                      },
                      {
                        key: "Copyright",
                        label: t("expense.detail.group.copyright"),
                      },
                      {
                        key: "Dividend",
                        label: t("expense.detail.group.dividend"),
                      },
                      {
                        key: "Interest",
                        label: t("expense.detail.group.interest"),
                      },
                      {
                        key: "Influencer",
                        label: t("expense.detail.group.influencer"),
                      },
                      {
                        key: "Accounting",
                        label: t("expense.detail.group.accounting"),
                      },
                      { key: "Legal", label: t("expense.detail.group.legal") },
                      {
                        key: "Taxation",
                        label: t("expense.detail.group.taxation"),
                      },
                      {
                        key: "Transport",
                        label: t("expense.detail.group.transport"),
                      },
                      {
                        key: "Product",
                        label: t("expense.detail.group.product"),
                      },
                      {
                        key: "Packing",
                        label: t("expense.detail.group.packing"),
                      },
                      {
                        key: "Fuel",
                        label: t("expense.detail.group.fuel"),
                      },
                      {
                        key: "Utilities",
                        label: t("expense.detail.group.utility"),
                      },
                      { key: "Others", label: t("expense.detail.group.other") },
                    ].map(({ key, label }) => (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setGroup(key)}
                        className={groupButtonClass(key)}
                      >
                        <CustomText>{label}</CustomText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {error ? (
                  <CustomText className="text-red-500 mt-4">{error}</CustomText>
                ) : null}

                <View className="flex-row justify-evenly mt-2">
                  <TouchableOpacity
                    onPress={() => showDeleteConfirmation()}
                    className=" items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={24} color="#999999" />
                    <CustomText className="text-center mt-1">
                      {t("common.delete")}
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => pickImage()}
                    className=" items-center justify-center"
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color="#999999"
                    />
                    <CustomText className="text-center mt-1">
                      {t("expense.detail.attachBill")}
                    </CustomText>
                  </TouchableOpacity>

                  <SecondaryButton
                    title={t("common.save")}
                    handlePress={handleUpdateExpense}
                    containerStyles="px-12 mt-2"
                    textStyles="!text-white"
                  />
                </View>

                {/* Download WHT Doc & Preview */}
                {withHoldingTax && WHTAmount > 0 && (
                  <View className="flex-row justify-evenly mt-2">
                    <TouchableOpacity
                      onPress={() => downloadWHTDoc()}
                      className=" items-center justify-center"
                      disabled={isDownloadingWHT}
                    >
                      <CustomText
                        className="text-center mt-1"
                        weight="bold"
                        link={!isDownloadingWHT}
                        style={{
                          opacity: isDownloadingWHT ? 0.6 : 1,
                          color: isDownloadingWHT
                            ? theme === "dark"
                              ? "#888"
                              : "#666"
                            : "#00dec1",
                        }}
                      >
                        {isDownloadingWHT
                          ? t("common.creatingDocument") || "Creating Document..."
                          : t("expense.detail.downloadWHTDoc")}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}
                {/* PDF Preview Modal removed: printing is now direct on both web and mobile */}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal to view image */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPressOut={() => setImageModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-90">
              <Image
                source={{
                  uri: image,
                }}
                className="w-full h-full"
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setImageModalVisible(false)}
                className="absolute top-0 right-0 p-4"
              ></TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visible: false }))
          }
        />
      </TouchableOpacity>
    </Modal>
  );
}
