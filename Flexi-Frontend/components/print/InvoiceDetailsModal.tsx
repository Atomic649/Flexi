import React from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "@/components/CustomText";
import { isMobile, getResponsiveStyles } from "@/utils/responsive";
import { vatRate } from "@/components/TaxVariable";

type PrintStep = "QA" | "IV" | "RE";

interface InvoiceDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedInvoice: any;
  printRef: React.RefObject<any>;
  theme: string;
  t: (key: string) => string;
  isVatRegistered: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getDocumentTitle: (invoice: any) => string;
  getDisplayId: (invoice: any) => string;
  selectedPrintType: PrintStep;
  getAvailablePrintSteps: () => PrintStep[];
  isPrintStepCompleted: (step: PrintStep) => boolean;
  getPrintStepBackgroundColor: (step: PrintStep) => string;
  getPrintStepBorderColor: (step: PrintStep) => string;
  getPrintStepOpacity: (step: PrintStep) => number;
  getPrintStepIconColor: (step: PrintStep) => string;
  getPrintStepDescriptionColor: (step: PrintStep) => string;
  handlePrintQuotation: () => void;
  handlePrintInvoice: () => void;
  handlePrintReceipt: () => void;
}

export default function InvoiceDetailsModal({
  visible,
  onClose,
  selectedInvoice,
  printRef,
  theme,
  t,
  isVatRegistered,
  formatCurrency,
  formatDate,
  getDocumentTitle,
  getDisplayId,
  selectedPrintType,
  getAvailablePrintSteps,
  isPrintStepCompleted,
  getPrintStepBackgroundColor,
  getPrintStepBorderColor,
  getPrintStepOpacity,
  getPrintStepIconColor,
  getPrintStepDescriptionColor,
  handlePrintQuotation,
  handlePrintInvoice,
  handlePrintReceipt,
}: InvoiceDetailsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            width: isMobile() ? "95%" : "60%",
            maxWidth: 700,
            backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
            borderRadius: 10,
            padding: 20,
          }}
        >
          {selectedInvoice && (
            <View ref={printRef} className="p-4">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-col pt-1">
                  <CustomText weight="bold" className="text-xl pt-1">
                    {getDocumentTitle(selectedInvoice)}
                  </CustomText>
                  <View className="flex-row">
                    <CustomText weight="regular" className="text-xl">
                      #
                    </CustomText>
                    <CustomText weight="regular" className="text-base">
                      {getDisplayId(selectedInvoice)}
                    </CustomText>
                  </View>
                  {selectedInvoice.isSplitChild && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        borderWidth: 1,
                        borderColor: theme === "dark" ? "#555" : "#d1d5db",
                        borderRadius: 4,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        marginTop: 4,
                        gap: 3,
                      }}
                    >
                      <Ionicons
                        name="sync-outline"
                        size={10}
                        color={theme === "dark" ? "#9ca3af" : "#6b7280"}
                      />
                      <CustomText style={{ fontSize: 10, color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                        {selectedInvoice.parentQuotationId ?? selectedInvoice.invoiceId}
                      </CustomText>
                      <CustomText style={{ fontSize: 10, color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                        {selectedInvoice.splitPercent}%
                      </CustomText>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme === "dark" ? "#ffffff" : "#000000"}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between mb-6">
                <View style={{ maxWidth: "50%" }}>
                  <CustomText weight="bold" className="mb-1">
                    {t("print.billedTo")}
                  </CustomText>
                  <View className="flex-row gap-1">
                    <CustomText
                      style={{
                        fontSize: getResponsiveStyles().smallFontSize,
                      }}
                    >
                      {selectedInvoice.cName}
                    </CustomText>
                    <CustomText
                      style={{
                        fontSize: getResponsiveStyles().smallFontSize,
                      }}
                    >
                      {selectedInvoice.cLastName}
                    </CustomText>
                  </View>
                  <CustomText
                    style={{ fontSize: getResponsiveStyles().smallFontSize }}
                  >
                    {selectedInvoice.cPhone}
                  </CustomText>
                  <CustomText
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{
                      flexWrap: "wrap",
                      fontSize: getResponsiveStyles().smallFontSize,
                    }}
                  >
                    {selectedInvoice.cAddress}
                  </CustomText>
                  <View className="flex-row gap-1">
                    <CustomText
                      style={{
                        fontSize: getResponsiveStyles().smallFontSize,
                      }}
                    >
                      {selectedInvoice.cProvince}
                    </CustomText>
                    <CustomText
                      style={{
                        fontSize: getResponsiveStyles().smallFontSize,
                      }}
                    >
                      {selectedInvoice.cPostId}
                    </CustomText>
                  </View>
                </View>
                <View className="items-end">
                  <CustomText weight="bold" className="mb-1">
                    {t("print.invoiceDate")}
                  </CustomText>
                  <CustomText>
                    {formatDate(selectedInvoice.purchaseAt)}
                  </CustomText>

                  <CustomText weight="bold" className="mb-1 mt-2">
                    {t("print.paymentMethod")}
                  </CustomText>
                  <CustomText>
                    {selectedInvoice.payment
                      ? t(`bill.payment.${selectedInvoice.payment}`)
                      : t("common.unknown")}
                  </CustomText>

                  <CustomText weight="bold" className="mb-1 mt-2">
                    {t("print.status")}
                  </CustomText>
                  <View
                    className={`p-1 px-2 rounded-full ${
                      selectedInvoice.cashStatus
                        ? "bg-green-700"
                        : "bg-orange-700"
                    }`}
                  >
                    <CustomText style={{ color: "white", fontSize: 12 }}>
                      {selectedInvoice.cashStatus
                        ? t("bill.status.paid")
                        : t("bill.status.unpaid")}
                    </CustomText>
                  </View>
                </View>
              </View>

              <View className="">
                <View className="flex-row justify-between items-center mb-1 border-b border-zinc-300">
                  <CustomText weight="bold" style={{ width: "38%" }}>
                    {t("print.productName")}
                  </CustomText>
                  <CustomText
                    weight="bold"
                    style={{ width: "22%", textAlign: "center" }}
                  >
                    {t("print.quantity")}
                  </CustomText>
                  <CustomText
                    weight="bold"
                    style={{ width: "20%", textAlign: "right" }}
                  >
                    {t("print.price")}
                  </CustomText>
                  <CustomText
                    weight="bold"
                    style={{ width: "20%", textAlign: "right" }}
                  >
                    {t("print.total")}
                  </CustomText>
                </View>

                {/* Product item rows for multi-product */}
                {Array.isArray(selectedInvoice.product) &&
                  selectedInvoice.product.map((item: any, idx: number) => (
                    <View
                      key={idx}
                      className="flex-row justify-between items-center py-2"
                    >
                      <CustomText style={{ width: "38%" }}>
                        {item.productList?.name ?? item.product}
                      </CustomText>
                      <CustomText
                        style={{ width: "22%", textAlign: "center" }}
                      >
                        {item.quantity}
                        {/* {item.unit ? t(`product.unit.${item.unit}`) || item.unit : t("common.pcs")} */}
                      </CustomText>

                      <CustomText
                        style={{ width: "20%", textAlign: "right" }}
                      >
                        {isVatRegistered
                          ? (
                              item.unitPrice /
                              ((100 + vatRate) / 100)
                            ).toFixed(1)
                          : item.unitPrice}
                      </CustomText>

                      {/* total unitPrice *quatity */}
                      <CustomText
                        style={{ width: "20%", textAlign: "right" }}
                      >
                        {isVatRegistered
                          ? (
                              (item.unitPrice / ((100 + vatRate) / 100)) *
                              item.quantity
                            ).toFixed(1)
                          : (item.unitPrice * item.quantityz).toFixed(1)}
                      </CustomText>
                    </View>
                  ))}
              </View>

              <View className="flex-row justify-end mt-2">
                <View className="w-2/3">
                  {/* Show discount if any discounts exist */}
                  {(selectedInvoice.discount > 0 ||
                    selectedInvoice.billLevelDiscount > 0) && (
                    <View className="flex-row justify-between mb-2">
                      <CustomText weight="bold">
                        {t("print.totalDiscount")}
                      </CustomText>
                      <CustomText>
                        {formatCurrency(
                          (selectedInvoice.discount || 0) +
                            (selectedInvoice.billLevelDiscount || 0),
                        )}
                      </CustomText>
                    </View>
                  )}
                  {isVatRegistered && (
                    <View className="flex-row justify-between mb-2">
                      <CustomText weight="bold">
                        {t("print.subtotal")}
                      </CustomText>
                      <CustomText>{formatCurrency(selectedInvoice.totalBeforeTax)}</CustomText>
                    </View>
                  )}
                  {isVatRegistered && (
                    <View className="flex-row justify-between mb-2">
                      <View className="flex-row">
                        <CustomText weight="bold">
                          {t("print.tax")}
                        </CustomText>
                        <CustomText weight="bold">{` (${vatRate}%)`}</CustomText>
                      </View>

                      <CustomText>{formatCurrency(selectedInvoice.totalTax)}</CustomText>
                    </View>
                  )}

                  {selectedInvoice.WHTAmount > 0 && (
                    <View className="flex-row justify-between mb-2">
                      <View className="flex-row">
                        <CustomText weight="bold">
                          {t("print.WHT")}
                        </CustomText>
                      </View>
                      <CustomText>{formatCurrency(selectedInvoice.WHTAmount)}</CustomText>
                    </View>
                  )}
                  <View className="flex-row justify-between mb-2">
                    <CustomText weight="bold">
                      {t("print.grandTotal")}
                    </CustomText>
                    <CustomText weight="bold">
                      {formatCurrency(selectedInvoice.totalQuotation)}
                    </CustomText>
                  </View>

                  {selectedInvoice.isSplitChild && selectedInvoice.splitPercent != null && (
                    <>
                      <View
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: theme === "dark" ? "#444" : "#d1d5db",
                          marginBottom: 8,
                        }}
                      />
                      <View className="flex-row justify-between mb-2">
                        <CustomText style={{ fontStyle: "italic", color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                          {`${t("print.splitPayment")} (${selectedInvoice.splitPercent}%)`}
                        </CustomText>
                        <CustomText style={{ fontStyle: "italic", color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                          {formatCurrency(selectedInvoice.totalQuotation * (selectedInvoice.splitPercent / 100))}
                        </CustomText>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Print Options Progression UI */}
          <View
            style={{
              backgroundColor: "transparent",
              borderRadius: 15,
              padding: 5,
              marginVertical: 2,
              borderWidth: 0,
              borderColor: "transparent",
            }}
          >
            {/* Progress Line Container */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                paddingVertical: 8,
              }}
            >
              {getAvailablePrintSteps().map((step, index) => {
                const stepConfig = {
                  QA: {
                    icon: "document-text-outline",
                    label: t("print.printQuotation"),
                    type: "Quotation",
                    onPress: () => {
                      handlePrintQuotation();
                    },
                  },
                  IV: {
                    icon: "receipt-outline",
                    label: t("print.printInvoice"),
                    type: "Invoice",
                    onPress: () => {
                      handlePrintInvoice();
                    },
                  },
                  RE: {
                    icon: "checkmark-circle-outline",
                    label: isVatRegistered
                      ? t("print.printTaxInvoice")
                      : t("print.printReceipt"),
                    type: "Receipt",
                    onPress: () => {
                      handlePrintReceipt();
                    },
                  },
                };

                const availableSteps = getAvailablePrintSteps();
                const isLastStep = index === availableSteps.length - 1;
                const isStepActive = isPrintStepCompleted(step);

                return (
                  <React.Fragment key={step}>
                    {/* Step Circle */}
                    <TouchableOpacity
                      style={{
                        alignItems: "center",
                        backgroundColor: "transparent",
                      }}
                      onPress={
                        isStepActive ? stepConfig[step].onPress : undefined
                      }
                      activeOpacity={isStepActive ? 0.7 : 1}
                      disabled={!isStepActive}
                    >
                      <View
                        style={{
                          width: 45,
                          height: 45,
                          borderRadius: 22.5,
                          backgroundColor: getPrintStepBackgroundColor(step),
                          borderWidth: 3,
                          borderColor: getPrintStepBorderColor(step),
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: getPrintStepOpacity(step),
                          shadowColor: isPrintStepCompleted(step)
                            ? "#04ecc1"
                            : "transparent",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: isPrintStepCompleted(step) ? 0.6 : 0,
                          shadowRadius: isPrintStepCompleted(step) ? 8 : 0,
                          elevation: isPrintStepCompleted(step) ? 8 : 0,
                        }}
                      >
                        <Ionicons
                          name={stepConfig[step].icon as any}
                          size={20}
                          color={getPrintStepIconColor(step)}
                        />
                      </View>
                      <CustomText
                        style={{
                          fontSize: 9,
                          color: getPrintStepDescriptionColor(step),
                          textAlign: "center",
                          marginTop: 4,
                          fontWeight: "500",
                        }}
                      >
                        {stepConfig[step].label}
                      </CustomText>
                    </TouchableOpacity>

                    {/* Connection Line - Only show if not last step */}
                    {!isLastStep && (
                      <View
                        style={{
                          width: 30,
                          height: 3,
                          marginHorizontal: 6,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingHorizontal: 2,
                        }}
                      >
                        {[...Array(3)].map((_, dotIndex) => (
                          <View
                            key={dotIndex}
                            style={{
                              width: 3,
                              height: 3,
                              borderRadius: 1.5,
                              backgroundColor:
                                index <
                                availableSteps.findIndex(
                                  (s) => s === selectedPrintType,
                                )
                                  ? "#04ecc1"
                                  : theme === "dark"
                                    ? "#444"
                                    : "#ddd",
                            }}
                          />
                        ))}
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
