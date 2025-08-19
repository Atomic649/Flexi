import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from "react-native";
import React from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";
import { router } from "expo-router";
import { CustomText } from "./CustomText";
import { useTranslation } from "react-i18next";

const formatDate = (dateString: string) => {
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

export default function BillCard({
  id,
  cName,
  cLastName,
  product = [], // Expecting array of { product, quantity, unitPrice }
  total,
  purchaseAt,
  CardColor,
  PriceColor,
  cNameColor,
  iconColor,
  getBorderColor,
  onUpdateDocumentType, // New prop for updating document type
  currentDocumentType, // Current document type to show appropriate actions
}: any) {
  const { t } = useTranslation();

  const handleCustomerConfirm = () => {
    if (onUpdateDocumentType) {
      onUpdateDocumentType(id, "Invoice");
    }
  };

  const handleCustomerPaid = () => {
    if (onUpdateDocumentType) {
      onUpdateDocumentType(id, "Receipt");
    }
  };

  // Get status text based on DocumentType
  const getStatusText = (docType: string) => {
    switch (docType) {
      case "Quotation":
        return t("bill.status.waitingResponse") || "Waiting for response";
      case "Invoice":
        return t("bill.status.waitingPayment") || "Waiting for payment";
      case "Receipt":
        return t("bill.status.paid") || "Paid";
      default:
        return "";
    }
  };

  // Get status color based on DocumentType
  const getStatusColor = (docType: string) => {
    switch (docType) {
      case "Quotation":
        return cNameColor; // Waiting for response
      case "Invoice":
        return "#ffa12e"; // Waiting for payment
      case "Receipt":
        return PriceColor; // Paid
      default:
        return "#6b7280"; // Gray - unknown
    }
  };

  const renderLeftActions = () => {
    // Don't show actions if no update function is provided or if DocumentType is "Receipt"
    if (!onUpdateDocumentType || currentDocumentType === "Receipt") return null;

    return (
      <View className="flex-row">
        {/* Customer Confirm - Update to Invoice */}
        {currentDocumentType !== "Invoice" && (
          <TouchableOpacity
            onPress={handleCustomerConfirm}
            className="bg-[#ffa12e] justify-center items-center w-20 rounded-lg mr-2"
          >
            <Ionicons name="checkmark-circle" size={24} color={iconColor} />
            <Text className="text-xs font-semibold mt-1 text-center" style={{ color: iconColor }}>
              {t("bill.confirm") || "Confirm"}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Customer Paid - Update to Receipt */}
        {currentDocumentType !== "Receipt" && (
          <TouchableOpacity
            onPress={handleCustomerPaid}
            className="justify-center items-center w-20 rounded-lg"
            style={{ backgroundColor: PriceColor }}
          >
            <Ionicons name="cash" size={24} color={iconColor} />
            <Text className="text-xs font-semibold mt-1 text-center" style={{ color: iconColor }}>
              {t("bill.paid") || "Paid"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const cardContent = (
    <View
      className="flex "
      style={{
        width: Platform.OS === "web" ? "100%" : "100%",
        maxWidth: 500,
        minWidth: 350,
        alignSelf: "center",
      }}
    >
      <View
        className={`flex flex-col items-center pt-3 pb-4 px-4 pe-12  my-1 rounded-se-md          
         border-r-4 `}
        style={{
          borderColor: getBorderColor,
          backgroundColor: CardColor,
        }}
      >
        <View className="flex flex-row items-between w-full">
          <View className="flex  flex-1 ml-3 gap-y-1">
            <Text
              className="text-sm text-zinc-500 font-normal"
              numberOfLines={1}
            >
              {formatDate(purchaseAt)}
            </Text>
            <View className="flex-row gap-2">
              <CustomText
                className="text-base  "
                weight="semibold"
                style={{ color: cNameColor }}
                numberOfLines={1}
              >
                {cName}
              </CustomText>
              <CustomText
                className="text-base  "
                weight="semibold"
                style={{ color: cNameColor }}
                numberOfLines={1}
              >
                {cLastName}
              </CustomText>
            </View>
            {/* Render all products */}
            <View className="flex-col ">
              {Array.isArray(product) && product.length > 0 ? (
                product.map((item: any, idx: number) => (
                  <View key={idx} className="flex-row gap-x-2 items-center">
                    <CustomText
                      className="font-bold text-sm text-zinc-400 pt-1"
                      weight="regular"
                      numberOfLines={1}
                      style={{ color: "#7e7d7a" }}
                    >
                      {item.product}
                    </CustomText>

                    {item.unit !== "NotSpecified" ? (
                      <>
                        <CustomText
                          className="font-bold text-sm text-zinc-400 pt-1"
                          weight="regular"
                          numberOfLines={1}
                          style={{ color: "#7e7d7a" }}
                        >
                          {item.quantity}
                        </CustomText>
                        <CustomText
                          className="font-bold text-sm text-zinc-400 pt-1"
                          weight="regular"
                          numberOfLines={1}
                          style={{ color: "#7e7d7a" }}
                        >
                          {t(`product.unit.${item.unit}`) }
                        </CustomText>
                      </>
                    ) : null}
                  </View>
                ))
              ) : (
                <CustomText
                  className="font-bold text-sm text-zinc-400"
                  style={{ color: "#7e7d7a" }}
                >
                  -
                </CustomText>
              )}
            </View>
          </View>
          <View className="pt-2 flex flex-col items-end">
            <Text
              className="text-xl font-bold justify-end"
              style={{ color: PriceColor }}
              numberOfLines={1}
            >
              + {total.toLocaleString()}
            </Text>
            
            {/* DocumentType Status Box */}
            {currentDocumentType && (
              <View className="mt-2">
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: getStatusColor(currentDocumentType),
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ 
                      color: iconColor,
                      fontSize: 10,
                      textAlign: 'center'
                    }}
                    numberOfLines={1}
                  >
                    {getStatusText(currentDocumentType)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  // Wrap in Swipeable if update function is provided and DocumentType is not "Receipt"
  if (onUpdateDocumentType && currentDocumentType !== "Receipt") {
    return (
      <Swipeable renderLeftActions={renderLeftActions}>
        {cardContent}
      </Swipeable>
    );
  }

  // Return plain card if no swipe functionality needed or if DocumentType is "Receipt"
  return cardContent;
}
