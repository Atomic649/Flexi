import {
  Dimensions,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { View } from "@/components/Themed";
import { CustomButton } from "@/components/CustomButton";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import DateTimePicker from "@/components/DateTimePicker";
import CallAPIProduct from "@/api/product_api";
import CallAPIBill from "@/api/bill_api";
import CallAPIBusiness from "@/api/business_api";

import CallAPIPlatform from "@/api/platform_api";
import DropdownClear from "@/components/dropdown/DropdownClear";
import CallAPIExpense from "@/api/expense_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useDocumentSettings } from "@/providers/DocumentSettingsProvider";
import { CustomTextInput } from "@/components/CustomTextInput";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getBusinessId, getMemberId } from "@/utils/utility";
import {
  isDesktop,
  isMobile,
  isMobileApp,
  isTabletWeb,
} from "@/utils/responsive";
import FormFieldClear from "@/components/formfield/FormFieldClear";
import { useBusiness } from "@/providers/BusinessProvider";
import { generateInvoiceHTML } from "@/components/PDFTemplates/InvoiceTemplate";
import { generateQuotationHTML } from "@/components/PDFTemplates/QuotationTemplate";
import { generateInvoiceHTML as generateReceiptHTML } from "@/components/PDFTemplates/ReceiptTemplate";
import * as ExpoPrint from "expo-print";
import * as Clipboard from "expo-clipboard";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";
import { DEFAULT_VAT_PERCENT } from "@/utils/taxUtils";
import { THAI_PROVINCES_KEYS } from "@/constants/ThaiProvinces";
import { COMMON_COUNTRY_KEYS } from "@/constants/CommonCountries";
import { detectIsExport } from "@/constants/detectIsExport";

// Format date in DD/MM/YYYY HH:MM (24-hour) format
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return format(parsedDate, "dd/MM/yyyy HH:mm");
};

// Format currency for PDF
const formatCurrencyForPDF = (amount: number) => {
  return (
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " THB"
  );
};

