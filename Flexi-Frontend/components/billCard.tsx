import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Animated as RNAnimated,
} from "react-native";
import React, { useRef, useState, useCallback } from "react";
import { CustomText } from "./CustomText";
import { useTranslation } from "react-i18next";
import SwipeableRow, { SwipeAction } from "./swipe/SwipeableRow";
import CustomAlert from "./CustomAlert";
import { format } from "date-fns";

const formatDate = (dateString: string) => {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return format(parsedDate, "dd/MM/yyyy HH:mm");
};

export default function BillCard({
  id,
  cName,
  cLastName,
  product = [], // Expecting array of { product, quantity, unitPrice }
  total,
  totalQuotation,
  purchaseAt,
  CardColor,
  PriceColor,
  cNameColor,
  iconColor,
  getBorderColor,
  onUpdateDocumentType, // New prop for updating document type
  currentDocumentType, // Current document type to show appropriate actions
  onPress, // Add onPress prop to handle navigation from parent
  onDuplicate,
}: any) {
  const { t } = useTranslation();

  // Optimistic override for immediate UI feedback; falls back to prop
  const [overrideDocumentType, setOverrideDocumentType] = useState<string | null>(null);

  // Animation values for status change
  const statusScaleAnim = useRef(new RNAnimated.Value(1)).current;
  const statusOpacityAnim = useRef(new RNAnimated.Value(1)).current;
  const longPressTriggeredRef = useRef(false);
  const [duplicateAlertVisible, setDuplicateAlertVisible] = useState(false);

  const handleCancelDuplicate = useCallback(() => {
    longPressTriggeredRef.current = false;
    setDuplicateAlertVisible(false);
  }, []);

  const handleConfirmDuplicate = useCallback(() => {
    setDuplicateAlertVisible(false);
    if (onDuplicate) {
      onDuplicate(id);
    }
  }, [id, onDuplicate]);

  const handleDuplicatePrompt = useCallback(() => {
    if (!onDuplicate) {
      return;
    }
    longPressTriggeredRef.current = true;
    setDuplicateAlertVisible(true);
  }, [onDuplicate]);

  // Effective document type used for rendering and actions
  const effectiveDocumentType =
    overrideDocumentType !== null && overrideDocumentType !== currentDocumentType
      ? overrideDocumentType
      : currentDocumentType;

  // Animate status change directly in event handlers (not via effect)
  const triggerStatusAnimation = useCallback(() => {
    RNAnimated.sequence([
      RNAnimated.parallel([
        RNAnimated.timing(statusScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.timing(statusOpacityAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      RNAnimated.parallel([
        RNAnimated.spring(statusScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        RNAnimated.timing(statusOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [statusScaleAnim, statusOpacityAnim]);

  // Note: No effect on prop change; compute effective value during render

  const handleCustomerConfirm = () => {
    if (onUpdateDocumentType) {
      // Optimistic update for instant UI feedback
      setOverrideDocumentType("Invoice");
      triggerStatusAnimation();

      // Call the API update function
      onUpdateDocumentType(id, "Invoice");
    }
  };

  const handleCustomerPaid = () => {
    if (onUpdateDocumentType) {
      // Optimistic update for instant UI feedback
      setOverrideDocumentType("Receipt");
      triggerStatusAnimation();

      // Call the API update function
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

  // Define swipe actions for the bill card
  const leftActions: SwipeAction[] = [];

  // Add actions based on document type
  if (onUpdateDocumentType && currentDocumentType !== "Receipt") {
    // Customer Confirm Button (only if not already Invoice)
    if (effectiveDocumentType !== "Invoice") {
      leftActions.push({
        id: "confirm",
        icon: "checkmark-circle",
        text: t("bill.confirm") || "Confirm",
        backgroundColor: "#ff8c00",
        textColor: iconColor,
        onPress: handleCustomerConfirm,
      });
    }

    // Customer Paid Button
    leftActions.push({
      id: "paid",
      icon: "cash",
      text: t("bill.paid") || "Paid",
      backgroundColor: PriceColor,
      textColor: iconColor,
      onPress: handleCustomerPaid,
    });
  }

  const cardContent = (
    <TouchableOpacity
      className="flex"
      style={{
        width: "100%",
      }}
      onPress={() => {
        if (longPressTriggeredRef.current) {
          longPressTriggeredRef.current = false;
          return;
        }
        if (onPress) {
          onPress();
        }
      }}
      onLongPress={handleDuplicatePrompt}
      delayLongPress={450}
      activeOpacity={1}
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
                          {t(`product.unit.${item.unit}`)}
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
              style={{
                color:
                  effectiveDocumentType === "Receipt"
                    ? PriceColor
                    : getStatusColor(effectiveDocumentType),
                opacity: effectiveDocumentType === "Receipt" ? 1 : 0.5,
              }}
              numberOfLines={1}
            >
              {effectiveDocumentType === "Receipt"
                ? `+${(total || 0).toLocaleString()}`
                : (totalQuotation || 0).toLocaleString()}
            </Text>

            {/* DocumentType Status Box */}
            {effectiveDocumentType && (
              <RNAnimated.View
                className="mt-2"
                style={{
                  transform: [{ scale: statusScaleAnim }],
                  opacity: statusOpacityAnim,
                }}
              >
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: getStatusColor(effectiveDocumentType),
                  }}
                >
                  <CustomText
                    className="text-xs font-semibold pt-1"
                    style={{
                      color: iconColor,
                      fontSize: 10,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {getStatusText(effectiveDocumentType)}
                  </CustomText>
                </View>
              </RNAnimated.View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
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
        disabled={!onUpdateDocumentType || currentDocumentType === "Receipt"}
        threshold={80}
        actionWidth={80}
        actionHeight="92%"
        actionBorderRadius={0}
      >
        {cardContent}
      </SwipeableRow>
      {onDuplicate && (
        <CustomAlert
          visible={duplicateAlertVisible}
          title={t("bill.duplicateConfirmTitle", {
            defaultValue: "Duplicate bill?",
          })}
          message={t("bill.duplicateConfirmMessage", {
            defaultValue:
              "Create a new bill using this customer's details?",
          })}
          buttons={[
            {
              text: t("common.cancel"),
              onPress: handleCancelDuplicate,
              style: "cancel",
            },
            {
              text: t("common.confirm"),
              onPress: handleConfirmDuplicate,
            },
          ]}
          onClose={handleCancelDuplicate}
        />
      )}
    </View>
  );
}
