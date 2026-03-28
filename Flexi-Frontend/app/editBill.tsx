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
import { useTheme } from "@/providers/ThemeProvider";
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
  const { id } = useLocalSearchParams();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [platformOptions, setPlatformOptions] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [error, setError] = useState("");
  const [purchaseAt, setPurchaseAt] = useState(new Date());
  const [quotationAt, setQuotationAt] = useState(new Date());
  const [invoiceAt, setInvoiceAt] = useState(new Date());
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
  const [cTaxId, setCTaxId] = useState("");
  const [priceValid, setPriceValid] = useState<Date | null>(null);
  const [priceValidDays, setPriceValidDays] = useState<7 | 15 | 30 | 45 | null>(
    null,
  );
  const [validContactUntil, setValidContactUntil] = useState("");

  // Note state
  const [note, setNote] = useState("");
  const [paymentTermCondition, setPaymentTermCondition] = useState("");
  const [remark, setRemark] = useState("");

  // Payment information
  const [payment, setPayment] = useState("");
  const [cashStatus, setCashStatus] = useState(false);
  const [businessAcc, setBusinessAcc] = useState(0);
  const [image, setImage] = useState("");

  // --- Product Items State ---
  const [productItems, setProductItems] = useState([
    { product: "", price: "", quantity: "1", unit: "", unitDiscount: "" },
  ]);
  const { vat } = useBusiness();
  const [withholdingTax, setWithholdingTax] = useState(false);
  const [withholdingPercent, setWithholdingPercent] = useState("");

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
    let taxableBase = subtotal - unitDisc;
    if (vat) {
      taxableBase = subTotalWitoutVat - unitDisc;
    }

    const pct = Number(withholdingPercent) || 0;
    const raw = taxableBase * (pct / 100);
    // keep two decimal places
    const amt = Number(raw.toFixed(2));
    return amt;
  }, [withholdingTax, withholdingPercent, productItems]);

  const [calendarVisible, setCalendarVisible] = useState(false);
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
  const [showSplitSection, setShowSplitSection] = useState(false);
  // splitRows = user-editable rows; last row is always auto = remainder
  const [splitRows, setSplitRows] = useState<{ splitPercent: string }[]>([]);
  const [splitSubmitting, setSplitSubmitting] = useState(false);
  // Base total used to calculate each split row's amount
  const [splitBaseTotal, setSplitBaseTotal] = useState(0);

  const splitUserTotal = splitRows.reduce((s, r) => s + (parseFloat(r.splitPercent) || 0), 0);
  const splitRemainder = Math.max(0, 100 - splitUserTotal);
  // All rows for display: user rows + auto remainder row
  const splitAllRows = [...splitRows, { splitPercent: String(splitRemainder), auto: true }] as { splitPercent: string; auto?: boolean }[];
  const splitIsValid = splitRows.length > 0 && splitRows.every((r) => parseFloat(r.splitPercent) > 0) && splitUserTotal < 100;

  const handleSplitSubmit = async () => {
    if (!splitIsValid || !id) return;
    setSplitSubmitting(true);
    try {
      const allRows = splitAllRows.map((r, i) => ({
        splitPercent: parseFloat(r.splitPercent),
        splitPercentMax: 100 - splitAllRows.slice(0, i).reduce((s, row) => s + (parseFloat(row.splitPercent) || 0), 0),
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
              setSplitRows([{ splitPercent: "" }]);
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
        setPayment(billData.payment);
        setCashStatus(billData.cashStatus);
        setSelectedPlatform(billData.platform ?? "");
        setImage(billData.image);
        setCTaxId(billData.cTaxId);
        setValidContactUntil(billData.validContactUntil || "");
        setFlexiId(billData.flexiId || null);
        setIsSplitChild(billData.isSplitChild === true);
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
          const now = new Date(billData.purchaseAt || Date.now());
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
        setPurchaseAt(loadedPurchaseAt);
        setQuotationAt(loadedQuotationAt);
        setInvoiceAt(loadedInvoiceAt);
        // Show date for the current DocumentType
        const docTypeLoaded = billData.DocumentType;
        const activeDate =
          docTypeLoaded === "Invoice" ? loadedInvoiceAt
          : docTypeLoaded === "Quotation" ? loadedQuotationAt
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
      { product: "", price: "", quantity: "1", unit: "", unitDiscount: "" },
    ]);
  };

  const handleRemoveProductItem = (index: number) => {
    setProductItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePriceValidDaysChange = (days: 7 | 15 | 30 | 45) => {
    setPriceValidDays(days);
    const validDate = new Date(purchaseAt);
    validDate.setDate(validDate.getDate() + days);
    setPriceValid(validDate);
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
        quotationAt: selectedDocumentType === "QA" ? purchaseAt : undefined,
        invoiceAt: selectedDocumentType === "IV" ? purchaseAt : undefined,
        cName,
        cLastName,
        cPhone,
        cGender: cGender as "Female" | "Male" | "NotSpecified",
        cAddress,
        cPostId,
        cProvince,
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
        })),
        withholdingTax: withholdingTax,
        withholdingPercent: withholdingTax
          ? Number(withholdingPercent)
          : undefined,
        WHTAmount: withholdingTax ? withholdingTaxAmount : undefined,
        priceValid: priceValid || undefined,
        repeat: false, // Set to false for single bill update
        repeatMonths: 1, // Set to 1 for single bill update
        taxType: taxType,
      });
      if (data.error) throw new Error(data.error);
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
    if (selectedDocumentType === "QA") setQuotationAt(next);
    else if (selectedDocumentType === "IV") setInvoiceAt(next);
    else setPurchaseAt(next);
    setSelectedDates([formatted]);
    setDate([formatted]);
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
          selectedDocumentType === "QA" ? quotationAt
          : selectedDocumentType === "IV" ? invoiceAt
          : purchaseAt
        }
        onChange={handleDateTimeChange}
        onClose={() => setCalendarVisible(false)}
        maxDate={new Date()}
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
              <TouchableOpacity
                onPress={() => isEditMode ? setCalendarVisible(true) : null}
                activeOpacity={isEditMode ? 0.7 : 1}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, opacity: isEditMode ? 1 : 0.6 }}
              >
                <Ionicons name="calendar-outline" size={16} color={theme === "dark" ? "#c9c9c9" : "#48453e"} />
                <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#c9c9c9" : "#48453e" }}>
                  {selectedDates.length > 0 ? formatDate(selectedDates[0]) : t("dashboard.selectDate")}
                </CustomText>
              </TouchableOpacity>

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
                      const pct = parseFloat(row.splitPercent) || 0;
                      const rowAmount = splitBaseTotal > 0 ? (splitBaseTotal * pct) / 100 : null;
                      return (
                        <View
                          key={index}
                          style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}
                        >
                          <CustomText style={{ color: theme === "dark" ? "#666" : "#999", fontSize: 12, width: 22 }}>
                            {index + 1}.
                          </CustomText>
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
                                width: 48,
                                color: isAuto
                                  ? "#04ecc1"
                                  : theme === "dark" ? "#b1b1b1" : "#606060",
                                fontSize: 15,
                                paddingVertical: 8,
                              }}
                              value={row.splitPercent}
                              editable={!isAuto}
                              onChangeText={(v) =>
                                setSplitRows((prev) =>
                                  prev.map((r, i) => i === index ? { ...r, splitPercent: v } : r),
                                )
                              }
                              keyboardType="decimal-pad"
                              placeholder="0"
                              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                            />
                            <CustomText style={{ color: isAuto ? "#04ecc1" : theme === "dark" ? "#606060" : "#b1b1b1", fontSize: 12, marginRight: 8 }}>
                              {isAuto ? "% (auto)" : "%"}
                            </CustomText>
                            {rowAmount !== null && pct > 0 && (
                              <>
                                <CustomText style={{ color: theme === "dark" ? "#444" : "#ccc", fontSize: 12, marginRight: 8 }}>|</CustomText>
                                <CustomText style={{ flex: 1, color: isAuto ? "#04ecc1" : theme === "dark" ? "#b1b1b1" : "#606060", fontSize: 13 }} numberOfLines={1}>
                                  {rowAmount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        onPress={() => setSplitRows((prev) => [...prev, { splitPercent: "" }])}
                        disabled={splitRemainder <= 0}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: splitRemainder > 0
                            ? "#04ecc160"
                            : theme === "dark" ? "#3a3a3a" : "#e0e0e0",
                          borderRadius: 8,
                          borderStyle: "dashed",
                          paddingVertical: 8,
                          gap: 4,
                          opacity: splitRemainder > 0 ? 1 : 0.4,
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
                  placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  selectedValue={selectedPlatform}
                  onValueChange={(value: any) => {
                    if (isEditMode) setSelectedPlatform(value);
                  }}
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
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
                style={{ flexDirection: "row", alignItems: "center" }}
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
                    placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    selectedValue={
                      cGender ? t(`bill.gender.${cGender.toLowerCase()}`) : ""
                    }
                    onValueChange={setCGender}
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
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
                    label: t(`provinces.${key}`),
                    value: t(`provinces.${key}`),
                  }))}
                  selectedValue={cProvince}
                  onValueChange={setCProvince}
                  placeholder={t("bill.selectProvince")}
                  placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  otherStyles="mt-2 mb-2"
                  disabled={!isEditMode}
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

            {/* --- Product Items UI --- */}
            {productItems.map((item, idx) => (
              <View
                key={idx}
                className="flex flex-row items-center mb-1 relative"
              >
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
                    placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    selectedValue={item.product}
                    onValueChange={(value: string) =>
                      handleProductItemChange(idx, "product", value)
                    }
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
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
                    placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    selectedValue={
                      payment ? t(`bill.payment.${payment.toLowerCase()}`) : ""
                    }
                    onValueChange={setPayment}
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
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
                    placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    selectedValue={
                      cashStatus
                        ? t("bill.status.paid")
                        : t("bill.status.unpaid")
                    }
                    onValueChange={() => {}} // Disabled - backend handles cashStatus automatically
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
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
                handleChangeText={setPaymentTermCondition}
                placeholder={t("bill.enterPaymentTermCondition")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                maxLength={300}
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
              handleChangeText={setRemark}
              placeholder={t("bill.enterRemark")}
              borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              otherStyles={fieldStyles}
              maxLength={300}
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
                }}
                onPress={() => setWithholdingTax((prev) => !prev)}
                activeOpacity={0.8}
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