export default function EditBill() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { settings: docSettings } = useDocumentSettings();
  const { id } = useLocalSearchParams();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [platformOptions, setPlatformOptions] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [error, setError] = useState("");
  const [purchaseAt, setPurchaseAt] = useState(new Date());
  const [quotationAt, setQuotationAt] = useState(new Date());
  const [invoiceAt, setInvoiceAt] = useState(new Date());
  const [receiptAt, setReceiptAt] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingBill, setIsUpdatingBill] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Customer information
  const [cName, setCName] = useState("");
  const [cLastName, setCLastName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cGender, setCGender] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cPostId, setCPostId] = useState("");
  const [cProvince, setCProvince] = useState("");
  const [cCountry, setCCountry] = useState("Thailand");
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [isExport, setIsExport] = useState(false);
  const isExportManualOverride = useRef(false);
  const [cTaxId, setCTaxId] = useState("");
  const [branch, setBranch] = useState("");
  const [priceValid, setPriceValid] = useState<Date | null>(null);
  const [priceValidDays, setPriceValidDays] = useState<7 | 15 | 30 | 45 | null>(
    null,
  );
  const [validContactUntil, setValidContactUntil] = useState("");

  // Note state
  const [note, setNote] = useState("");
  const [paymentTermCondition, setPaymentTermCondition] = useState("");
  const [remark, setRemark] = useState("");

  // Project state
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectSuggestions, setProjectSuggestions] = useState<{ id: number; name: string; description?: string }[]>([]);

  // Payment information
  const [payment, setPayment] = useState("");
  const [cashStatus, setCashStatus] = useState(false);
  const [businessAcc, setBusinessAcc] = useState(0);
  const [image, setImage] = useState("");

  // --- Product Items State ---
  const [productItems, setProductItems] = useState([
    { product: "", price: "", quantity: "1", unit: "", unitDiscount: "", description: "" },
  ]);
  const { vat, fetchBusinessData } = useBusiness();
  const [billLevelDiscountValue, setBillLevelDiscountValue] = useState("");
  const [billLevelDiscountIsPercent, setBillLevelDiscountIsPercent] = useState(false);
  const [withholdingTax, setWithholdingTax] = useState(false);
  const [withholdingPercent, setWithholdingPercent] = useState("");

  // Computed bill-level discount amount (handles both % and fixed modes)
  const billLevelDiscountAmount = useMemo(() => {
    const val = Number(billLevelDiscountValue) || 0;
    if (!billLevelDiscountIsPercent) return val;
    const subtotal = productItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
      0,
    );
    const unitDisc = productItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitDiscount) || 0),
      0,
    );
    return Number(((subtotal - unitDisc) * (val / 100)).toFixed(2));
  }, [billLevelDiscountValue, billLevelDiscountIsPercent, productItems]);

  const withholdingTaxAmount = useMemo(() => {
    if (!withholdingTax) return 0;
    const subtotal = productItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + qty * price;
    }, 0);

    const subTotalWitoutVat =
      subtotal / (1 + (vat ? DEFAULT_VAT_PERCENT : 0) / 100);

    const unitDisc = productItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const unitDisc = Number(item.unitDiscount) || 0;
      return sum + qty * unitDisc;
    }, 0);
    let taxableBase = subtotal - unitDisc - billLevelDiscountAmount;
    if (vat) {
      taxableBase = subTotalWitoutVat - unitDisc - billLevelDiscountAmount;
    }

    const pct = Number(withholdingPercent) || 0;
    const raw = taxableBase * (pct / 100);
    // keep two decimal places
    const amt = Number(raw.toFixed(2));
    return amt;
  }, [withholdingTax, withholdingPercent, productItems, billLevelDiscountAmount]);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [allDatesVisible, setAllDatesVisible] = useState(false);
  const [editingDateField, setEditingDateField] = useState<"QA" | "PU" | "IV" | "RE" | "PV" | null>(null);
  const [date, setDate] = useState<string[]>([new Date().toISOString()]);
  const [selectedDates, setSelectedDates] = useState<string[]>([
    new Date().toISOString(),
  ]);

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

  const fieldStyles = "mt-2 mb-2";

  // Save payment terms as business default
  const handleSavePaymentTerms = async () => {
    try {
      if (memberId) {
        await CallAPIBusiness.UpdateBusinessDefaultsAPI(memberId, { paymentTerm: paymentTermCondition });
        fetchBusinessData();
        setAlertConfig({
          visible: true,
          title: t("bill.alerts.success"),
          message: t("bill.paymentTermSaved"),
          buttons: [{ text: t("common.ok"), onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) }],
        });
      }
    } catch {
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: t("bill.paymentTermSaveError"),
        buttons: [{ text: t("common.ok"), onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) }],
      });
    }
  };

  // Save remark as business default
  const handleSaveRemark = async () => {
    try {
      if (memberId) {
        await CallAPIBusiness.UpdateBusinessDefaultsAPI(memberId, { remark });
        fetchBusinessData();
        setAlertConfig({
          visible: true,
          title: t("bill.alerts.success"),
          message: t("bill.remarkSaved"),
          buttons: [{ text: t("common.ok"), onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) }],
        });
      }
    } catch {
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: t("bill.remarkSaveError"),
        buttons: [{ text: t("common.ok"), onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) }],
      });
    }
  };

  // Focus state for multiline fields
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isPaymentTermFocused, setIsPaymentTermFocused] = useState(false);
  const [isRemarkFocused, setIsRemarkFocused] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);

  // Tax type state
  const [taxType, setTaxType] = useState<"Individual" | "Juristic">(
    "Individual",
  );

  // Document type progression state
  const [selectedDocumentType, setSelectedDocumentType] = useState<
    "QA" | "IV" | "RE"
  >("QA");
  // Tracks the last-saved DocumentType from DB — used to reset when canceling edit
  const savedDocumentTypeRef = useRef<"QA" | "IV" | "RE">("QA");
  const [showProgressSection, setShowProgressSection] = useState(true);
  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<
    string[]
  >([]);
  const [isDocumentTypeLocked, setIsDocumentTypeLocked] = useState(false);

  // FlexiId for sharing
  const [flexiId, setFlexiId] = useState<string | null>(null);
  const [flexiIdCopied, setFlexiIdCopied] = useState(false);

  // Split bill state
  const [isSplitChild, setIsSplitChild] = useState(false);
  const [isSplitParent, setIsSplitParent] = useState(false);
  const [mySplitPercent, setMySplitPercent] = useState<number | null>(null);
  const [mySplitIndex, setMySplitIndex] = useState<number | null>(null);
  const [showSplitSection, setShowSplitSection] = useState(false);
  // splitRows = user-editable rows; last row is always auto = remainder
  // Each row has its own mode: "percent" or "amount"
  const [splitRows, setSplitRows] = useState<{ value: string; mode: "percent" | "amount" }[]>([]);
  const [splitSubmitting, setSplitSubmitting] = useState(false);
  // Base total used to calculate each split row's amount (after WHT, used for backend logic)
  const [splitBaseTotal, setSplitBaseTotal] = useState(0);
  // Display total = pre-WHT total, used only for hint labels in the UI
  const splitDisplayTotal = splitBaseTotal + withholdingTaxAmount;

  // All display amounts are in pre-WHT terms (splitDisplayTotal as base).
  // Percent rows: pre-WHT amount = pct * splitDisplayTotal / 100
  // Amount rows: value is already in pre-WHT terms
  const rowToDisplayAmount = (value: string, mode: "percent" | "amount") =>
    mode === "percent"
      ? splitDisplayTotal > 0 ? (parseFloat(value) || 0) * splitDisplayTotal / 100 : 0
      : (parseFloat(value) || 0);

  const splitUserAmountTotal = splitRows.reduce((s, r) => s + rowToDisplayAmount(r.value, r.mode), 0);
  const splitRemainderAmount = Math.max(0, splitDisplayTotal - splitUserAmountTotal);
  // All rows for display: user rows + auto remainder row (always shown as amount)
  const splitAllRows: { value: string; mode: "percent" | "amount"; auto?: boolean }[] = [
    ...splitRows,
    { value: String(splitRemainderAmount.toFixed(2)), mode: "amount" as const, auto: true },
  ];
  const splitIsValid =
    splitRows.length > 0 &&
    splitRows.every((r) => parseFloat(r.value) > 0) &&
    splitDisplayTotal > 0 &&
    splitUserAmountTotal < splitDisplayTotal;

  const handleSplitSubmit = async () => {
    if (!splitIsValid || !id) return;
    setSplitSubmitting(true);
    try {
      // Convert each row to percent before sending to API.
      // Amount rows are in pre-WHT terms, so divide by splitDisplayTotal (not splitBaseTotal).
      const toPercent = (value: string, mode: "percent" | "amount") =>
        mode === "percent"
          ? parseFloat(value) || 0
          : splitDisplayTotal > 0 ? ((parseFloat(value) || 0) / splitDisplayTotal) * 100 : 0;
      const percents = splitAllRows.map((r) => toPercent(r.value, r.mode));
      const allRows = percents.map((pct, i) => ({
        splitPercent: pct,
        splitPercentMax: 100 - percents.slice(0, i).reduce((s, p) => s + p, 0),
      }));
      await CallAPIBill.createSplitChildrenAPI(Number(id), allRows);
      setIsSplitParent(true);
      setShowSplitSection(false);
    } catch (e: any) {
      setAlertConfig({
        visible: true,
        title: t("common.error") || "Error",
        message: e?.message || "Failed to create split",
        buttons: [{ text: t("common.ok"), onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) }],
      });
    } finally {
      setSplitSubmitting(false);
    }
  };

  const handleResetSplit = () => {
    setAlertConfig({
      visible: true,
      title: t("bill.resetSplit") || "Reset Split?",
      message: t("bill.resetSplitConfirm") || "This will delete all installments and reset this bill to Quotation.",
      buttons: [
        { text: t("common.cancel"), style: "cancel", onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) },
        {
          text: t("common.confirm"),
          onPress: async () => {
            setAlertConfig((p) => ({ ...p, visible: false }));
            try {
              await CallAPIBill.resetParentSplitAPI(Number(id));
              const refreshed = await CallAPIBill.getBillByIdAPI(Number(id));
              const refreshedDocType = getDocumentTypeFromAPI(refreshed.DocumentType);
              setSelectedDocumentType(refreshedDocType);
              savedDocumentTypeRef.current = refreshedDocType;
              setIsSplitParent(false);
              setSplitRows([{ value: "", mode: "percent" }]);
            } catch (e: any) {
              setAlertConfig({
                visible: true,
                title: t("common.error") || "Error",
                message: e?.message || "Failed to reset",
                buttons: [{ text: t("common.ok"), onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) }],
              });
            }
          },
        },
      ],
    });
  };

  // Business details for PDF generation
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [businessName, setBusinessName] = useState<string>("");

  // Get Business context values
  const {
    DocumentType: contextDocumentTypes,
    businessType: contextBusinessType,
  } = useBusiness();

  const businessType = contextBusinessType ?? null;

  // Ref for scroll view
  const scrollViewRef = useRef<ScrollView>(null);

  // Helper functions for DocumentType progression UI
  const getStepOrder = (step: "QA" | "IV" | "RE"): number => {
    const order = { QA: 1, IV: 2, RE: 3 };
    return order[step];
  };

  const isStepCompleted = (step: "QA" | "IV" | "RE"): boolean => {
    return getStepOrder(selectedDocumentType) >= getStepOrder(step);
  };

  const getStepOpacity = (step: "QA" | "IV" | "RE"): number => {
    if (isStepCompleted(step)) return 1;
    return 0.4;
  };

  const getStepIconColor = (step: "QA" | "IV" | "RE"): string => {
    if (isStepCompleted(step)) return "#ffffff";
    return theme === "dark" ? "#666" : "#999";
  };

  const getStepDescriptionColor = (step: "QA" | "IV" | "RE"): string => {
    if (isStepCompleted(step)) return theme === "dark" ? "#c9c9c9" : "#666";
    return theme === "dark" ? "#555" : "#bbb";
  };

  // Helper function to convert document type for API
  const getDocumentTypeForAPI = (
    type: "QA" | "IV" | "RE",
  ): "Quotation" | "Invoice" | "Receipt" => {
    const mapping = {
      QA: "Quotation" as const,
      IV: "Invoice" as const,
      RE: "Receipt" as const,
    };
    return mapping[type];
  };

  // Helper function to convert API document type to internal format
  const getDocumentTypeFromAPI = (
    type: "Quotation" | "Invoice" | "Receipt" | "Bill",
  ): "QA" | "IV" | "RE" => {
    const mapping = {
      Quotation: "QA" as const,
      Invoice: "IV" as const,
      Receipt: "RE" as const,
      Bill: "QA" as const, // Default to Quotation for Bill type
    };
    return mapping[type];
  };

  // Helper functions to check document type availability
  const isDocumentTypeAvailable = (type: string): boolean => {
    return availableDocumentTypes.includes(type);
  };

  const getAvailableSteps = (): ("QA" | "IV" | "RE")[] => {
    const steps: ("QA" | "IV" | "RE")[] = [];
    if (!isSplitChild && isDocumentTypeAvailable("Quotation")) steps.push("QA");
    if (!isSplitParent && isDocumentTypeAvailable("Invoice")) steps.push("IV");
    if (!isSplitParent && isDocumentTypeAvailable("Receipt")) steps.push("RE");
    return steps;
  };

  // Document viewing functions
  const viewQuotationDocument = async () => {
    if (!businessDetails || !id) {
      console.log("Missing businessDetails or id:", {
        businessDetails: !!businessDetails,
        id,
      });
      return;
    }

    if (Platform.OS === "web") {
      // Use HTML content for web/desktop viewing
      printQuotationHTMLContent();
    } else {
      // For mobile, directly save as PDF
      saveQuotationToPDF();
    }
  };

  const viewInvoiceDocument = async () => {
    if (!businessDetails || !id) {
      console.log("Missing businessDetails or id:", {
        businessDetails: !!businessDetails,
        id,
      });
      return;
    }

    if (Platform.OS === "web") {
      // Use HTML content for web/desktop viewing
      printInvoiceHTMLContent();
    } else {
      // For mobile, directly save as PDF
      saveInvoiceToPDF();
    }
  };

  const viewReceiptDocument = async () => {
    if (!businessDetails || !id) {
      console.log("Missing businessDetails or id:", {
        businessDetails: !!businessDetails,
        id,
      });
      return;
    }

    if (Platform.OS === "web") {
      // Use HTML content for web/desktop viewing
      printReceiptHTMLContent();
    } else {
      // For mobile, directly save as PDF
      saveReceiptToPDF();
    }
  };

  // Web viewing functions
  const printQuotationHTMLContent = async () => {
    try {
      console.log("🚀 Starting printQuotationHTMLContent...");
      // Get current bill data
      const billData = await CallAPIBill.getBillByIdAPI(Number(id));
      console.log("📄 Bill data received:", billData?.billId || billData?.id);

      // Generate HTML content for quotation
      const htmlContent = generateQuotationHTML({
        quotation: billData,
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      console.log("📝 HTML content generated, length:", htmlContent.length);

      // Create a new window for viewing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        console.log("✅ Window opened successfully");
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        console.log("⚠️ Window blocked, using blob download");
        // Fallback: create a blob and download
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `quotation_${billData.billId || billData.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("📥 File download initiated");
      }
    } catch (error) {
      console.error("❌ Error viewing quotation:", error);
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: `Failed to view quotation: ${
          error instanceof Error ? error.message : String(error)
        }`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  const printInvoiceHTMLContent = async () => {
    try {
      console.log("🚀 Starting printInvoiceHTMLContent...");
      // Get current bill data
      const billData = await CallAPIBill.getBillByIdAPI(Number(id));
      console.log("📄 Bill data received:", billData?.billId || billData?.id);

      // Generate HTML content for invoice
      const htmlContent = generateInvoiceHTML({
        invoice: billData,
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      console.log("📝 HTML content generated, length:", htmlContent.length);

      // Create a new window for viewing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        console.log("✅ Window opened successfully");
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        console.log("⚠️ Window blocked, using blob download");
        // Fallback: create a blob and download
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice_${billData.billId || billData.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("📥 File download initiated");
      }
    } catch (error) {
      console.error("❌ Error viewing invoice:", error);
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: `Failed to view invoice: ${
          error instanceof Error ? error.message : String(error)
        }`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  const printReceiptHTMLContent = async () => {
    try {
      console.log("🚀 Starting printReceiptHTMLContent...");
      // Get current bill data
      const billData = await CallAPIBill.getBillByIdAPI(Number(id));
      console.log("📄 Bill data received:", billData?.billId || billData?.id);

      // Generate HTML content for receipt
      const htmlContent = generateReceiptHTML({
        invoice: billData, // Receipt template uses 'invoice' prop
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      console.log("📝 HTML content generated, length:", htmlContent.length);

      // Create a new window for viewing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        console.log("✅ Window opened successfully");
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        console.log("⚠️ Window blocked, using blob download");
        // Fallback: create a blob and download
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `receipt_${billData.billId || billData.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("📥 File download initiated");
      }
    } catch (error) {
      console.error("❌ Error viewing receipt:", error);
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: `Failed to view receipt: ${
          error instanceof Error ? error.message : String(error)
        }`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  // Mobile PDF functions
  const saveQuotationToPDF = async () => {
    try {
      console.log("🚀 Starting saveQuotationToPDF...");

      // Get current bill data
      const billData = await CallAPIBill.getBillByIdAPI(Number(id));
      console.log("📄 Bill data received:", billData?.billId || billData?.id);

      // Generate HTML content for quotation
      const htmlContent = generateQuotationHTML({
        quotation: billData,
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      console.log("📝 HTML content generated, length:", htmlContent.length);

      // Print the document (this opens the PDF viewer)
      await ExpoPrint.printAsync({
        html: htmlContent,
      });

      console.log("✅ PDF generated successfully");
    } catch (error) {
      console.log("PDF generation cancelled or failed:", error);

      // Check if it's a cancellation error (user dismissed the print dialog)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user") ||
        errorMessage.includes("Printing did not complete") ||
        errorMessage.includes("did not complete")
      ) {
        console.log("📝 User cancelled PDF generation");
        // Don't show error alert for user cancellation
        return;
      }

      // Only show error for actual errors
      console.error("❌ Error generating quotation PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${errorMessage}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  const saveInvoiceToPDF = async () => {
    try {
      console.log("🚀 Starting saveInvoiceToPDF...");

      // Get current bill data
      const billData = await CallAPIBill.getBillByIdAPI(Number(id));
      console.log("📄 Bill data received:", billData?.billId || billData?.id);

      // Generate HTML content for invoice
      const htmlContent = generateInvoiceHTML({
        invoice: billData,
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      console.log("📝 HTML content generated, length:", htmlContent.length);

      // Print the document (this opens the PDF viewer)
      await ExpoPrint.printAsync({
        html: htmlContent,
      });

      console.log("✅ PDF generated successfully");
    } catch (error) {
      console.log("PDF generation cancelled or failed:", error);

      // Check if it's a cancellation error (user dismissed the print dialog)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user") ||
        errorMessage.includes("Printing did not complete") ||
        errorMessage.includes("did not complete")
      ) {
        console.log("📝 User cancelled PDF generation");
        // Don't show error alert for user cancellation
        return;
      }

      // Only show error for actual errors
      console.error("❌ Error generating invoice PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${errorMessage}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  const saveReceiptToPDF = async () => {
    try {
      console.log("🚀 Starting saveReceiptToPDF...");

      // Get current bill data
      const billData = await CallAPIBill.getBillByIdAPI(Number(id));
      console.log("📄 Bill data received:", billData?.billId || billData?.id);

      // Generate HTML content for receipt
      const htmlContent = generateReceiptHTML({
        invoice: billData, // Receipt template uses 'invoice' prop
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      console.log("📝 HTML content generated, length:", htmlContent.length);

      // Print the document (this opens the PDF viewer)
      await ExpoPrint.printAsync({
        html: htmlContent,
      });

      console.log("✅ PDF generated successfully");
    } catch (error) {
      console.log("PDF generation cancelled or failed:", error);

      // Check if it's a cancellation error (user dismissed the print dialog)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user") ||
        errorMessage.includes("Printing did not complete") ||
        errorMessage.includes("did not complete")
      ) {
        console.log("📝 User cancelled PDF generation");
        // Don't show error alert for user cancellation
        return;
      }

      // Only show error for actual errors
      console.error("❌ Error generating receipt PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${errorMessage}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  useEffect(() => {
    if (!cAddress.trim() && !cProvince) {
      isExportManualOverride.current = false;
    }
    if (!isExportManualOverride.current) {
      setIsExport(detectIsExport(cAddress, cProvince || undefined));
    }
  }, [cAddress, cProvince]);

  // Fetch bill data
  useEffect(() => {
    const fetchBillData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);

        // Fetch business details for PDF generation
        const memberId = await getMemberId();
        if (memberId) {
          try {
            const businessData =
              await CallAPIBusiness.getBusinessDetailsAPI(memberId);
            setBusinessDetails(businessData);
            setBusinessName(businessData?.businessName || "");
          } catch (error) {
            console.error("Error fetching business details:", error);
          }
          // Fetch project suggestions
          try {
            const projects = await CallAPIExpense.getProjectSuggestionsAPI(memberId);
            setProjectSuggestions(projects);
          } catch (error) {
            console.error("Error fetching project suggestions:", error);
          }
        }

        // Use DocumentType from BusinessProvider context instead of calling API
        let businessDocTypes: string[] = [];
        if (contextDocumentTypes) {
          businessDocTypes = Array.isArray(contextDocumentTypes)
            ? contextDocumentTypes
            : [contextDocumentTypes];
          setAvailableDocumentTypes(businessDocTypes);
        }

        // Then fetch bill data
        const billData = await CallAPIBill.getBillByIdAPI(Number(id));
        setCName(billData.cName);
        setCLastName(billData.cLastName);
        setCPhone(billData.cPhone);
        setCGender(billData.cGender);
        setCAddress(billData.cAddress);
        setCPostId(billData.cPostId);
        setCProvince(billData.cProvince);
        setCCountry(billData.cCountry ?? "Thailand");
        isExportManualOverride.current = true;
        setIsExport(billData.isExport ?? detectIsExport(billData.cAddress, billData.cProvince || undefined));
        setPayment(billData.payment);
        setCashStatus(billData.cashStatus);
        setSelectedPlatform(billData.platform ?? "");
        setImage(billData.image);
        setCTaxId(billData.cTaxId);
        setBranch(billData.branch === "Head Office" ? "" : (billData.branch || ""));
        setValidContactUntil(billData.validContactUntil || "");
        setFlexiId(billData.flexiId || null);
        setIsSplitChild(billData.isSplitChild === true);
        setMySplitPercent(billData.splitPercent ?? null);
        if (billData.isSplitChild && Array.isArray(billData.splitSiblings)) {
          const siblings = [...billData.splitSiblings].sort((a: any, b: any) => a.id - b.id);
          const idx = siblings.findIndex((s: any) => s.id === (billData.id ?? Number(id)));
          setMySplitIndex(idx >= 0 ? idx + 1 : null);
        }
        // Determine base total for split calculation
        setSplitBaseTotal(
          Number(billData.totalInvoice) > 0
            ? Number(billData.totalInvoice)
            : Number(billData.totalQuotation) > 0
            ? Number(billData.totalQuotation)
            : Number(billData.total) || 0,
        );
        setIsSplitParent(
          !!billData.splitGroupId &&
          billData.splitGroupId === billData.flexiId &&
          !billData.isSplitChild,
        );

        // Set bill-level discount from bill data
        if (billData.billLevelDiscount) {
          const isPercent = billData.billLevelDiscountIsPercent ?? false;
          setBillLevelDiscountIsPercent(isPercent);
          setBillLevelDiscountValue(
            isPercent
              ? String(billData.billLevelDiscountPercent ?? 0)
              : String(billData.billLevelDiscount),
          );
        }
        // Set note from bill data
        if (billData.note) {
          setNote(billData.note);
        }
        // Set paymentTermCondition from bill data
        if (billData.paymentTermCondition) {
          setPaymentTermCondition(billData.paymentTermCondition);
        }
        // Set remark from bill data
        if (billData.remark) {
          setRemark(billData.remark);
        }
        // Set project from bill data
        if (billData.projectId) {
          setProjectId(billData.projectId);
          setProjectDescription(billData.project?.description ?? "");
        }
        // Set document type from API data, but only if it's available in business
        let isReceiptDocument = false;
        if (billData.DocumentType) {
          const billDocType = getDocumentTypeFromAPI(billData.DocumentType);
          isReceiptDocument = billDocType === "RE";
          // Check if the bill's document type is available in the business settings
          const billDocTypeName = getDocumentTypeForAPI(billDocType);
          if (
            businessDocTypes.length === 0 ||
            businessDocTypes.includes(billDocTypeName)
          ) {
            setSelectedDocumentType(billDocType);
            savedDocumentTypeRef.current = billDocType;
          } else {
            // If bill's document type is not available, set to first available type
            if (businessDocTypes.includes("Quotation")) {
              setSelectedDocumentType("QA");
            } else if (businessDocTypes.includes("Invoice")) {
              setSelectedDocumentType("IV");
            } else if (businessDocTypes.includes("Receipt")) {
              setSelectedDocumentType("RE");
            }
          }
        }
        setIsDocumentTypeLocked(isReceiptDocument);

        // Set progress section visibility based on business document types
        if (
          businessDocTypes.length === 1 &&
          businessDocTypes[0] === "Receipt"
        ) {
          setShowProgressSection(false);
          setSelectedDocumentType("RE");
        } else {
          setShowProgressSection(true);
        }
        // Set taxType based on database value (fallback to tax ID presence)
        const rawTaxType = billData.TaxType ?? billData.taxType;
        const normalizedTaxType =
          rawTaxType && typeof rawTaxType === "string"
            ? rawTaxType.toLowerCase() === "juristic"
              ? "Juristic"
              : rawTaxType.toLowerCase() === "individual"
                ? "Individual"
                : null
            : null;
        const hasTaxId = Boolean(
          billData.cTaxId && billData.cTaxId.trim().length > 0,
        );
        setTaxType(normalizedTaxType ?? (hasTaxId ? "Juristic" : "Individual"));
        // Set productItems from billData.product (array of items)
        if (
          billData.product &&
          Array.isArray(billData.product) &&
          billData.product.length > 0
        ) {
          setProductItems(
            billData.product.map((item: any) => ({
              product: item.product != null ? item.product.toString() : "",
              price: item.unitPrice.toString(),
              quantity: item.quantity.toString(),
              unit: item.unit || "",
              unitDiscount: item.unitDiscount
                ? item.unitDiscount.toString()
                : "",
              description: item.description ?? "",
            })),
          );
        } else {
          setProductItems([
            {
              product: "",
              price: "",
              quantity: "1",
              unit: "",
              unitDiscount: "",
              description: "",
            },
          ]);
        }

        // Initialize withholding tax fields from bill data if available
        setWithholdingTax(Boolean(billData.withHoldingTax));
        setWithholdingPercent(
          billData.WHTpercent !== undefined && billData.WHTpercent !== null
            ? String(billData.WHTpercent)
            : "",
        );

        // Set priceValid from billData
        if (billData.priceValid) {
          const priceValidDate = new Date(billData.priceValid);
          setPriceValid(priceValidDate);

          // Calculate days difference to set priceValidDays
          const now = new Date(billData.invoiceAt || billData.purchaseAt || Date.now());
          const diffTime = priceValidDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 7) {
            setPriceValidDays(7);
          } else if (diffDays === 15) {
            setPriceValidDays(15);
          } else if (diffDays === 30) {
            setPriceValidDays(30);
          } else if (diffDays === 45) {
            setPriceValidDays(45);
          }
        }
        // Load each date column independently
        const loadedPurchaseAt = billData.purchaseAt ? new Date(billData.purchaseAt) : new Date();
        const loadedQuotationAt = billData.quotationAt ? new Date(billData.quotationAt) : loadedPurchaseAt;
        const loadedInvoiceAt = billData.invoiceAt ? new Date(billData.invoiceAt) : loadedPurchaseAt;
        const loadedReceiptAt = billData.receiptAt ? new Date(billData.receiptAt) : loadedPurchaseAt;
        setPurchaseAt(loadedPurchaseAt);
        setQuotationAt(loadedQuotationAt);
        setInvoiceAt(loadedInvoiceAt);
        setReceiptAt(loadedReceiptAt);
        // Show date for the current DocumentType
        const docTypeLoaded = billData.DocumentType;
        const activeDate =
          docTypeLoaded === "Invoice" ? loadedInvoiceAt
          : docTypeLoaded === "Quotation" ? loadedQuotationAt
          : docTypeLoaded === "Receipt" ? loadedReceiptAt
          : loadedPurchaseAt;
        setSelectedDates([activeDate.toISOString()]);
        setDate([activeDate.toISOString()]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bill data:", error);
        setError("Failed to load bill data");
        setIsLoading(false);
      }
    };
    fetchBillData();
  }, [id, contextDocumentTypes]); // depend on contextDocumentTypes so we have it when available

  useEffect(() => {
    const fetchMemberId = async () => {
      const uniqueId = await getMemberId();
      const businessId = await getBusinessId();

      setMemberId(uniqueId);
      if (businessId) {
        setBusinessAcc(businessId);
      }

      // Fetch platform for this member
      if (uniqueId) {
        try {
          const PlatformData =
            await CallAPIPlatform.getPlatformEnumAPI(uniqueId);
          setPlatformOptions(Array.isArray(PlatformData) ? PlatformData : []);
        } catch (error) {
          console.error("Failed to fetch platforms:", error);
          setPlatformOptions([]);
        }
        try {
          const countries = await CallAPIBill.getCountryEnumAPI(uniqueId);
          setCountryOptions(countries);
        } catch (error) {
          console.error("Failed to fetch country history:", error);
        }
      }
    };

    fetchMemberId();

    // Call Api Product list with price
    const fetchProductChoice = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response =
            await CallAPIProduct.getProductChoiceWithPriceAPI(memberId);
          setProductChoice(response || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductChoice([]);
      }
    };

    fetchProductChoice();

    // NOTE: Removed direct CallAPIBusiness.getBusinessDetailsAPI call here.
    // Business DocumentType and businessType are sourced from BusinessProvider context instead.
  }, []);

  // Sync document types and business type from BusinessProvider context
  useEffect(() => {
    if (contextBusinessType) {
      // If you need to store businessType locally, you can add a state for it.
    }

    if (contextDocumentTypes) {
      const docTypes = Array.isArray(contextDocumentTypes)
        ? contextDocumentTypes
        : [contextDocumentTypes];
      setAvailableDocumentTypes(docTypes);

      // If only Receipt is available, hide progression and default to Receipt
      if (docTypes.length === 1 && docTypes[0] === "Receipt") {
        setShowProgressSection(false);
        setSelectedDocumentType("RE");
      } else {
        setShowProgressSection(true);
        if (docTypes.includes("Quotation")) {
          setSelectedDocumentType("QA");
        } else if (docTypes.includes("Invoice")) {
          setSelectedDocumentType("IV");
        } else if (docTypes.includes("Receipt")) {
          setSelectedDocumentType("RE");
        }
      }
    }
  }, [contextDocumentTypes, contextBusinessType]);

  // Product choice
  const [productChoice, setProductChoice] = useState<any[]>([]);

  const validatePhone = (phone: string) => {
    return phone.length === 10 && /^\d+$/.test(phone);
  };

  // --- Handlers for Product Items ---
  const handleProductItemChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setProductItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // If product is changed, auto-fill price and unit
      if (field === "product") {
        const selectedProduct = productChoice.find(
          (p: any) => p.id?.toString() === value,
        );
        updated[index].price =
          selectedProduct && selectedProduct.price
            ? selectedProduct.price.toString()
            : "";
        updated[index].unit =
          selectedProduct && selectedProduct.unit
            ? selectedProduct.unit.toString()
            : "";
        updated[index].description = selectedProduct?.description ?? "";
        // Auto-fill customer fields if product is Tiktok Affiliate
        if (selectedProduct?.name === "Tiktok Affiliate") {
          setCName("ติ๊กต๊อก (ไทยแลนด์) จำกัด");
          setCLastName("");
          setCPhone("0000000000");
          setCTaxId("0105562003561");
          setCGender("NotSpecified");
          setCAddress(
            "เลขที่ 289/3 ซอยลาดพร้าว 80 แยก 22 แขวงวังทองหลาง เขตวังทองหลาง",
          );
          setCProvince("กรุงเทพมหานคร");
          setCPostId("10310");
          setPayment("Transfer");
          setCashStatus(true);
          setSelectedPlatform("Tiktok");
          setTaxType("Juristic"); // Set tax type to Juristic for Tiktok Affiliate
        }
      }
      return updated;
    });
  };

  const handleAddProductItem = () => {
    setProductItems((prev) => [
      ...prev,
      { product: "", price: "", quantity: "1", unit: "", unitDiscount: "", description: "" },
    ]);
  };

  const handleRemoveProductItem = (index: number) => {
    setProductItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePriceValidDaysChange = (days: 7 | 15 | 30 | 45) => {
    setPriceValidDays(days);
    const baseDate = selectedDocumentType === "QA" ? new Date(quotationAt) : new Date(invoiceAt);
    baseDate.setDate(baseDate.getDate() + days);
    setPriceValid(baseDate);
  };

  const handleUpdateBill = async () => {
    if (isUpdatingBill) return;
    setError("");
    // Check if all required fields are filled and create array of missing fields
    const missingFields = [];
    if (!cName) missingFields.push(t("bill.customerName"));
    //if (!cLastName) missingFields.push(t("bill.customerLastName"));
    if (!cPhone) missingFields.push(t("bill.customerPhone"));
    if (!cGender) missingFields.push(t("bill.customerGender"));
    if (!cAddress) missingFields.push(t("bill.customerAddress"));
    if (!cPostId) missingFields.push(t("bill.customerPostal"));
    if (!cProvince) missingFields.push(t("bill.customerProvince"));
    if (selectedDocumentType === "RE" && !payment)
      missingFields.push(t("bill.paymentMethod"));
    if (!selectedPlatform) missingFields.push(t("bill.platform"));
    // Validate product items
    if (
      productItems.some(
        (item) => !item.product || !item.price || !item.quantity,
      )
    ) {
      setAlertConfig({
        visible: true,
        title: t("bill.validation.incomplete"),
        message:
          t("bill.validation.missingFields") +
          ":\n• " +
          t("bill.productName") +
          ", " +
          t("bill.price") +
          ", " +
          t("bill.amount"),
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
    if (missingFields.length > 0) {
      setAlertConfig({
        visible: true,
        title: t("bill.validation.incomplete"),
        message:
          t("bill.validation.missingFields") +
          ":\n• " +
          missingFields.join("\n• "),
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
    // Validate phone number
    if (!validatePhone(cPhone)) {
      setAlertConfig({
        visible: true,
        title: t("bill.validation.invalidPhone"),
        message: t("bill.validation.phoneFormat"),
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
      setIsUpdatingBill(true);
      // Call API to update bill
      const data = await CallAPIBill.updateBillAPI({
        id: Number(id),
        purchaseAt,
        quotationAt,
        invoiceAt,
        receiptAt,
        cName,
        cLastName,
        cPhone,
        cGender: cGender as "Female" | "Male" | "NotSpecified",
        cAddress,
        cPostId,
        cProvince,
        cCountry: isExport ? cCountry : "Thailand",
        cTaxId: cTaxId,
        payment: payment as
          | "COD"
          | "Transfer"
          | "CreditCard"
          | "Cash"
          | "NotSpecified",
        memberId: memberId || "",
        businessAcc,
        platform: selectedPlatform,
        image,
        DocumentType: [getDocumentTypeForAPI(selectedDocumentType)],
        note: note,
        paymentTermCondition: paymentTermCondition,
        remark: remark || undefined,
        productItems: productItems.map((item) => ({
          product: Number(item.product),
          unit: item.unit,
          unitPrice: Number(item.price),
          quantity: Number(item.quantity),
          unitDiscount: Number(item.unitDiscount) || 0,
          description: item.description || undefined,
        })),
        billLevelDiscount: billLevelDiscountAmount,
        billLevelDiscountIsPercent: billLevelDiscountIsPercent,
        billLevelDiscountPercent: billLevelDiscountIsPercent ? (Number(billLevelDiscountValue) || 0) : 0,
        withholdingTax: withholdingTax,
        withholdingPercent: withholdingTax
          ? Number(withholdingPercent)
          : undefined,
        WHTAmount: withholdingTax ? withholdingTaxAmount : undefined,
        priceValid: priceValid || undefined,
        repeat: false, // Set to false for single bill update
        repeatMonths: 1, // Set to 1 for single bill update
        taxType: taxType,
        branch: taxType === "Juristic" ? (branch || "Head Office") : undefined,
        isExport,
        ...(projectId != null && { projectId }),
      });
      if (data.error) throw new Error(data.error);

      if (projectId != null) {
        await CallAPIExpense.updateProjectAPI(projectId, projectDescription || undefined);
      }

      setAlertConfig({
        visible: true,
        title: t("bill.alerts.success"),
        message: t("bill.alerts.successMessage") || data.message,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.replace("/(tabs)/income");
            },
          },
        ],
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsUpdatingBill(false);
    }
  };

  const handleDateTimeChange = (next: Date) => {
    const formatted = format(next, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    if (editingDateField === "QA") {
      setQuotationAt(next);
    } else if (editingDateField === "PU") {
      setPurchaseAt(next);
      setSelectedDates([formatted]);
      setDate([formatted]);
    } else if (editingDateField === "IV") {
      setInvoiceAt(next);
    } else if (editingDateField === "RE") {
      setReceiptAt(next);
    } else if (editingDateField === "PV") {
      setPriceValid(next);
      setPriceValidDays(null);
    } else {
      if (selectedDocumentType === "QA") setQuotationAt(next);
      else if (selectedDocumentType === "IV") setInvoiceAt(next);
      else setReceiptAt(next);
      setSelectedDates([formatted]);
      setDate([formatted]);
    }
    setEditingDateField(null);
  };

  if (isLoading) {
    return (
      <View className={`flex-1 ${useBackgroundColorClass()}`}>
        <View className="flex-1 justify-center items-center">
          <CustomText>{t("common.loading")}</CustomText>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${useBackgroundColorClass()}`}
      style={{
        minHeight: Dimensions.get("window").height,
        alignItems: Platform.OS === "web" ? "center" : "stretch",
      }}
    >
      <DateTimePicker
        visible={calendarVisible}
        value={
          editingDateField === "QA" ? quotationAt
          : editingDateField === "PU" ? purchaseAt
          : editingDateField === "IV" ? invoiceAt
          : editingDateField === "RE" ? receiptAt
          : editingDateField === "PV" ? (priceValid ?? new Date())
          : selectedDocumentType === "QA" ? quotationAt
          : selectedDocumentType === "IV" ? invoiceAt
          : receiptAt
        }
        onChange={handleDateTimeChange}
        onClose={() => setCalendarVisible(false)}
        maxDate={editingDateField === "PV" ? undefined : new Date()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        //  keyboardVerticalOffset={5}
      >
        <ScrollView
          style={{
            width: "100%",
            paddingHorizontal: isMobileApp() ? 0 : 15,
            maxWidth: isTabletWeb() ? 600 : 1000,
          }}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          {/* Enhanced DocumentType Progression - Only show if not Receipt-only business */}
          {showProgressSection && (
            <View
              style={{
                backgroundColor: "#00000000",
              }}
            >
              {/* Enhanced Progress Container */}
              <View
                style={{
                  backgroundColor: "transparent",
                  borderRadius: 20,
                  padding: 10,
                  marginVertical: 5,
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
                    paddingVertical: 5,
                  }}
                >
                  {getAvailableSteps().map((step, index) => {
                    const stepConfig = {
                      QA: {
                        icon: "document-text-outline",
                        label: t("bill.quotation"),
                        type: "Quotation",
                      },
                      IV: {
                        icon: "receipt-outline",
                        label: t("bill.invoice"),
                        type: "Invoice",
                      },
                      RE: {
                        icon: "checkmark-circle-outline",
                        label: t("bill.receipt"),
                        type: "Receipt",
                      },
                    };
                    const availableSteps = getAvailableSteps();
                    const isLastStep = index === availableSteps.length - 1;
                    return (
                      <React.Fragment key={step}>
                        {/* Step Circle */}
                        <TouchableOpacity
                          style={{
                            alignItems: "center",
                            backgroundColor: "transparent",
                          }}
                          onPress={() => {
                            if (!isEditMode) {
                              if (!isStepCompleted(step)) return;
                              switch (step) {
                                case "QA":
                                  viewQuotationDocument();
                                  break;
                                case "IV":
                                  viewInvoiceDocument();
                                  break;
                                case "RE":
                                  viewReceiptDocument();
                                  break;
                              }
                            } else {
                              // Edit mode: allow changing document type unless Receipt is locked
                              if (isDocumentTypeLocked && step !== "RE") {
                                setAlertConfig({
                                  visible: true,
                                  title: t("bill.alerts.receiptLockedTitle"),
                                  message: t(
                                    "bill.alerts.receiptLockedMessage",
                                  ),
                                  buttons: [
                                    {
                                      text: t("common.ok"),
                                      onPress: () =>
                                        setAlertConfig((prev) => ({
                                          ...prev,
                                          visible: false,
                                        })),
                                    },
                                  ],
                                });
                                console.log(
                                  "🔒 Receipt stage locked. Cannot switch to:",
                                  step,
                                );
                                return;
                              }
                              console.log("✏️ Setting document type:", step);
                              setSelectedDocumentType(step);
                            }
                          }}
                          activeOpacity={
                            isStepCompleted(step) || isEditMode ? 0.7 : 1
                          }
                        >
                          {(() => {
                            return (
                          <View
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 25,
                              backgroundColor: isStepCompleted(step) ? "#04ecc1" : "transparent",
                              borderWidth: 3,
                              borderColor: isStepCompleted(step)
                                ? "#04ecc1"
                                : theme === "dark" ? "#666" : "#ccc",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: getStepOpacity(step),
                              shadowColor: isStepCompleted(step) ? "#04ecc1" : "transparent",
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.6,
                              shadowRadius: 8,
                              elevation: isStepCompleted(step) ? 8 : 0,
                            }}
                          >
                            <Ionicons
                              name={stepConfig[step].icon as any}
                              size={24}
                              color={
                                isStepCompleted(step)
                                  ? theme === "dark" ? "#18181b" : "#ffffff"
                                  : getStepIconColor(step)
                              }
                            />
                          </View>
                            );
                          })()}
                          <CustomText
                            style={{
                              fontSize: 10,
                              color: getStepDescriptionColor(step),
                              textAlign: "center",
                              marginTop: 5,
                            }}
                          >
                            {stepConfig[step].label}
                          </CustomText>
                        </TouchableOpacity>

                        {/* Connection Line - Only show if not last step */}
                        {!isLastStep && (
                          <View
                            style={{
                              width: 60,
                              height: 4,
                              marginHorizontal: 10,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingHorizontal: 5,
                            }}
                          >
                            {[...Array(5)].map((_, dotIndex) => (
                              <View
                                key={dotIndex}
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor:
                                    index <
                                    availableSteps.findIndex(
                                      (s) => s === selectedDocumentType,
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
          )}
          <View
            className="flex-1 justify-center h-full px-4 mt-1 mb-20 pb-20"
            style={{
              width: isDesktop() ? "80%" : "100%",
              maxWidth: 900,
              alignSelf: Platform.OS === "web" ? "center" : "auto",
            }}
          >
            {/* Row 1: FlexiId pill + edit toggle + calendar icon */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 2 }}>
              {/* Date + calendar — left side */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, opacity: isEditMode ? 1 : 0.6 }}>
                <TouchableOpacity onPress={() => setAllDatesVisible(true)} activeOpacity={0.7}>
                  <Ionicons name="calendar-outline" size={16} color={theme === "dark" ? "#c9c9c9" : "#48453e"} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => isEditMode ? (() => { setEditingDateField(null); setCalendarVisible(true); })() : null}
                  activeOpacity={isEditMode ? 0.7 : 1}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <CustomText style={{ fontSize: 11, fontWeight: "bold", color: theme === "dark" ? "#c9c9c9" : "#48453e" }}>
                    {selectedDocumentType === "QA"
                      ? "QA"
                      : selectedDocumentType === "IV"
                        ? "IV"
                        : "RE"}
                  </CustomText>
                  <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#c9c9c9" : "#48453e" }}>
                    {formatDate(
                      selectedDocumentType === "QA"
                        ? quotationAt.toISOString()
                        : selectedDocumentType === "IV"
                          ? invoiceAt.toISOString()
                          : receiptAt.toISOString()
                    )}
                  </CustomText>
                </TouchableOpacity>
              </View>

              {/* FlexiId + edit — right side */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {flexiId && selectedDocumentType !== "QA" && (
                  <TouchableOpacity
                    onPress={async () => {
                      await Clipboard.setStringAsync(flexiId);
                      setFlexiIdCopied(true);
                      setTimeout(() => setFlexiIdCopied(false), 2000);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#04ecc115",
                      borderWidth: 1,
                      borderColor: "#04ecc140",
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      gap: 5,
                      maxWidth: 160,
                    }}
                  >
                    <CustomText style={{ fontSize: 11, color: "#04ecc1", letterSpacing: 0.4 }} numberOfLines={1}>
                      {flexiId}
                    </CustomText>
                    <Ionicons
                      name={flexiIdCopied ? "checkmark-circle" : "copy-outline"}
                      size={12}
                      color={flexiIdCopied ? "#04ecc1" : "#04ecc180"}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setIsEditMode((prev) => {
                    if (prev) {
                      // Canceling edit — reset DocumentType to last saved DB value
                      setSelectedDocumentType(savedDocumentTypeRef.current);
                    }
                    return !prev;
                  })}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isEditMode ? "#ff8c0015" : "#04ecc115",
                    borderWidth: 1,
                    borderColor: isEditMode ? "#ff8c0040" : "#04ecc140",
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Ionicons
                    name={isEditMode ? "lock-closed" : "pencil-sharp"}
                    size={13}
                    color={isEditMode ? "#ff8c00" : "#04ecc1"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Split installments section */}
            {(selectedDocumentType === "IV" || (selectedDocumentType === "QA" && isSplitParent)) && !isSplitChild && (
              <View
                style={{
                  marginVertical: 10,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: isSplitParent
                    ? "#04ecc140"
                    : theme === "dark" ? "#3a3a3a" : "#e5e5e5",
                  backgroundColor: theme === "dark" ? "#1a1a1b" : "#f9f9f9",
                }}
              >
                {/* Header row */}
                <TouchableOpacity
                  onPress={() => !isSplitParent && setShowSplitSection((v) => !v)}
                  activeOpacity={isSplitParent ? 1 : 0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 14,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="git-branch-outline" size={16} color="#04ecc1" />
                    <CustomText weight="semibold" style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e", fontSize: 14 }}>
                      {isSplitParent
                        ? t("bill.splitActive") || "Split Active"
                        : t("bill.splitInstallments") || "Split Installments"}
                    </CustomText>
                  </View>
                  {isSplitParent ? (
                    <TouchableOpacity onPress={handleResetSplit} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="refresh" size={14} color="#dc2626" />
                      <CustomText style={{ color: "#dc2626", fontSize: 12 }}>
                        {t("bill.reset") || "Reset"}
                      </CustomText>
                    </TouchableOpacity>
                  ) : (
                    <Ionicons
                      name={showSplitSection ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={theme === "dark" ? "#666" : "#999"}
                    />
                  )}
                </TouchableOpacity>

                {/* Setup form */}
                {!isSplitParent && showSplitSection && (
                  <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                    {splitAllRows.map((row, index) => {
                      const isAuto = !!row.auto;
                      const val = parseFloat(row.value) || 0;
                      const rowMode = row.mode;
                      // Secondary hint uses pre-WHT display total (display only, backend unaffected)
                      const secondaryLabel =
                        rowMode === "percent"
                          ? splitDisplayTotal > 0 && val > 0
                            ? (splitDisplayTotal * val / 100).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : null
                          : splitDisplayTotal > 0 && val > 0
                          ? (val / splitDisplayTotal * 100).toFixed(2) + "%"
                          : null;
                      return (
                        <View
                          key={index}
                          style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}
                        >
                          <CustomText style={{ color: theme === "dark" ? "#666" : "#999", fontSize: 12, width: 22 }}>
                            {index + 1}.
                          </CustomText>
                          {/* Per-row mode toggle */}
                          {!isAuto && (
                            <View style={{ flexDirection: "row", backgroundColor: theme === "dark" ? "#1a1a1b" : "#f0f0f0", borderRadius: 6, padding: 2 }}>
                              {(["percent", "amount"] as const).map((m) => (
                                <TouchableOpacity
                                  key={m}
                                  onPress={() =>
                                    setSplitRows((prev) =>
                                      prev.map((r, i) => i === index ? { ...r, mode: m, value: "" } : r)
                                    )
                                  }
                                  style={{
                                    paddingHorizontal: 7,
                                    paddingVertical: 4,
                                    borderRadius: 4,
                                    backgroundColor: rowMode === m ? "#04ecc1" : "transparent",
                                  }}
                                >
                                  <CustomText weight="semibold" style={{ fontSize: 11, color: rowMode === m ? "#18181b" : theme === "dark" ? "#666" : "#999" }}>
                                    {m === "percent" ? "%" : "฿"}
                                  </CustomText>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                          <View
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              alignItems: "center",
                              backgroundColor: isAuto
                                ? theme === "dark" ? "#1a1a1b" : "#f0f0f0"
                                : theme === "dark" ? "#2a2b2c" : "#ffffff",
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isAuto
                                ? "#04ecc140"
                                : theme === "dark" ? "#606060" : "#b1b1b1",
                              paddingHorizontal: 10,
                            }}
                          >
                            <TextInput
                              style={{
                                flex: 1,
                                color: isAuto
                                  ? "#04ecc1"
                                  : theme === "dark" ? "#b1b1b1" : "#606060",
                                fontSize: 15,
                                paddingVertical: 8,
                              }}
                              value={row.value}
                              editable={!isAuto}
                              onChangeText={(v) =>
                                setSplitRows((prev) =>
                                  prev.map((r, i) => i === index ? { ...r, value: v } : r),
                                )
                              }
                              keyboardType="decimal-pad"
                              placeholder="0"
                              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                            />
                            {isAuto && (
                              <CustomText style={{ color: "#04ecc1", fontSize: 12, marginRight: 4 }}>
                                {"(auto)"}
                              </CustomText>
                            )}
                            {!isAuto && rowMode === "percent" && (
                              <CustomText style={{ color: theme === "dark" ? "#606060" : "#b1b1b1", fontSize: 12, marginRight: 4 }}>%</CustomText>
                            )}
                            {secondaryLabel !== null && val > 0 && (
                              <>
                                <CustomText style={{ color: theme === "dark" ? "#444" : "#ccc", fontSize: 12, marginRight: 6 }}>|</CustomText>
                                <CustomText style={{ color: isAuto ? "#04ecc1" : theme === "dark" ? "#b1b1b1" : "#606060", fontSize: 13, marginRight: 4 }} numberOfLines={1}>
                                  {secondaryLabel}
                                </CustomText>
                              </>
                            )}
                          </View>
                          {!isAuto && (
                            <TouchableOpacity
                              onPress={() => setSplitRows((prev) => prev.filter((_, i) => i !== index))}
                            >
                              <Ionicons name="close-circle" size={18} color="#dc2626" />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}

                    {/* Add row + confirm */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <TouchableOpacity
                        onPress={() => setSplitRows((prev) => [...prev, { value: "", mode: "percent" }])}
                        disabled={splitRemainderAmount <= 0}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: splitRemainderAmount > 0
                            ? "#04ecc160"
                            : theme === "dark" ? "#3a3a3a" : "#e0e0e0",
                          borderRadius: 8,
                          borderStyle: "dashed",
                          paddingVertical: 8,
                          gap: 4,
                          opacity: splitRemainderAmount > 0 ? 1 : 0.4,
                        }}
                      >
                        <Ionicons name="add" size={14} color="#04ecc1" />
                        <CustomText style={{ color: "#04ecc1", fontSize: 12 }}>
                          {t("bill.addInstallment") || "Add"}
                        </CustomText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleSplitSubmit}
                        disabled={!splitIsValid || splitSubmitting}
                        style={{
                          backgroundColor: splitIsValid && !splitSubmitting ? "#04ecc1" : theme === "dark" ? "#333" : "#ccc",
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          opacity: splitIsValid && !splitSubmitting ? 1 : 0.5,
                        }}
                      >
                        <CustomText weight="semibold" style={{ color: theme === "dark" ? "#18181b" : "#ffffff", fontSize: 12 }}>
                          {splitSubmitting ? "..." : t("common.confirm") || "Confirm"}
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Row 2: Platform dropdown — full width */}
            <View>
              {platformOptions.length > 0 ? (
                <DropdownClear
                  title={t("bill.store")}
                  options={platformOptions.map((plat) => {
                    if (typeof plat === "string") {
                      return { label: plat, value: plat };
                    }
                    const label = plat?.accName ?? plat?.platform ?? plat?.plat ?? "";
                    const value = plat?.platform ?? plat?.plat ?? plat?.accName ?? "";
                    return { label, value };
                  })}
                  placeholder={t("bill.selectStore")}
                  
                  selectedValue={selectedPlatform}
                  onValueChange={(value: any) => {
                    if (isEditMode) setSelectedPlatform(value);
                  }}
                  otherStyles="mt-1 mb-2"
                  disabled={!isEditMode}
                />
              ) : null}
            </View>
            {/* Tax Type Checkboxes Row */}
            <View
              className="flex flex-row items-center mt-2 mb-2"
              style={{ backgroundColor: "transparent", marginBottom: 8 }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                }}
                onPress={() => {
                  setTaxType("Individual");
                  setCGender(""); // Allow gender selection
                }}
                activeOpacity={1}
              >
                <Ionicons
                  name={
                    taxType === "Individual" ? "checkbox" : "square-outline"
                  }
                  size={22}
                  color={theme === "dark" ? "#b1b1b1" : "#606060"}
                />
                <CustomText
                  className="ml-2"
                  style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
                >
                  {t("auth.businessRegister.taxTypeOption.Individual")}
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}
                onPress={() => {
                  setTaxType("Juristic");
                  setCGender("NotSpecified"); // Always set gender to NotSpecified
                }}
                activeOpacity={1}
              >
                <Ionicons
                  name={taxType === "Juristic" ? "checkbox" : "square-outline"}
                  size={22}
                  color={theme === "dark" ? "#b1b1b1" : "#606060"}
                />
                <CustomText
                  className="ml-2"
                  style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
                >
                  {t("auth.businessRegister.taxTypeOption.Juristic")}
                </CustomText>
              </TouchableOpacity>
              {taxType === "Juristic" && (
                <View style={{ flex: 1 }}>
                  <FormFieldClear
                    title={t("bill.branch")}
                    value={branch}
                    handleChangeText={setBranch}
                    placeholder={t("bill.headOffice")}
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles="mb-0"
                  />
                </View>
              )}
            </View>

            <View className="flex flex-row justify-between">
              <View
                className={taxType === "Juristic" ? "w-full" : "w-1/2 pr-2"}
              >
                <FormFieldClear
                  title={t("bill.customerName")}
                  value={cName}
                  handleChangeText={setCName}
                  placeholder={t("bill.enterName")}
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  placeholderTextColor={
                    theme === "dark" ? "#606060" : "#b1b1b1"
                  }
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  otherStyles={fieldStyles}
                  editable={isEditMode}
                />
              </View>
              <View className="w-1/2 pr-2">
                {taxType !== "Juristic" && (
                  <FormFieldClear
                    title={t("bill.customerLastName")}
                    value={cLastName}
                    handleChangeText={setCLastName}
                    placeholder={t("bill.enterLastName")}
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    placeholderTextColor={
                      theme === "dark" ? "#606060" : "#b1b1b1"
                    }
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles={fieldStyles}
                    editable={isEditMode}
                  />
                )}
              </View>
            </View>
            {taxType === "Juristic" && (
              <FormFieldClear
                title={t("bill.customerTaxId")}
                value={cTaxId}
                handleChangeText={setCTaxId}
                placeholder={t("bill.enterTaxId")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                keyboardType="numeric"
                maxLength={13}
                editable={isEditMode}
              />
            )}

            <View className="flex flex-row justify-between">
              <View
                className={taxType === "Juristic" ? "w-full" : "w-1/2 pr-2"}
              >
                <FormFieldClear
                  title={t("bill.customerPhone")}
                  value={cPhone}
                  icons={"call"}
                  handleChangeText={setCPhone}
                  handlePress={() => {
                    if (cPhone && cPhone.length === 10) {
                      Linking.openURL(`tel:${cPhone}`);
                    }
                  }}
                  placeholder="0812345678"
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  placeholderTextColor={
                    theme === "dark" ? "#606060" : "#b1b1b1"
                  }
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  otherStyles={fieldStyles}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={isEditMode}
                />
              </View>
              {taxType === "Individual" && (
                <View className="w-1/2 pr-2">
                  <DropdownClear
                    title={t("bill.customerGender")}
                    options={[
                      { label: t("bill.gender.male"), value: "Male" },
                      { label: t("bill.gender.female"), value: "Female" },
                      {
                        label: t("bill.gender.notSpecified"),
                        value: "NotSpecified",
                      },
                    ]}
                    placeholder={t("bill.selectGender")}
                    selectedValue={
                      cGender ? t(`bill.gender.${cGender.toLowerCase()}`) : ""
                    }
                    onValueChange={setCGender}
                    otherStyles="mt-2 mb-2"
                    disabled={!isEditMode}
                  />
                </View>
              )}
            </View>

            <FormFieldClear
              title={t("bill.customerAddress")}
              value={cAddress}
              handleChangeText={setCAddress}
              placeholder={t("bill.enterAddress")}
              borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              otherStyles={fieldStyles}
              maxLength={200}
              multiline={true}
              numberOfLines={4}
              boxheight={
                isAddressFocused
                  ? 110
                  : cAddress
                    ? Math.max(60, Math.min(110, cAddress.length * 0.8 + 40))
                    : undefined
              }
              editable={isEditMode}
              focus={setIsAddressFocused}
            />

            <View className="flex flex-row justify-between">
              <View className="w-1/2 pr-2">
                <DropdownClear
                  title={t("bill.customerProvince")}
                  options={THAI_PROVINCES_KEYS.map((key) => ({
                    label: isExport ? t(`provinces.${key}`, { lng: "en" }) : t(`provinces.${key}`),
                    value: isExport ? t(`provinces.${key}`, { lng: "en" }) : t(`provinces.${key}`),
                  }))}
                  selectedValue={cProvince}
                  onValueChange={setCProvince}
                  placeholder={t("bill.selectProvince")}
                  otherStyles="mt-2 mb-2"
                  disabled={!isEditMode}
                  onAddNew={isEditMode ? (val: string) => setCProvince(val) : undefined}
                />
              </View>
              <View className="w-1/2 pr-2">
                <FormFieldClear
                  title={t("bill.customerPostal")}
                  value={cPostId}
                  handleChangeText={setCPostId}
                  placeholder="10400"
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  placeholderTextColor={
                    theme === "dark" ? "#606060" : "#b1b1b1"
                  }
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  otherStyles={fieldStyles}
                  keyboardType="numeric"
                  editable={isEditMode}
                />
              </View>
            </View>

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 4 }}
              onPress={() => { if (isEditMode) { isExportManualOverride.current = true; setIsExport((prev) => !prev); } }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isExport ? "checkbox" : "square-outline"}
                size={22}
                color={theme === "dark" ? "#b1b1b1" : "#606060"}
              />
              <CustomText
                className="ml-2"
                style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
              >
                {t("bill.isExport")}
              </CustomText>
            </TouchableOpacity>

            {isExport && (
              <DropdownClear
                title={t("bill.customerCountry")}
                options={(() => {
                  const suggestionOptions = COMMON_COUNTRY_KEYS.map((key) => ({
                    label: t(`countries.${key}`, { lng: "en" }),
                    value: t(`countries.${key}`, { lng: "en" }),
                  }));
                  const existingValues = new Set(suggestionOptions.map((o) => o.value));
                  const historyOptions = countryOptions
                    .filter((c) => !existingValues.has(c))
                    .map((c) => ({ label: c, value: c }));
                  return [...suggestionOptions, ...historyOptions];
                })()}
                selectedValue={cCountry}
                onValueChange={setCCountry}
                placeholder={t("bill.customerCountry")}
                otherStyles="mt-2 mb-2"
                disabled={!isEditMode}
                onAddNew={isEditMode ? (val: string) => setCCountry(val) : undefined}
              />
            )}

            {/* --- Split child banner --- */}
            {isSplitChild && mySplitPercent != null && (
              <View
                style={{
                  backgroundColor: '#04ecc115',
                  borderWidth: 1,
                  borderColor: '#04ecc140',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 14,
                }}
              >
                {/* top row: icon + label + installment pill */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,backgroundColor: 'transparent' }}>
                  <View style={{
                    backgroundColor: '#04ecc120',
                    borderRadius: 8,
                    padding: 5,
                  }}>
                    <Ionicons name="git-branch-outline" size={14} color="#04ecc1" />
                  </View>
                  <CustomText style={{ color: '#04ecc1', fontSize: 13, letterSpacing: 0.3 }} weight="bold">
                    แบ่งชำระ
                  </CustomText>
                  <View style={{
                    backgroundColor: '#04ecc1',
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                  }}>
                    <CustomText style={{ color: '#fff', fontSize: 11 }} weight="bold">
                      งวดที่ {mySplitIndex ?? '—'}
                    </CustomText>
                  </View>
                </View>

                {/* bottom row: percent | divider | amount */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14,backgroundColor: 'transparent' }}>
                  <View
                    style={{backgroundColor: 'transparent'}}>
                    <CustomText style={{ color: '#04ecc180', fontSize: 10 }} weight="regular">สัดส่วน</CustomText>
                    <CustomText style={{ color: '#04ecc1', fontSize: 22 }} weight="bold">
                      {parseFloat(Number(mySplitPercent).toFixed(2))}%
                    </CustomText>
                  </View>
                  <View style={{ width: 1, height: 36, backgroundColor: '#04ecc140' }} />
                  <View
                    style={{backgroundColor: 'transparent'}}>                  
                    <CustomText style={{ color: '#04ecc180', fontSize: 10 }} weight="regular">ยอดชำระ</CustomText>
                    <CustomText style={{ color: '#04ecc1', fontSize: 22 }} weight="bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(splitBaseTotal)}
                    </CustomText>
                  </View>
                  <Ionicons name="receipt-outline" size={36} color="#04ecc120" style={{ marginLeft: 'auto' }} />
                </View>
              </View>
            )}

            {/* --- Product Items UI --- */}
            {productItems.map((item, idx) => (
              <View key={idx} className="mb-1">
                <View className="flex flex-row items-center relative">
                  <View className="w-2/5 pr-2" style={{ position: "relative" }}>
                    {idx !== 0 && isEditMode && (
                      <TouchableOpacity
                        onPress={() => handleRemoveProductItem(idx)}
                        style={{
                          position: "absolute",
                          top: 2,
                          left: 2,
                          zIndex: 10,
                        }}
                        activeOpacity={1}
                      >
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                    <DropdownClear
                      title={t(`bill.productName`) + ` ${idx + 1}`}
                      options={productChoice.map((product) => ({
                        label: product.name,
                        value: product.id?.toString() ?? "",
                      }))}
                      placeholder={t("bill.selectProduct")}
                      selectedValue={item.product}
                      onValueChange={(value: string) =>
                        handleProductItemChange(idx, "product", value)
                      }
                      otherStyles="mt-1 mb-1"
                      disabled={!isEditMode}
                    />
                  </View>
                  <View className="w-1/4 pr-2">
                    <FormFieldClear
                      title={t("bill.price")}
                      value={
                        item.price ? Number(item.price).toLocaleString() : ""
                      }
                      handleChangeText={(value: string) => {
                        // Remove commas and non-numeric characters except digits
                        const numericValue = value.replace(/[^0-9]/g, "");
                        handleProductItemChange(idx, "price", numericValue);
                      }}
                      placeholder="1,000"
                      borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                      placeholderTextColor={
                        theme === "dark" ? "#606060" : "#b1b1b1"
                      }
                      textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                      otherStyles="mt-1 mb-1"
                      keyboardType="numeric"
                      editable={isEditMode}
                    />
                  </View>
                  <View className="w-1/5 pr-2">
                    <FormFieldClear
                      title={t("bill.discount")}
                      value={
                        item.unitDiscount
                          ? Number(item.unitDiscount).toLocaleString()
                          : ""
                      }
                      handleChangeText={(value: string) => {
                        // Remove commas and non-numeric characters except digits
                        const numericValue = value.replace(/[^0-9]/g, "");
                        handleProductItemChange(
                          idx,
                          "unitDiscount",
                          numericValue,
                        );
                      }}
                      placeholder="0"
                      borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                      placeholderTextColor={
                        theme === "dark" ? "#606060" : "#b1b1b1"
                      }
                      textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                      otherStyles="mt-1 mb-1"
                      keyboardType="numeric"
                      editable={isEditMode}
                    />
                  </View>
                  <View className="w-1/6 pr-2">
                    <FormFieldClear
                      title={
                        item.unit
                          ? t(`product.unit.${item.unit}`)
                          : t("bill.amount")
                      }
                      value={item.quantity}
                      handleChangeText={(value: string) =>
                        handleProductItemChange(idx, "quantity", value)
                      }
                      placeholder="1"
                      borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                      placeholderTextColor={
                        theme === "dark" ? "#606060" : "#b1b1b1"
                      }
                      textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                      otherStyles="mt-1 mb-1"
                      keyboardType="numeric"
                      editable={isEditMode}
                    />
                  </View>
                </View>
                {docSettings.showProductDescription && (
                  <View style={{ position: "relative", marginTop: 16, marginBottom: 4, opacity: isEditMode ? 0.9 : 0.7 }}>
                    {item.description ? (
                      <CustomText
                        style={{
                          position: "absolute",
                          top: -10,
                          left: 24,
                          backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
                          paddingHorizontal: 4,
                          zIndex: 2,
                          fontSize: 14,
                          color: theme === "dark" ? "#606060" : "#b1b1b1",
                        }}
                      >
                        {t("bill.enterProductDescription")}
                      </CustomText>
                    ) : null}
                    <View
                      style={{
                        borderWidth: 0.5,
                        borderColor: theme === "dark" ? "#606060" : "#b1b1b1",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: "transparent",
                      }}
                    >
                      <CustomTextInput
                        className="font-psemibold text-lg"
                        value={item.description}
                        onChangeText={(value) =>
                          handleProductItemChange(idx, "description", value)
                        }
                        placeholder={t("bill.enterProductDescription")}
                        placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                        multiline
                        editable={isEditMode}
                        style={{
                          color: theme === "dark" ? "#b4b3b3" : "#2a2a2a",
                          minHeight: 44,
                          textAlignVertical: "top",
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
            {isEditMode && (
              <View className="flex flex-row justify-end mb-2">
                <TouchableOpacity onPress={handleAddProductItem}>
                  <View className="flex flex-row items-center gap-2">
                    <Ionicons name="add-circle" size={28} color="#2ecc71" />
                    <CustomText>{t("bill.addProductItem")}</CustomText>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Payment and Cash Status Section - Only show for Receipt */}
            {selectedDocumentType === "RE" && (
              <View className="flex flex-row justify-between">
                <View className="w-1/2 pr-2">
                  <DropdownClear
                    title={t("bill.paymentMethod")}
                    options={[
                      { label: t("bill.payment.cod"), value: "COD" },
                      { label: t("bill.payment.transfer"), value: "Transfer" },
                      {
                        label: t("bill.payment.creditcard"),
                        value: "CreditCard",
                      },
                      { label: t("bill.payment.cash"), value: "Cash" },
                      {
                        label: t("bill.payment.notspecified"),
                        value: "NotSpecified",
                      },
                    ]}
                    placeholder={t("bill.selectPayment")}
                    selectedValue={
                      payment ? t(`bill.payment.${payment.toLowerCase()}`) : ""
                    }
                    onValueChange={setPayment}
                    otherStyles="mt-2 mb-2"
                    disabled={!isEditMode}
                  />
                </View>
                <View className="w-1/2 pr-2">
                  <DropdownClear
                    title={t("bill.paymentStatus")}
                    options={[
                      { label: t("bill.status.paid"), value: "true" },
                      { label: t("bill.status.unpaid"), value: "false" },
                    ]}
                    placeholder={t("bill.selectStatus")}
                    selectedValue={
                      cashStatus
                        ? t("bill.status.paid")
                        : t("bill.status.unpaid")
                    }
                    onValueChange={() => {}} // Disabled - backend handles cashStatus automatically
                    otherStyles="mt-2 mb-2"
                    disabled={true} // Always disabled - backend handles this automatically
                  />
                </View>
              </View>
            )}

            {/* Payment Terms & Conditions Section - Only show for Quotation */}
            {(selectedDocumentType === "QA" ||
              selectedDocumentType === "IV") && (
              <FormFieldClear
                title={t("bill.paymentTermCondition")}
                value={paymentTermCondition}
                icons={"save"}
                handleChangeText={setPaymentTermCondition}
                handlePress={handleSavePaymentTerms}
                placeholder={t("bill.enterPaymentTermCondition")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                maxLength={500}
                multiline={true}
                numberOfLines={2}
                textAlignVertical="top"
                boxheight={
                  isPaymentTermFocused
                    ? 110
                    : paymentTermCondition
                      ? Math.max(
                          60,
                          Math.min(110, paymentTermCondition.length * 0.8 + 40),
                        )
                      : undefined
                }
                editable={isEditMode}
                onFocus={() => {
                  setIsPaymentTermFocused(true);
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 200);
                }}
                onBlur={() => setIsPaymentTermFocused(false)}
              />
            )}

            {/* Remark Section */}
            <FormFieldClear
              title={t("bill.remark")}
              value={remark}
              icons={"save"}
              handleChangeText={setRemark}
              handlePress={handleSaveRemark}
              placeholder={t("bill.enterRemark")}
              borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              otherStyles={fieldStyles}
              maxLength={1000}
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
              boxheight={
                isRemarkFocused
                  ? 110
                  : remark
                    ? Math.max(60, Math.min(110, remark.length * 0.8 + 40))
                    : undefined
              }
              editable={isEditMode}
              onFocus={() => {
                setIsRemarkFocused(true);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
              onBlur={() => setIsRemarkFocused(false)}
            />

            {/* Bill-Level Discount Section */}
            <View className="mt-2 mb-2" style={{ backgroundColor: "transparent" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <CustomText style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}>
                  {t("bill.billLevelDiscount")}
                </CustomText>
                <View style={{ flexDirection: "row", borderRadius: 6, borderWidth: 1, borderColor: theme === "dark" ? "#606060" : "#b1b1b1", overflow: "hidden" }}>
                  <TouchableOpacity
                    style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: billLevelDiscountIsPercent ? "#04ecc1" : "transparent" }}
                    onPress={() => setBillLevelDiscountIsPercent(true)}
                    activeOpacity={0.8}
                    disabled={!isEditMode}
                  >
                    <CustomText style={{ color: billLevelDiscountIsPercent ? "#fff" : (theme === "dark" ? "#b1b1b1" : "#606060"), fontSize: 13 }}>%</CustomText>
                  </TouchableOpacity>
                  <View style={{ width: 1, backgroundColor: theme === "dark" ? "#606060" : "#b1b1b1" }} />
                  <TouchableOpacity
                    style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: !billLevelDiscountIsPercent ? "#04ecc1" : "transparent" }}
                    onPress={() => setBillLevelDiscountIsPercent(false)}
                    activeOpacity={0.8}
                    disabled={!isEditMode}
                  >
                    <CustomText style={{ color: !billLevelDiscountIsPercent ? "#fff" : (theme === "dark" ? "#b1b1b1" : "#606060"), fontSize: 13 }}>฿</CustomText>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex flex-row justify-between">
                <View className="w-1/2">
                  <FormFieldClear
                    title={billLevelDiscountIsPercent ? t("bill.billLevelDiscountPercent") : t("bill.billLevelDiscount")}
                    value={billLevelDiscountValue}
                    handleChangeText={(value: string) => {
                      const numeric = value.replace(/[^0-9.]/g, "");
                      setBillLevelDiscountValue(numeric);
                    }}
                    placeholder="0"
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles={fieldStyles}
                    keyboardType="numeric"
                    maxLength={12}
                    editable={isEditMode}
                  />
                </View>
                <View
                  className="w-1/2 items-start justify-start"
                  style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 6 }}
                >
                  <CustomText className="text-sm pt-1" style={{ color: theme === "dark" ? "#bbb" : "#666" }}>
                    {t("bill.billLevelDiscountAmount")}:
                  </CustomText>
                  <CustomText className="text-sm ml-2" weight="bold" style={{ color: theme === "dark" ? "#fff" : "#222" }}>
                    {billLevelDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </CustomText>
                </View>
              </View>
            </View>

            {/* Withholding Tax Section */}
            <View
              className="mt-2 mb-2"
              style={{ backgroundColor: "transparent" }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                  opacity: isEditMode ? 1 : 0.6,
                }}
                onPress={() => {
                  if (isEditMode) setWithholdingTax((prev) => !prev);
                }}
                activeOpacity={isEditMode ? 0.8 : 1}
                disabled={!isEditMode}
              >
                <Ionicons
                  name={withholdingTax ? "checkbox" : "square-outline"}
                  size={22}
                  color={theme === "dark" ? "#b1b1b1" : "#606060"}
                />
                <CustomText
                  className="ml-2"
                  style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
                >
                  {t("bill.withHoldingTax")}
                </CustomText>
              </TouchableOpacity>

              {withholdingTax && (
                <>
                  <View className="flex flex-row justify-between">
                    <View className="w-1/2 ">
                      <FormFieldClear
                        title={t("bill.withHoldingTaxPercent")}
                        value={withholdingPercent}
                        handleChangeText={(value: string) => {
                          const numeric = value.replace(/[^0-9.]/g, "");
                          setWithholdingPercent(numeric);
                        }}
                        placeholder={t("bill.enterWithHoldingTax")}
                        borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                        placeholderTextColor={
                          theme === "dark" ? "#606060" : "#b1b1b1"
                        }
                        textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                        otherStyles={fieldStyles}
                        keyboardType="numeric"
                        maxLength={6}
                        editable={isEditMode}
                      />
                    </View>
                    <View
                      className="w-1/2 items-start justify-start"
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        marginTop: 6,
                      }}
                    >
                      <CustomText
                        className="text-sm pt-1"
                        style={{ color: theme === "dark" ? "#bbb" : "#666" }}
                      >
                        {t("bill.withHoldingTaxAmount")}:
                      </CustomText>
                      <CustomText
                        className="text-sm ml-2"
                        weight="bold"
                        style={{ color: theme === "dark" ? "#fff" : "#222" }}
                      >
                        {withholdingTaxAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </CustomText>
                    </View>
                  </View>
                </>
              )}
            </View>

             {/* Project Section */}
            <DropdownClear
              title={t("common.project")}
              placeholder={t("common.enterProject")}
              options={[
                { value: "", label: t("common.none") },
                ...projectSuggestions.map((p) => ({
                  value: String(p.id),
                  label: p.name,
                })),
              ]}
              selectedValue={projectId != null ? String(projectId) : ""}
              onValueChange={(val: string) => {
                if (!isEditMode) return;
                const id = val ? Number(val) : undefined;
                setProjectId(id);
                const matched = projectSuggestions.find((p) => p.id === id);
                setProjectDescription(matched?.description ?? "");
              }}
              onAddNew={async (name: string) => {
                if (!isEditMode) return;
                try {
                  const mId = await getMemberId();
                  if (!mId) return;
                  const newProject = await CallAPIExpense.createProjectAPI(mId, name, projectDescription || undefined);
                  setProjectSuggestions((prev) => [...prev, newProject]);
                  setProjectId(newProject.id);
                  setProjectDescription(newProject.description ?? "");
                } catch (e) {
                  console.error("Failed to create project", e);
                }
              }}
              disabled={!isEditMode}
              otherStyles="mt-1 mb-2"
            />
            <FormFieldClear
              title={t("common.projectDescription")}
              value={projectDescription}
              handleChangeText={setProjectDescription}
              placeholder={t("common.enterProjectDescription")}
              borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              otherStyles={fieldStyles}
              maxLength={500}
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
              disabled={!isEditMode}
              editable={isEditMode}
            />

            {/* Note Section */}
            <FormFieldClear
              title={t("bill.note")}
              value={note}
              handleChangeText={setNote}
              placeholder={t("bill.enterNote")}
              borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              otherStyles={fieldStyles}
              maxLength={500}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              boxheight={
                isNoteFocused
                  ? 110
                  : note
                    ? Math.max(60, Math.min(110, note.length * 0.8 + 40))
                    : undefined
              }
              editable={isEditMode}
              onFocus={() => {
                setIsNoteFocused(true);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
              onBlur={() => setIsNoteFocused(false)}
            />

           

            {/* Price Valid Section */}
            {isEditMode &&
              businessType !== "Rental" &&
              selectedDocumentType !== "RE" && (
                <View
                  className="flex flex-col mt-2 mb-2"
                  style={{ backgroundColor: "transparent", marginBottom: 8 }}
                >
                  <CustomText
                    className="mb-2"
                    style={{
                      color: theme === "dark" ? "#b1b1b1" : "#606060",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    {t("bill.priceValid")}
                  </CustomText>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                    onPress={() => handlePriceValidDaysChange(7)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={
                        priceValidDays === 7 ? "checkbox" : "square-outline"
                      }
                      size={22}
                      color={theme === "dark" ? "#b1b1b1" : "#606060"}
                    />
                    <CustomText
                      className="ml-2"
                      style={{
                        color: theme === "dark" ? "#b1b1b1" : "#606060",
                      }}
                    >
                      7 {t("common.days")}
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                    onPress={() => handlePriceValidDaysChange(15)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={
                        priceValidDays === 15 ? "checkbox" : "square-outline"
                      }
                      size={22}
                      color={theme === "dark" ? "#b1b1b1" : "#606060"}
                    />
                    <CustomText
                      className="ml-2"
                      style={{
                        color: theme === "dark" ? "#b1b1b1" : "#606060",
                      }}
                    >
                      15 {t("common.days")}
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                    onPress={() => handlePriceValidDaysChange(30)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={
                        priceValidDays === 30 ? "checkbox" : "square-outline"
                      }
                      size={22}
                      color={theme === "dark" ? "#b1b1b1" : "#606060"}
                    />
                    <CustomText
                      className="ml-2"
                      style={{
                        color: theme === "dark" ? "#b1b1b1" : "#606060",
                      }}
                    >
                      30 {t("common.days")}
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => handlePriceValidDaysChange(45)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={
                        priceValidDays === 45 ? "checkbox" : "square-outline"
                      }
                      size={22}
                      color={theme === "dark" ? "#b1b1b1" : "#606060"}
                    />
                    <CustomText
                      className="ml-2"
                      style={{
                        color: theme === "dark" ? "#b1b1b1" : "#606060",
                      }}
                    >
                      45 {t("common.days")}
                    </CustomText>
                  </TouchableOpacity>
                  </View>
                </View>
              )}

            {priceValid && selectedDocumentType !== "RE" && (
              <View className="mb-2 pt-2 flex-row item-center justify-center">
                <CustomText
                  className="text-sm"
                  style={{ color: theme === "dark" ? "#888" : "#666" }}
                >
                  {t("bill.validUntil")}
                </CustomText>
                <CustomText
                  className="text-sm"
                  style={{ color: theme === "dark" ? "#888" : "#666" }}
                >
                  {formatDate(priceValid.toISOString())}
                </CustomText>
              </View>
            )}

            {/* Repeat Bill Section - Only show for Rental business type */}
            {businessType === "Rental" && (
              <View
                className="flex flex-row items-center mt-4 mb-2"
                style={{ backgroundColor: "transparent" }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                  // onPress={() => setIsRepeat(!isRepeat)}
                  activeOpacity={1}
                >
                  <MaterialCommunityIcons
                    name="file-document-edit"
                    size={24}
                    color={theme === "dark" ? "#b1b1b1" : "#606060"}
                  />
                </TouchableOpacity>
                {/* show Vilid Contact date calculat from purchaseDate * repeatMonth */}
                <CustomText
                  className="text-base mt-2 pt-1"
                  style={{ color: theme === "dark" ? "#888" : "#666" }}
                >
                  {t("bill.validContractUntil")}{" "}
                  {validContactUntil
                    ? formatDate(validContactUntil).split(" ")[0]
                    : ""}
                </CustomText>
              </View>
            )}

            {error ? (
              <CustomText
                className=" mt-4"
                style={{ color: theme === "dark" ? "#ff6b6b" : "#ff4d4d" }}
              >
                {error}
              </CustomText>
            ) : null}

            <View className="flex-row gap-3 justify-center items-left">
              {!isSplitChild && (
              <TouchableOpacity
                onPress={async () => {
                  setAlertConfig({
                    visible: true,
                    title: t("bill.alerts.deleteTitle"),
                    message: t("bill.alerts.deleteMessage"),
                    buttons: [
                      {
                        text: t("common.delete"),
                        onPress: async () => {
                          try {
                            await CallAPIBill.deleteBillAPI(Number(id));
                            setAlertConfig((prev) => ({
                              ...prev,
                              visible: false,
                            }));
                            router.replace("/income");
                          } catch (error) {
                            console.error("Error deleting bill:", error);
                          }
                        },
                        style: "destructive",
                      },
                      {
                        text: t("common.cancel"),
                        onPress: () =>
                          setAlertConfig((prev) => ({
                            ...prev,
                            visible: false,
                          })),
                        style: "cancel",
                      },
                    ],
                  });
                }}
                style={{
                  marginTop: 20,
                  marginEnd: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={24} color="#9f9d9a" />
              </TouchableOpacity>
              )}

              {isEditMode && (
                <CustomButton
                  title={t("bill.updateButton")}
                  handlePress={handleUpdateBill}
                  containerStyles="mt-5 w-2/3"
                  textStyles="!text-white"
                  isLoading={isUpdatingBill}
                />
              )}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* All Dates Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={allDatesVisible}
        onRequestClose={() => setAllDatesVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            style={{
              padding: 24,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
            }}
          >
            <CustomText style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>
              {t("bill.documentDates", "Document Dates")}
            </CustomText>

            {((): ("QA" | "PU" | "IV" | "RE")[] => {
                if (selectedDocumentType === "QA") return ["PU", "QA"];
                if (selectedDocumentType === "IV") return ["PU", "QA", "IV"];
                return ["PU", "QA", "IV", "RE"];
              })().map((field, index, arr) => {
              const labelMap = { QA: t("bill.quotation", "Quotation"), PU: t("bill.purchase", "Purchase"), IV: t("bill.invoice", "Invoice"), RE: t("bill.receipt", "Receipt") };
              const dateMap: Record<string, Date> = { QA: quotationAt, PU: purchaseAt, IV: invoiceAt, RE: receiptAt };
              return (
                <TouchableOpacity
                  key={field}
                  onPress={() => {
                    if (!isEditMode) return;
                    setEditingDateField(field);
                    setAllDatesVisible(false);
                    setCalendarVisible(true);
                  }}
                  activeOpacity={isEditMode ? 0.7 : 1}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                    borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                    borderBottomColor: theme === "dark" ? "#333" : "#eeeeee",
                    opacity: isEditMode ? 1 : 0.5,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <CustomText style={{ fontWeight: "bold", fontSize: 12, color: "#888888", width: 24 }}>{field}</CustomText>
                    <CustomText style={{ fontSize: 14 }}>{labelMap[field]}</CustomText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#c9c9c9" : "#48453e" }}>
                      {formatDate(dateMap[field].toISOString())}
                    </CustomText>
                    {isEditMode && <Ionicons name="chevron-forward" size={14} color={theme === "dark" ? "#666" : "#aaa"} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Price Valid row */}
            {businessType !== "Rental" && selectedDocumentType !== "RE" && (
              <TouchableOpacity
                onPress={() => {
                  if (!isEditMode) return;
                  setEditingDateField("PV");
                  setAllDatesVisible(false);
                  setCalendarVisible(true);
                }}
                activeOpacity={isEditMode ? 0.7 : 1}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: theme === "dark" ? "#333" : "#eeeeee",
                  opacity: isEditMode ? 1 : 0.5,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <CustomText style={{ fontWeight: "bold", fontSize: 12, color: "#888888", width: 24 }}>PV</CustomText>
                  <CustomText style={{ fontSize: 14 }}>{t("bill.priceValid")}</CustomText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#c9c9c9" : "#48453e" }}>
                    {priceValid ? formatDate(priceValid.toISOString()) : t("common.notSet", "Not set")}
                  </CustomText>
                  {isEditMode && <Ionicons name="chevron-forward" size={14} color={theme === "dark" ? "#666" : "#aaa"} />}
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setAllDatesVisible(false)}
              activeOpacity={0.7}
              style={{ marginTop: 16, paddingVertical: 12, alignItems: "center" }}
            >
              <CustomText style={{ color: "#888888" }}>{t("common.cancel", "Cancel")}</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
