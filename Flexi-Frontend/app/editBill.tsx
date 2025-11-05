import {
  Dimensions,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { View } from "@/components/Themed";
import {CustomButton} from "@/components/CustomButton";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import CallAPIProduct from "@/api/product_api";
import CallAPIBill from "@/api/bill_api";
import CallAPIStore from "@/api/store_api";
import CallAPIBusiness from "@/api/business_api";
import DropdownClear from "@/components/dropdown/DropdownClear";
import { useTheme } from "@/providers/ThemeProvider";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getBusinessId, getMemberId } from "@/utils/utility";
import { isMobile } from "@/utils/responsive";
import FormFieldClear from "@/components/formfield/FormFieldClear";
import { useBusiness } from "@/providers/BusinessProvider";
import { generateInvoiceHTML } from "@/components/PDFTemplates/InvoiceTemplate";
import { generateQuotationHTML } from "@/components/PDFTemplates/QuotationTemplate";
import { generateInvoiceHTML as generateReceiptHTML } from "@/components/PDFTemplates/ReceiptTemplate";
import * as ExpoPrint from "expo-print";

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
  const [storeId, setStoreId] = useState<number>(0);
  const [stores, setStores] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [purchaseAt, setPurchaseAt] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
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
  const [priceValidDays, setPriceValidDays] = useState<7 | 15 | 30 | null>(
    null
  );

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
    "Individual"
  );

  // Document type progression state
  const [selectedDocumentType, setSelectedDocumentType] = useState<
    "QA" | "IV" | "RE"
  >("QA");
  const [showProgressSection, setShowProgressSection] = useState(true);
  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<
    string[]
  >([]);

  // Business details for PDF generation
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [businessName, setBusinessName] = useState<string>("");

  // Get Business context values
  const {
    DocumentType: contextDocumentTypes,
    businessType: contextBusinessType,
  } = useBusiness();

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
    type: "QA" | "IV" | "RE"
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
    type: "Quotation" | "Invoice" | "Receipt" | "Bill"
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
    if (isDocumentTypeAvailable("Quotation")) steps.push("QA");
    if (isDocumentTypeAvailable("Invoice")) steps.push("IV");
    if (isDocumentTypeAvailable("Receipt")) steps.push("RE");
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
            const businessData = await CallAPIBusiness.getBusinessDetailsAPI(
              memberId
            );
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
        setStoreId(billData.storeId);
        setImage(billData.image);
        setCTaxId(billData.cTaxId);
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
        if (billData.DocumentType) {
          const billDocType = getDocumentTypeFromAPI(billData.DocumentType);
          // Check if the bill's document type is available in the business settings
          const billDocTypeName = getDocumentTypeForAPI(billDocType);
          if (
            businessDocTypes.length === 0 ||
            businessDocTypes.includes(billDocTypeName)
          ) {
            setSelectedDocumentType(billDocType);
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
        // Set taxType based on fields
        if (billData.cTaxId && billData.cTaxId.length > 0) {
          setTaxType("Juristic");
        } else {
          setTaxType("Individual");
        }
        // Set productItems from billData.product (array of items)
        if (
          billData.product &&
          Array.isArray(billData.product) &&
          billData.product.length > 0
        ) {
          setProductItems(
            billData.product.map((item: any) => ({
              product: item.product,
              price: item.unitPrice.toString(),
              quantity: item.quantity.toString(),
              unit: item.unit || "",
              unitDiscount: item.unitDiscount
                ? item.unitDiscount.toString()
                : "",
            }))
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
          }
        }
        // Set purchase date
        if (billData.purchaseAt) {
          setPurchaseAt(new Date(billData.purchaseAt));
          setSelectedDates([new Date(billData.purchaseAt).toISOString()]);
          setDate([new Date(billData.purchaseAt).toISOString()]);
        }
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

      // Fetch stores for this member
      if (uniqueId) {
        try {
          const storesData = await CallAPIStore.getStoresAPI(uniqueId);
          setStores(storesData);
        } catch (error) {
          console.error("Failed to fetch stores:", error);
        }
      }
    };

    fetchMemberId();

    // Call Api Product list with price
    const fetchProductChoice = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIProduct.getProductChoiceWithPriceAPI(
            memberId
          );
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
    value: string
  ) => {
    setProductItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // If product is changed, auto-fill price and unit
      if (field === "product") {
        const selectedProduct = productChoice.find(
          (p: any) => p.name === value
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
        if (value === "Tiktok Affiliate") {
          setCName("ติ๊กต๊อก (ไทยแลนด์) จำกัด");
          setCLastName("");
          setCPhone("0000000000");
          setCTaxId("0105562003561");
          setCGender("NotSpecified");
          setCAddress(
            "เลขที่ 289/3 ซอยลาดพร้าว 80 แยก 22 แขวงวังทองหลาง เขตวังทองหลาง"
          );
          setCProvince("กรุงเทพมหานคร");
          setCPostId("10310");
          setPayment("Transfer");
          setCashStatus(true);
          setStoreId(0); // Set to 0 for Tiktok Affiliate
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

  const handlePriceValidDaysChange = (days: 7 | 15 | 30) => {
    setPriceValidDays(days);
    const validDate = new Date(purchaseAt);
    validDate.setDate(validDate.getDate() + days);
    setPriceValid(validDate);
  };

  const handleUpdateBill = async () => {
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
    if (!storeId) missingFields.push(t("bill.store"));
    // Validate product items
    if (
      productItems.some(
        (item) => !item.product || !item.price || !item.quantity
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
      // Call API to update bill
      const data = await CallAPIBill.updateBillAPI({
        id: Number(id),
        purchaseAt,
        cName,
        cLastName,
        cPhone,
        cGender: cGender as "Female" | "Male" | "NotSpecified",
        cAddress,
        cPostId,
        cProvince,
        cTaxId: cTaxId,
        payment: payment as "COD" | "Transfer" | "CreditCard" | "Cash"| "NotSpecified",
        memberId: memberId || "",
        businessAcc,
        storeId,
        image,
        DocumentType: [getDocumentTypeForAPI(selectedDocumentType)],
        note: note,
        paymentTermCondition:
          selectedDocumentType === "QA" && paymentTermCondition
            ? paymentTermCondition
            : undefined,
        remark: remark || undefined,
        productItems: productItems.map((item) => ({
          product: item.product,
          unit: item.unit,
          unitPrice: Number(item.price),
          quantity: Number(item.quantity),
          unitDiscount: Number(item.unitDiscount) || 0,
        })),
        priceValid: priceValid || undefined,
        repeat: false, // Set to false for single bill update
        repeatMonths: 1, // Set to 1 for single bill update
      });
      if (data.error) throw new Error(data.error);
      setAlertConfig({
        visible: true,
        title: t("bill.alerts.success"),
        message: data.message || t("bill.alerts.successMessage"),
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
    }
  };

  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    setDate(dates); // Store the dates as an array

    // Update purchaseAt with the selected date when a date is chosen
    if (dates && dates.length > 0) {
      setPurchaseAt(new Date(dates[0]));
    }

    setCalendarVisible(false);
  }; // force to chose only one date

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
      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          activeOpacity={1}
          onPress={() => setCalendarVisible(false)}
        >
          <View
            style={{
              width: isMobile() ? "90%" : "40%",
              minWidth: 300,
              maxWidth: 500,
              backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <MultiDateCalendar onDatesChange={handleDatesChange} />
          </View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        //  keyboardVerticalOffset={5}
      >
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled">
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
                            console.log(
                              "🎯 Circle pressed:",
                              step,
                              "isEditMode:",
                              isEditMode
                            );
                            if (!isEditMode) {
                              // View document functionality when not in edit mode
                              // Only allow viewing if the step is completed (active)
                              if (!isStepCompleted(step)) {
                                console.log(
                                  "⛔ Cannot view inactive document type:",
                                  step
                                );
                                return;
                              }
                              console.log(
                                "📋 Viewing document for step:",
                                step
                              );
                              switch (step) {
                                case "QA":
                                  console.log(
                                    "🔄 Calling viewQuotationDocument"
                                  );
                                  viewQuotationDocument();
                                  break;
                                case "IV":
                                  console.log("🔄 Calling viewInvoiceDocument");
                                  viewInvoiceDocument();
                                  break;
                                case "RE":
                                  console.log("🔄 Calling viewReceiptDocument");
                                  viewReceiptDocument();
                                  break;
                              }
                            } else {
                              // Edit mode: allow changing document type
                              console.log("✏️ Setting document type:", step);
                              setSelectedDocumentType(step);
                            }
                          }}
                          activeOpacity={
                            isStepCompleted(step) || isEditMode ? 0.7 : 1
                          }
                        >
                          <View
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 25,
                              backgroundColor: isStepCompleted(step)
                                ? "#04ecc1"
                                : "transparent",
                              borderWidth: 3,
                              borderColor: isStepCompleted(step)
                                ? "#04ecc1"
                                : theme === "dark"
                                ? "#666"
                                : "#ccc",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: getStepOpacity(step),
                              shadowColor: isStepCompleted(step)
                                ? "#04ecc1"
                                : "transparent",
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
                                  ? theme === "dark"
                                    ? "#18181b"
                                    : "#ffffff"
                                  : getStepIconColor(step)
                              }
                            />
                          </View>
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
                                      (s) => s === selectedDocumentType
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
            className="flex-1 justify-center h-full px-4 mt-5 mb-20 pb-20"
            style={{
              maxWidth: Platform.OS === "web" ? 600 : "100%",
              alignSelf: Platform.OS === "web" ? "center" : "auto",
            }}
          >
            <View className="flex flex-row justify-between items-center">
              <View className="w-1/2 pr-2">
                {stores.length > 0 ? (
                  <DropdownClear
                    title={t("bill.store")}
                    options={stores.map((store) => ({
                      label: store.accName,
                      value: store.id.toString(),
                    }))}
                    placeholder={t("bill.selectStore")}
                    placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    selectedValue={
                      stores.find((store) => store.id === storeId)?.accName ||
                      ""
                    }
                    onValueChange={(value: any) => {
                      if (isEditMode) setStoreId(Number(value));
                    }}
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles="mt-2 mb-2"
                    disabled={!isEditMode}
                  />
                ) : null}
              </View>
              <View className="w-1/2 pr-2">
                {/* Date selector */}
                <View className="flex-row items-center justify-center bg-transparent mt-8 rounded-full p-2 ml-2">
                  <CustomText
                    className={`text-base mx-2 ${
                      theme === "dark" ? "text-[#c9c9c9]" : "text-[#48453e]"
                    }`}
                  >
                    {selectedDates.length > 0
                      ? formatDate(selectedDates[0])
                      : t("dashboard.selectDate")}
                  </CustomText>
                  {/* icon Calendar */}
                  <Ionicons
                    name="calendar"
                    size={24}
                    color={theme === "dark" ? "#ffffff" : "#444541"}
                    onPress={() =>
                      isEditMode ? setCalendarVisible(true) : null
                    }
                    style={{ opacity: isEditMode ? 1 : 0.5 }}
                  />
                </View>
              </View>
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
                <FormFieldClear
                  title={t("bill.customerProvince")}
                  value={cProvince}
                  handleChangeText={setCProvince}
                  placeholder={t("bill.enterProvince")}
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
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  )}
                  <DropdownClear
                    title={t(`bill.productName`) + ` ${idx + 1}`}
                    options={productChoice.map((product) => ({
                      label: product.name,
                      value: product.name,
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
                        numericValue
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
                      t("bill.amount") +
                      (item.unit && t(`product.unit.${item.unit}`)
                        ? ` (${t(`product.unit.${item.unit}`)})`
                        : "")
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
                        Math.min(110, paymentTermCondition.length * 0.8 + 40)
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
            {isEditMode && selectedDocumentType !== "RE" && (
              <View
                className="flex flex-row items-center mt-2 mb-2"
                style={{ backgroundColor: "transparent", marginBottom: 8 }}
              >
                <CustomText
                  className="mr-4"
                  style={{
                    color: theme === "dark" ? "#b1b1b1" : "#606060",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  {t("bill.priceValid")}
                </CustomText>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 20,
                  }}
                  onPress={() => handlePriceValidDaysChange(7)}
                >
                  <Ionicons
                    name={priceValidDays === 7 ? "checkbox" : "square-outline"}
                    size={22}
                    color={theme === "dark" ? "#b1b1b1" : "#606060"}
                  />
                  <CustomText
                    className="ml-2"
                    style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
                  >
                    7 days
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 20,
                  }}
                  onPress={() => handlePriceValidDaysChange(15)}
                >
                  <Ionicons
                    name={priceValidDays === 15 ? "checkbox" : "square-outline"}
                    size={22}
                    color={theme === "dark" ? "#b1b1b1" : "#606060"}
                  />
                  <CustomText
                    className="ml-2"
                    style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
                  >
                    15 days
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => handlePriceValidDaysChange(30)}
                >
                  <Ionicons
                    name={priceValidDays === 30 ? "checkbox" : "square-outline"}
                    size={22}
                    color={theme === "dark" ? "#b1b1b1" : "#606060"}
                  />
                  <CustomText
                    className="ml-2"
                    style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
                  >
                    30 days
                  </CustomText>
                </TouchableOpacity>
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

            {error ? (
              <CustomText className="text-red-500 mt-4">{error}</CustomText>
            ) : null}

            <View className="flex-row gap-3 justify-center items-left">
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
                            router.replace("/");
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

              {isEditMode && (
                <CustomButton
                  title={t("bill.updateButton")}
                  handlePress={handleUpdateBill}
                  containerStyles="mt-5 w-2/3"
                  textStyles="!text-white"
                />
              )}
            </View>

            {/* Edit mode toggle button */}
            <View
              style={{
                position: "absolute",
                top: -10,
                right: 2,
                zIndex: 1000,
              }}
            >
              <TouchableOpacity
                onPress={() => setIsEditMode((prev) => !prev)}
                activeOpacity={1}
                style={{
                  backgroundColor: isEditMode ? "#ff8c00" : "#04ecc1",
                  borderRadius: 20,
                  marginRight: 20,
                  marginBottom: 10,
                  padding: 10,
                  paddingHorizontal: 15,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <Ionicons
                  name={isEditMode ? "lock-closed" : "pencil-sharp"}
                  size={16}
                  color="#404040"
                  style={{ marginRight: 5 }}
                />
              </TouchableOpacity>
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
