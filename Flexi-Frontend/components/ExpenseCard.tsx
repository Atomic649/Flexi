import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CustomText } from "./CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import { t } from "i18next";
import CallAPIExpense from "@/api/expense_api";
import { getMemberId } from "@/utils/utility";
import CustomAlert from "@/components/CustomAlert";
import { SwipeableRow, SwipeAction } from "./swipe/SwipeableRow";

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatNumber = (number: number | string) => {
  const num = typeof number === "string" ? parseFloat(number) : number;
  return num.toLocaleString("en-US");
};

export default function ExpenseCard({
  id,
  date,
  expenses,
  type,
  note,
  desc,
  sName,
  image,
  AdsCardColor,
  ExCardColor,
  Opacity,
  NoteColor,
  DescColor,
  onDelete,
  bgExpenseDetail,
  titleColor,
  DocumentType,
  debtAmount,
  onPaid,
}: any) {
  const [detailVisible, setDetailVisible] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [infoAlert, setInfoAlert] = useState<{ title: string; message: string } | null>(null);
  const [resultAlert, setResultAlert] = useState<{ title: string; message: string } | null>(null);
  const isDebt = DocumentType === "Invoice";

  const handleMarkAsPaid = async () => {
    try {
      const fetchedExpense = await CallAPIExpense.getExpenseByIdAPI(Number(id));
      const formData = new FormData();
      formData.append("date", fetchedExpense.date);
      formData.append("note", fetchedExpense.note || "");
      formData.append("desc", fetchedExpense.desc || "");
      formData.append("amount", String(fetchedExpense.debtAmount ?? 0));
      formData.append("group", fetchedExpense.group || "");
      formData.append("vat", fetchedExpense.vat ? "true" : "false");
      formData.append("vatAmount", String(fetchedExpense.vatAmount ?? 0));
      formData.append("withHoldingTax", fetchedExpense.withHoldingTax ? "true" : "false");
      formData.append("WHTpercent", String(fetchedExpense.WHTpercent ?? 0));
      formData.append("WHTAmount", String(fetchedExpense.WHTAmount ?? 0));
      formData.append("sTaxId", fetchedExpense.sTaxId || "");
      formData.append("sName", fetchedExpense.sName || "");
      formData.append("taxInvoiceNo", fetchedExpense.taxInvoiceNo || "");
      formData.append("sAddress", fetchedExpense.sAddress || "");
      formData.append("taxType", fetchedExpense.taxType || "Individual");
      formData.append("branch", fetchedExpense.branch || "");
      formData.append("DocumentType", "Receipt");
      formData.append("debtAmount", "0");
      await CallAPIExpense.updateExpenseAPI(Number(id), formData);
      onPaid?.();
    } catch (err) {
      console.error("Failed to mark as paid", err);
      setResultAlert({ title: "Error", message: String((err as any)?.message || err) });
    }
  };

  const getExpenseTextColor = (type: string) => {
    switch (type) {
      case "ads":
        return "#ff2a0085";
      case "expense":
        return "#ff2a00";
      default:
        return "#61fff2"; // Default color
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case "ads":
        return AdsCardColor;
      case "expense":
        return ExCardColor;
      default:
        return "#61fff2"; // Default color
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const onConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(id);
  };

  const handleEdit = () => {
    setInfoAlert({ title: "Not available", message: "Coming Soon, Please Delete and create new expense" });
  };

  const duplicateExpense = async () => {
    try {
      setIsDuplicating(true);
      // Call backend duplicate endpoint which clones the expense without copying image and marks save=true
      await CallAPIExpense.duplicateExpenseAPI(Number(id));
      setResultAlert({ title: t("common.success") || "Success", message: t("expense.duplicateSuccess") || "Expense duplicated successfully" });
    } catch (err) {
      console.error("Failed to duplicate expense", err);
      setResultAlert({ title: "Error", message: String((err as any)?.message || err) });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleLongPress = () => {
    setShowConfirm(true);
  };

  const onConfirmDuplicate = () => {
    setShowConfirm(false);
    duplicateExpense();
  };

  const leftActions: SwipeAction[] = [];
  if (isDebt && type === "expense") {
    leftActions.push({
      id: "paid",
      icon: "checkmark-circle",
      text: t("expense.create.paid"),
      backgroundColor: "#3bf6da",
      textColor: "#000",
      onPress: handleMarkAsPaid,
    });
  }

  const cardContent = (
    <TouchableOpacity
      onPress={() => {
        if (type === "expense") {
          router.push({
            pathname: "/expenseDetailScreen",
            params: { id, date, expenses, note, desc, image, type },
          });
        } else if (type === "ads") {
          router.push({
            pathname: "/editAdsCost",
            params: { id, date, expenses },
          });
        }
      }}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View
        className={`flex flex-col pt-3 pb-4 px-4 pe-16 my-1 rounded-se-md`}
        style={{ backgroundColor: getCardColor(type) }}
      >
        <View className="flex flex-row gap-3 items-center">
          <View className="flex justify-center items-center flex-row flex-1">
            <View className="flex justify-center flex-1 ml-3 ">
              <Text
                className="text-sm text-zinc-500 font-normal"
                numberOfLines={1}
              >
                {formatDate(date)}
              </Text>
              <CustomText
                className="text-sm font-normal pt-2"
                style={{ color: DescColor }}
                numberOfLines={1}
              >
                {type === "ads" ? note : sName || desc}
              </CustomText>
              <CustomText
                className="text-base font-psemibold pt-1"
                weight="semibold"
                style={{ color: NoteColor }}
                numberOfLines={1}
              >
                {type === "ads" ? t("expense.forecastAdsCost") : note}
              </CustomText>
            </View>
          </View>
          <View className="flex-colum items-end">
            <Text
              className="text-xl font-bold justify-end"
              style={{ color: getExpenseTextColor(type) }}
              numberOfLines={1}
            >
              -{formatNumber(expenses)}
            </Text>
            {type === "expense" && (
              <Ionicons
                className="text-end mt-2 justify-end"
                name="document-text-outline"
                size={16}
                color={
                  !image
                    ? theme === "dark"
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(103, 103, 103, 0.3)"
                    : theme === "dark"
                    ? "white"
                    : "#676767"
                }
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View
        style={{
          width: Platform.OS === "web" ? "100%" : "100%",
          maxWidth: 500,
          minWidth: 350,
          alignSelf: "center",
        }}
      >
        <SwipeableRow
          leftActions={leftActions}
          disabled={!isDebt || type !== "expense"}
          threshold={80}
          actionWidth={80}
          actionHeight="92%"
          actionBorderRadius={0}
        >
          {cardContent}
        </SwipeableRow>
      </View>

      {/* ExpenseDetail Modal for ads */}
      <CustomAlert
        visible={showConfirm}
        title={t("expense.confirmDuplicate") || "Duplicate expense?"}
        message={""}
        onClose={() => setShowConfirm(false)}
        buttons={[
          { text: t("common.cancel") || "Cancel", onPress: () => setShowConfirm(false), style: "cancel" },
          { text: t("common.ok") || "OK", onPress: onConfirmDuplicate },
        ]}
      />

      <CustomAlert
        visible={showDeleteConfirm}
        title={"Delete"}
        message={"Are you sure you want to delete this report?"}
        onClose={() => setShowDeleteConfirm(false)}
        buttons={[
          { text: t("common.cancel") || "Cancel", onPress: () => setShowDeleteConfirm(false), style: "cancel" },
          { text: "Delete", onPress: onConfirmDelete, style: "destructive" },
        ]}
      />

      {infoAlert && (
        <CustomAlert
          visible={true}
          title={infoAlert.title}
          message={infoAlert.message}
          onClose={() => setInfoAlert(null)}
          buttons={[{ text: t("common.ok") || "OK", onPress: () => setInfoAlert(null) }]}
        />
      )}

      {resultAlert && (
        <CustomAlert
          visible={true}
          title={resultAlert.title}
          message={resultAlert.message}
          onClose={() => setResultAlert(null)}
          buttons={[{ text: t("common.ok") || "OK", onPress: () => setResultAlert(null) }]}
        />
      )}
      {detailVisible && (
        <Modal
          visible={detailVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setDetailVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: bgExpenseDetail,
            }}
            activeOpacity={1}
            onPressOut={() => setDetailVisible(false)} // Close modal on tap outside
          >
            <View
              style={{
                flex: 1,
                backgroundColor: getCardColor(type),
                borderRadius: 10,
                width: Platform.OS === "web" ? "50%" : "90%",
                maxHeight: image ? "75%" : "23%",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              {/* image view */}
              {image && (
                <Image
                  source={{ uri: image }}
                  style={{
                    width: "100%",
                    height: "70%",
                  }}
                  resizeMode="cover"
                />
              )}
              <View
                style={{
                  padding: 10,
                  borderRadius: 10,
                  width: Platform.OS === "web" ? "60%" : "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: getExpenseTextColor(type),
                    fontSize: 24,
                    fontWeight: "bold",
                    padding: 10,
                  }}
                  numberOfLines={1}
                >
                  {formatNumber(expenses)}
                </Text>
                <Text
                  style={{
                    color: titleColor,
                    fontSize: 14,
                    fontWeight: "normal",
                  }}
                  numberOfLines={1}
                >
                  {formatDate(date)}
                </Text>

                <Text
                  style={{
                    color: DescColor,
                    fontSize: 14,
                    fontWeight: "normal",
                  }}
                  numberOfLines={1}
                >
                  {type === "ads" ? note : desc}
                </Text>
                <Text
                  style={{
                    color: NoteColor,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                  numberOfLines={1}
                >
                  {type === "ads" ? t("expense.forecastAdsCost") : note}
                </Text>
                <Text
                  style={{
                    color: DescColor,
                    fontSize: 16,
                    fontWeight: "normal",
                  }}
                  numberOfLines={1}
                >
                  {type}
                </Text>
                {/* Icon Command */}
                <View className="w-full flex-row  justify-between pt-2 px-6">
                  <TouchableOpacity onPress={handleDelete}>
                    <Ionicons
                      name="trash"
                      size={26}
                      color="#999999"
                      className="p-2"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleEdit}>
                    <Ionicons
                      name="pencil"
                      size={26}
                      color="#999999"
                      className="p-2"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}
