import {
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import DropdownFloat from "@/components/dropdown/DropdownFloat";
import { View } from "@/components/Themed";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import { SecondaryButton, GrayButton } from "@/components/CustomButton";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { FloatingLabelInput } from "@/components/formfield/FloatingLabelInput";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIExpense from "@/api/expense_api";
import CallAPIBill from "@/api/bill_api";
import CallAPIBusiness from "@/api/business_api";
import { generateInvoiceHTML } from "@/components/PDFTemplates/InvoiceTemplate";
import { generateInvoiceHTML as generateReceiptHTML } from "@/components/PDFTemplates/ReceiptTemplate";
import { getMemberId } from "@/utils/utility";
import i18n from "@/i18n";
import { useBusiness } from "@/providers/BusinessProvider";
import { getWHTPercentage } from "@/components/TaxVariable";
import {
  formatNumber,
  reverseCalculateFromFinal,
  DEFAULT_VAT_PERCENT,
} from "@/utils/taxUtils";
import DateTimePicker from "@/components/DateTimePicker";
import { format } from "date-fns";
import { isMobile, isTablet } from "@/utils/responsive";
import { API_URL, IMAGE_URL } from "@/utils/config";

const formatCurrencyForPDF = (amount: number) =>
  amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Format date in DD/MM/YYYY HH:MM (24-hour) using the original UTC time
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "";

  // Convert to UTC so we display the exact time from the API (avoid local TZ shift)
  const utcDate = new Date(
    parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60000
  );

  return format(utcDate, "dd/MM/yyyy HH:mm");
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
    pdf?: string;
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
    DocumentType?: string;
    debtAmount?: number;
    dueDate?: string;
    invoiceImage?: string;
    invoicePdf?: string;
    flexiId?: string;
  };
}

type AttachmentPreviewType = "image" | "pdf";

interface AttachmentFile {
  uri: string;
  name: string;
  type: string;
  preview: AttachmentPreviewType;
}

const extractFileName = (uri?: string) => {
  if (!uri) return "";
  try {
    const decoded = decodeURIComponent(uri);
    const segments = decoded.split("/");
    return segments[segments.length - 1] || uri;
  } catch {
    const fallbackSegments = uri.split("/");
    return fallbackSegments[fallbackSegments.length - 1] || uri;
  }
};

const stripTrailingSlash = (value?: string) => (value || "").replace(/\/+$/, "");
const stripLeadingSlash = (value?: string) => (value || "").replace(/^\/+/, "");
const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value);
const isDeviceLocalUri = (value: string) => /^(file|content|blob):/i.test(value);

const normalizeAttachmentUri = (
  rawUri: string | undefined,
  type: AttachmentPreviewType
) => {
  if (!rawUri) return "";
  const trimmed = rawUri.trim();
  if (!trimmed) return "";

  if (isDeviceLocalUri(trimmed)) return trimmed;

  if (isAbsoluteHttpUrl(trimmed)) {
    const canUpgradeToHttps =
      Platform.OS === "android" &&
      !__DEV__ &&
      trimmed.startsWith("http://") &&
      !/http:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.)/i.test(trimmed);

    const normalized = canUpgradeToHttps
      ? trimmed.replace(/^http:\/\//i, "https://")
      : trimmed;

    return encodeURI(normalized);
  }

  const normalizedPath = stripLeadingSlash(trimmed);
  if (normalizedPath.startsWith("uploads/")) {
    return `${stripTrailingSlash(API_URL)}/${encodeURI(normalizedPath)}`;
  }

  if (trimmed.startsWith("/")) {
    return `${stripTrailingSlash(API_URL)}${encodeURI(trimmed)}`;
  }

  if (type === "image") {
    return `${stripTrailingSlash(IMAGE_URL)}/${encodeURI(normalizedPath)}`;
  }

  return `${stripTrailingSlash(API_URL)}/uploads/pdf/${encodeURI(normalizedPath)}`;
};

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
  const initialIsDebt = expense.DocumentType === "Invoice";
  const [isDebt, setIsDebt] = useState(initialIsDebt);
  const [amount, setAmount] = useState(
    initialIsDebt ? String(expense.debtAmount ?? expense.amount) : expense.amount
  );
  const [image, setImage] = useState(expense.image);
  const [pdfUrl, setPdfUrl] = useState(expense.pdf || "");
  const [invoiceImage, setInvoiceImage] = useState(expense.invoiceImage || "");
  const [invoicePdfUrl, setInvoicePdfUrl] = useState(expense.invoicePdf || "");
  const [group, setGroup] = useState(expense.group);
  const [error, setError] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const isClosingRef = useRef(false);
  const savedRef = useRef({
    date: expense.date,
    note: expense.note,
    desc: expense.desc,
    amount: initialIsDebt ? String(expense.debtAmount ?? expense.amount) : expense.amount,
    image: expense.image,
    pdf: expense.pdf || "",
    group: expense.group,
    vat: expense.vat,
    withHoldingTax: expense.withHoldingTax || false,
    WHTpercent: expense.WHTpercent || 0,
    sTaxId: expense.sTaxId || "",
    sName: expense.sName || "",
    taxInvoiceNo: expense.taxInvoiceNo || "",
    sAddress: expense.sAddress || "",
    taxType: (expense.taxType as "Individual" | "Juristic") || "Individual",
    branch: expense.branch || "",
    isDebt: initialIsDebt,
  });
  // Use the visible prop directly instead of mirroring to local state
  const { vat, DocumentType } = useBusiness();
  const [vatIncluded, setVatIncluded] = useState(expense.vat);
  const [withHoldingTax, setWithHoldingTax] = useState(
    expense.withHoldingTax || false
  );
  const [WHTpercent, setWHTpercent] = useState(expense.WHTpercent || 0);
  const [taxType, setTaxType] = useState<"Individual" | "Juristic">(
    (expense.taxType as "Individual" | "Juristic") || "Individual"
  );
  const [branch, setBranch] = useState<string>(expense.branch || "");
  const [sTaxId, setSTaxId] = useState(expense.sTaxId || "");
  const [sName, setSName] = useState(expense.sName || "");
  const [taxInvoiceNo, setTaxInvoiceNo] = useState(expense.taxInvoiceNo || "");
  const [sAddress, setSAddress] = useState(expense.sAddress || "");
  const [isDownloadingWHT, setIsDownloadingWHT] = useState(false);
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [attachmentPickerVisible, setAttachmentPickerVisible] = useState(false);
  const [flexiId, setFlexiId] = useState<string | null>(expense.flexiId || null);
  const [flexiBillDocumentType, setFlexiBillDocumentType] = useState<string | null>(null);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [isFlexiDocument, setIsFlexiDocument] = useState(
    !!(expense.flexiId && expense.sName && !expense.image && !expense.pdf && !expense.invoiceImage && !expense.invoicePdf)
  );
  const hasAttachment = Boolean(attachment) || isFlexiDocument || (isDebt
    ? Boolean(invoiceImage) || Boolean(invoicePdfUrl)
    : Boolean(image) || Boolean(pdfUrl));
  const isImageAttachment = attachment?.preview === "image";
  const isPdfAttachment = attachment?.preview === "pdf";
  const [showAllFormField, setShowAllFormField] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(
    expense.dueDate ? new Date(expense.dueDate) : null
  );
  const [dueDatePickerVisible, setDueDatePickerVisible] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        console.log("Fetching expense with ID:", expense.id);
        const fetchedExpense = await CallAPIExpense.getExpenseByIdAPI(
          expense.id
        );
        console.log("Fetched expense:", fetchedExpense);
        const fetchedIsDebt = fetchedExpense.DocumentType === "Invoice";
        const fetchedDisplayAmount = fetchedIsDebt
          ? String(fetchedExpense.debtAmount ?? fetchedExpense.amount)
          : fetchedExpense.amount;
        setDate(fetchedExpense.date);
        setNote(fetchedExpense.note);
        setDesc(fetchedExpense.desc);
        setIsDebt(fetchedIsDebt);
        setAmount(fetchedDisplayAmount);
        setImage(fetchedExpense.image);
        setPdfUrl(fetchedExpense.pdf || "");
        setInvoiceImage(fetchedExpense.invoiceImage || "");
        setInvoicePdfUrl(fetchedExpense.invoicePdf || "");
        setIsFlexiDocument(
          !!(fetchedExpense.flexiId && fetchedExpense.sName && !fetchedExpense.image && !fetchedExpense.pdf && !fetchedExpense.invoiceImage && !fetchedExpense.invoicePdf)
        );
        setGroup(fetchedExpense.group);
        setVatIncluded(fetchedExpense.vat);
        setWithHoldingTax(fetchedExpense.withHoldingTax || false);
        setWHTpercent(fetchedExpense.WHTpercent || 0);
        setSTaxId(fetchedExpense.sTaxId || "");
        setSName(fetchedExpense.sName || "");
        setTaxInvoiceNo(fetchedExpense.taxInvoiceNo || "");
        setSAddress(fetchedExpense.sAddress || "");
        setTaxType(fetchedExpense.taxType || "Individual");
        setBranch(fetchedExpense.branch || "");
        setDueDate(fetchedExpense.dueDate ? new Date(fetchedExpense.dueDate) : null);
        const resolvedFlexiId = fetchedExpense.flexiId || null;
        setFlexiId(resolvedFlexiId);
        const resolvedIsFlexiDocument = !!(fetchedExpense.flexiId && fetchedExpense.sName && !fetchedExpense.image && !fetchedExpense.pdf && !fetchedExpense.invoiceImage && !fetchedExpense.invoicePdf);
        let resolvedIsDebt = fetchedIsDebt;
        if (resolvedFlexiId && resolvedIsFlexiDocument) {
          try {
            const billData = await CallAPIBill.getBillByFlexiIdAPI(resolvedFlexiId);
            const billDocType = billData?.DocumentType || null;
            setFlexiBillDocumentType(billDocType);
            resolvedIsDebt = billDocType === "Invoice";
            setIsDebt(resolvedIsDebt);
          } catch {
            setFlexiBillDocumentType(null);
          }
        }
        savedRef.current = {
          date: fetchedExpense.date,
          note: fetchedExpense.note,
          desc: fetchedExpense.desc,
          amount: fetchedDisplayAmount,
          image: fetchedExpense.image,
          pdf: fetchedExpense.pdf || "",
          group: fetchedExpense.group,
          vat: fetchedExpense.vat,
          withHoldingTax: fetchedExpense.withHoldingTax || false,
          WHTpercent: fetchedExpense.WHTpercent || 0,
          sTaxId: fetchedExpense.sTaxId || "",
          sName: fetchedExpense.sName || "",
          taxInvoiceNo: fetchedExpense.taxInvoiceNo || "",
          sAddress: fetchedExpense.sAddress || "",
          taxType: (fetchedExpense.taxType as "Individual" | "Juristic") || "Individual",
          branch: fetchedExpense.branch || "",
          isDebt: resolvedIsDebt,
        };
      } catch (error) {
        console.error("Error fetching expense:", error);
      }
    };

    const fetchBusinessDetails = async () => {
      try {
        const memberId = String(await getMemberId());
        const data = await CallAPIBusiness.getBusinessDetailsAPI(memberId);
        setBusinessDetails(data);
        setBusinessName(data?.businessName || "");
      } catch (error) {
        console.error("Error fetching business details:", error);
      }
    };

    fetchExpense();
    fetchBusinessDetails();
  }, [expense.id]);

  // Poll bill DocumentType when this is a FlexiDocument — auto-flip isDebt and persist when seller marks it as Receipt
  useEffect(() => {
    if (!isFlexiDocument || !flexiId) return;
    const poll = setInterval(async () => {
      try {
        const billData = await CallAPIBill.getBillByFlexiIdAPI(flexiId);
        const billDocType = billData?.DocumentType || null;
        setFlexiBillDocumentType((prev) => {
          if (prev !== billDocType) {
            const newIsDebt = billDocType === "Invoice";
            setIsDebt(newIsDebt);
            // Persist DocumentType change to the expense record
            const memberId = getMemberId();
            Promise.resolve(memberId).then((mid) => {
              const formData = new FormData();
              formData.append("memberId", String(mid));
              formData.append("DocumentType", billDocType === "Invoice" ? "Invoice" : "Receipt");
              formData.append("debtAmount", newIsDebt ? String(amount) : "0");
              CallAPIExpense.updateExpenseAPI(expense.id, formData).catch((e) =>
                console.error("Failed to sync expense DocumentType from bill:", e)
              );
            });
          }
          return billDocType;
        });
      } catch {
        // Bill may return 404 if already used — ignore silently
      }
    }, 30000);
    return () => clearInterval(poll);
  }, [isFlexiDocument, flexiId]);

  // Track changes to expense data
  useEffect(() => {
    const checkChanges = () => {
      const s = savedRef.current;
      if (
        date !== s.date ||
        note !== s.note ||
        desc !== s.desc ||
        amount !== s.amount ||
        group !== s.group ||
        image !== s.image ||
        pdfUrl !== s.pdf ||
        vatIncluded !== s.vat ||
        withHoldingTax !== s.withHoldingTax ||
        WHTpercent !== s.WHTpercent ||
        sTaxId !== s.sTaxId ||
        sName !== s.sName ||
        taxInvoiceNo !== s.taxInvoiceNo ||
        branch !== s.branch ||
        taxType !== s.taxType ||
        sAddress !== s.sAddress ||
        isDebt !== s.isDebt ||
        Boolean(attachment)
      ) {
        setHasChanges(true);
      } else {
        setHasChanges(false);
      }
    };

    checkChanges();
  }, [
    date,
    note,
    desc,
    amount,
    group,
    image,
    pdfUrl,
    vatIncluded,
    withHoldingTax,
    WHTpercent,
    sTaxId,
    sName,
    taxInvoiceNo,
    sAddress,
    taxType,
    branch,
    isDebt,
    attachment,
  ]);

  // Compute VAT base/amount and WHT amount from inputs to avoid derived state/effects
  const { computedBase, computedVatAmount, computedWHTAmount } = useMemo(() => {
    const finalAmt = Number(amount) || 0;
    const vatRate = vatIncluded ? DEFAULT_VAT_PERCENT : 0;
    const whtPercent = withHoldingTax ? Number(WHTpercent) || 0 : 0;
    const res = reverseCalculateFromFinal(finalAmt, vatRate, whtPercent);
    return {
      computedBase: res.base,
      computedVatAmount: res.vat,
      computedWHTAmount: withHoldingTax ? res.wht : 0,
    };
  }, [amount, vatIncluded, withHoldingTax, WHTpercent]);

  const imagePreviewUriRaw = isImageAttachment ? attachment?.uri : (isDebt ? invoiceImage : image);
  const pdfPreviewUriRaw = isPdfAttachment ? attachment?.uri : (isDebt ? invoicePdfUrl : pdfUrl);
  const imagePreviewUri = normalizeAttachmentUri(imagePreviewUriRaw, "image");
  const pdfPreviewUri = normalizeAttachmentUri(pdfPreviewUriRaw, "pdf");
  const hasImagePreview = Boolean(imagePreviewUri);
  const hasPdfPreview = Boolean(pdfPreviewUri);
  const pdfWebViewUri =
    Platform.OS === "android" &&
    hasPdfPreview &&
    /^https?:\/\//i.test(pdfPreviewUri)
      ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfPreviewUri)}`
      : pdfPreviewUri;

  // Two-panel support: independent URIs for receipt and invoice sides
  const receiptImageUri = normalizeAttachmentUri((!isDebt && isImageAttachment) ? attachment?.uri : image, "image");
  const receiptPdfUri = normalizeAttachmentUri((!isDebt && isPdfAttachment) ? attachment?.uri : pdfUrl, "pdf");
  const invoiceImageUri = normalizeAttachmentUri((isDebt && isImageAttachment) ? attachment?.uri : invoiceImage, "image");
  const invoicePdfUri2 = normalizeAttachmentUri((isDebt && isPdfAttachment) ? attachment?.uri : invoicePdfUrl, "pdf");
  const hasReceiptPanel = Boolean(receiptImageUri) || Boolean(receiptPdfUri);
  const hasInvoicePanel = Boolean(invoiceImageUri) || Boolean(invoicePdfUri2);
  const hasBothPanels = hasReceiptPanel && hasInvoicePanel;
  const receiptPdfWebViewUri = Platform.OS === "android" && Boolean(receiptPdfUri) && /^https?:\/\//i.test(receiptPdfUri)
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(receiptPdfUri)}`
    : receiptPdfUri;
  const invoicePdfWebViewUri2 = Platform.OS === "android" && Boolean(invoicePdfUri2) && /^https?:\/\//i.test(invoicePdfUri2)
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(invoicePdfUri2)}`
    : invoicePdfUri2;

  const handleDateTimeChange = (next: Date) => {
    setDate(format(next, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
  };

  // Direct handler for group changes to avoid effect-as-event-handler
  const handleGroupChange = (nextGroup: string) => {
    setGroup(nextGroup);
    if (nextGroup === "Fuel") {
      setVatIncluded(false);
      setWithHoldingTax(false);
      setWHTpercent(0);
      setTaxType("Juristic");
      return;
    }
    if (nextGroup === "Employee") {
      setTaxType("Individual");
      if (withHoldingTax) {
        const autoWHTPercent = getWHTPercentage(nextGroup, "Individual");
        setWHTpercent(autoWHTPercent);
      }
      return;
    }
    if (withHoldingTax) {
      const autoWHTPercent = getWHTPercentage(nextGroup, taxType);
      setWHTpercent(autoWHTPercent);
    }
  };

  // Note: do not mirror `visible` into local state; rely on prop directly

  const pickImage = async (allowsEditing = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        const inferredName =
          asset.fileName || asset.uri.split("/").pop() || "attachment.jpg";
        setAttachment({
          uri: asset.uri,
          name: inferredName,
          type: asset.mimeType || "image/jpeg",
          preview: "image",
        });
        setHasChanges(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    } finally {
      setAttachmentPickerVisible(false);
    }
  };

  const openFlexiDocument = async (template: "invoice" | "receipt") => {
    console.log("Opening Flexi document with ID:", flexiId);
    if (!flexiId) return;
    try {
      const billData = await CallAPIBill.getBillByFlexiIdAPI(flexiId);
      const htmlContent = template === "invoice"
        ? generateInvoiceHTML({ invoice: billData, businessDetails, businessName, t, formatCurrencyForPDF, formatDate })
        : generateReceiptHTML({ invoice: billData, businessDetails, businessName, t, formatCurrencyForPDF, formatDate });

      if (Platform.OS === "web") {
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(htmlContent);
          win.document.close();
        }
      } else {
        await Print.printAsync({ html: htmlContent });
      }
    } catch (error: any) {
      if (error?.message?.includes("did not complete")) return;
      console.error(`Error opening ${template}:`, error);
    }
  };

  const handleOpenInvoiceFromFlexiID = () => openFlexiDocument("invoice");
  const handleOpenReceipFromFlexiID = () => openFlexiDocument("receipt");

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      const asset =
        result.assets && result.assets.length > 0 ? result.assets[0] : null;

      if (asset?.uri) {
        setAttachment({
          uri: asset.uri,
          name:
            asset.name ||
            asset.uri.split("/").pop() ||
            `attachment_${Date.now()}.pdf`,
          type: asset.mimeType || "application/pdf",
          preview: "pdf",
        });
        setHasChanges(true);
      }
    } catch (error) {
      console.error("Error picking PDF:", error);
    } finally {
      setAttachmentPickerVisible(false);
    }
  };

  const handleOpenAttachmentPicker = () => setAttachmentPickerVisible(true);
  const closeAttachmentPicker = () => setAttachmentPickerVisible(false);

  const handleRemoveAttachment = () => {
    setAlertConfig({
      visible: true,
      title: t("expense.detail.removeAttachment"),
      message: t("expense.detail.removeAttachmentConfirm"),
      buttons: [
        {
          text: t("common.cancel"),
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          onPress: () => {
            setAttachment(null);
            setImage("");
            setPdfUrl("");
            setAlertConfig((prev) => ({ ...prev, visible: false }));
          },
          style: "destructive",
        },
      ],
    });
  };

  const handleRemoveInvoiceAttachment = () => {
    setAlertConfig({
      visible: true,
      title: t("expense.detail.removeAttachment"),
      message: t("expense.detail.removeAttachmentConfirm"),
      buttons: [
        {
          text: t("common.cancel"),
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          onPress: () => {
            if (isDebt) setAttachment(null);
            setInvoiceImage("");
            setInvoicePdfUrl("");
            setAlertConfig((prev) => ({ ...prev, visible: false }));
          },
          style: "destructive",
        },
      ],
    });
  };

  const handlePreviewPdf = async (uri?: string) => {
    if (!uri) return;
    try {
      await Print.printAsync({ uri });
    } catch (error) {
      console.error("Error previewing PDF:", error);
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
    // Let parent control visibility; invoke onClose directly
    onClose();
  };

  const handleAttemptClose = () => {
    if (isClosingRef.current) return;
    if (!hasChanges) {
      isClosingRef.current = true;
      onClose();
      return;
    }
    setAlertConfig({
      visible: true,
      title: t("expense.detail.unsavedChanges"),
      message: t("expense.detail.unsavedChangesMessage"),
      buttons: [
        {
          text: t("common.cancel"),
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          style: "cancel",
        },
        {
          text: t("expense.detail.discardAndExit"),
          onPress: () => {
            if (isClosingRef.current) return;
            isClosingRef.current = true;
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            setTimeout(() => onClose(), 50);
          },
          style: "destructive",
        },
        {
          text: t("expense.detail.saveAndExit"),
          onPress: () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            handleUpdateExpense();
          },
        },
      ],
    });
  };

  const appendAttachmentToFormData = async (formData: FormData) => {
    if (!attachment) return;

    const fileField = isDebt
      ? attachment.preview === "pdf" ? "invoicePdf" : "invoiceImage"
      : attachment.preview === "pdf" ? "pdf" : "image";

    if (Platform.OS === "web") {
      const response = await fetch(attachment.uri);
      const blob = await response.blob();
      formData.append(fileField, blob, attachment.name);
      return;
    }

    formData.append(fileField, {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.type,
    } as unknown as Blob);
  };

  // Handle update
  const handleUpdateExpense = async () => {
    setError("");

    // Check if all fields are filled
    if (!date || !note || !amount) {
      setAlertConfig({
        visible: true,
        title: t("expense.updated.error"),
        message: t("expense.updated.required"),
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
      const normalizedAmount = amount ? amount.toString().replace(/,/g, "") : "0";
      const formData = new FormData();
      formData.append("date", date);
      formData.append("note", note);
      formData.append("desc", desc);
      formData.append("amount", isDebt ? "0" : normalizedAmount);
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
      if (isDebt) {
        formData.append("DocumentType", "Invoice");
        formData.append("debtAmount", normalizedAmount);
        if (dueDate) formData.append("dueDate", dueDate.toISOString());
      } else {
        formData.append("DocumentType", "Receipt");
        formData.append("debtAmount", "0");
      }
      await appendAttachmentToFormData(formData);
      const data = await CallAPIExpense.updateExpenseAPI(expense.id, formData);
      savedRef.current = {
        date, note, desc, amount, image, pdf: pdfUrl, group,
        vat: vatIncluded, withHoldingTax, WHTpercent,
        sTaxId, sName, taxInvoiceNo, sAddress, taxType, branch, isDebt,
      };
      setHasChanges(false);
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
          computedWHTAmount !== undefined && computedWHTAmount !== null
            ? computedWHTAmount.toString()
            : "0",
        group: group || expense?.group || "",
        taxType: taxType || "Individual",
      });
      const fileName = `WHTDocument_${expense.id}.pdf`;
      let fileUri: string;
      if (Platform.OS === "web") {
        // Web: show the PDF in a new tab and provide a friendly filename.
        // NOTE: `expo-print` on web prints the current page in many setups (showing expense detail instead of the PDF).
        const toSafeFileSegment = (name: string) =>
          (name || "")
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[\\/:*?\"<>|]+/g, "")
            .slice(0, 80);

        const safeSupplier = toSafeFileSegment(supplierName);
        const webFileName = `WHT_${safeSupplier || "document"}.pdf`;

        const pdfUrl = window.URL.createObjectURL(
          pdfBlob instanceof Blob
            ? pdfBlob
            : new Blob([pdfBlob as any], { type: "application/pdf" }),
        );

        // Wrap in an HTML blob so we can set the tab title (new tab) while embedding the PDF.
        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${webFileName}</title>
    <style>
      html, body { height: 100%; margin: 0; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe src="${pdfUrl}" title="${webFileName}"></iframe>
  </body>
</html>`;

        const htmlUrl = window.URL.createObjectURL(
          new Blob([html], { type: "text/html" }),
        );

        const opened = window.open(htmlUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
          // Popup blocked fallback: trigger a download with the desired filename.
          const link = document.createElement("a");
          link.href = pdfUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.download = webFileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

        // Give the browser time to load the object URLs before revoking.
        setTimeout(() => {
          try {
            window.URL.revokeObjectURL(pdfUrl);
            window.URL.revokeObjectURL(htmlUrl);
          } catch {}
        }, 60_000);
      } else {
        // For mobile, save and print
        fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const reader = new FileReader();
        reader.onload = async () => {
          const resultStr =
            typeof reader.result === "string" ? reader.result : "";
          const base64 = resultStr.split(",")[1] || "";
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
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
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleAttemptClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#000000aa" : "#bfbfbfaa",
        }}
        activeOpacity={1}
        onPressOut={() => { if (!alertConfig.visible) handleAttemptClose(); }}
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
              padding: isMobile() ? (hasAttachment ? 0 : 20) : 20,
            }}
            style={{
              width: Platform.OS === "web" ? "100%" : "100%",
              alignSelf: "center",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                flex:
                  Platform.OS === "web"
                    ? hasAttachment
                      ? 0.9
                      : 0.75
                    : hasAttachment
                    ? 0.2
                    : 0.1,
                justifyContent: "center",
                width: isMobile() || isTablet() ? "auto" : "100%",
                backgroundColor: theme === "dark" ? "#181818" : "#ffffff",
                borderRadius: 10,
                padding: Platform.OS === "web" ? 60 : 0,
              }}
              onPress={() => {}}
            >
              <View
                className="flex-1 justify-center h-full py-6 px-4 rounded-lg"
                style={{ backgroundColor: "transparent" }}
              >
                {hasBothPanels || isFlexiDocument ? (
                  /* Two-panel 50/50 layout */
                  <View style={{ flexDirection: "row", width: "100%", height: Platform.OS === "web" ? 300 : 280, marginBottom: 8 , paddingTop: 20 }}>
                    {isFlexiDocument ? (
                      <>
                        {/* FlexiDocument Invoice panel */}
                        <TouchableOpacity
                          style={{ flex: 1, marginRight: isDebt ? 0 : 2 }}
                          className="items-center justify-center"
                          onPress={() => handleOpenInvoiceFromFlexiID()}>
                          <View style={{ flex: 1, width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#04ecc120", borderRadius: 8, borderWidth: 1, borderColor: "#04ecc140" }}>
                            <Ionicons name="link-outline" size={28} color="#04ecc1" />
                            <CustomText style={{ color: "#04ecc1", fontSize: 12 }} weight="semibold">
                              {t("expense.flexi.documentLinked", "Invoice")}
                            </CustomText>
                          </View>
                        </TouchableOpacity>
                        {/* FlexiDocument Receipt panel — only for non-debt expenses */}
                        {!isDebt && (
                          <TouchableOpacity
                            style={{ flex: 1, marginLeft: 2 }}
                            className="items-center justify-center"
                            onPress={() => handleOpenReceipFromFlexiID()}>
                            <View style={{ flex: 1, width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#04ecc120", borderRadius: 8, borderWidth: 1, borderColor: "#04ecc140" }}>
                              <Ionicons name="link-outline" size={28} color="#04ecc1" />
                              <CustomText style={{ color: "#04ecc1", fontSize: 12 }} weight="semibold">
                                {t("expense.flexi.documentLinked", "Receipt")}
                              </CustomText>
                            </View>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : null}
                    {/* Receipt panel */}
                    {!isFlexiDocument && <View style={{ flex: 1, marginRight: 2, position: "relative", overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: theme === "dark" ? "#3f3f46" : "#e5e7eb" }}>
                      <CustomText style={{ position: "absolute", top: 4, left: 6, zIndex: 5, fontSize: 9, fontWeight: "700", color: theme === "dark" ? "#aaa" : "#666", backgroundColor: theme === "dark" ? "#18181bcc" : "#ffffffcc", paddingHorizontal: 4, borderRadius: 4 }}>
                        REC
                      </CustomText>
                      {receiptImageUri ? (
                        <TouchableOpacity onPress={() => setImageModalVisible(true)} style={{ flex: 1 }}>
                          <Image source={{ uri: receiptImageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                        </TouchableOpacity>
                      ) : receiptPdfUri ? (
                        <TouchableOpacity onPress={() => handlePreviewPdf(receiptPdfUri)} style={{ flex: 1 }}>
                          {Platform.OS !== "web" ? (
                            isDeviceLocalUri(receiptPdfUri) ? (
                              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}>
                                <Ionicons name="document-text" size={36} color="#04ecc1" />
                                <CustomText style={{ fontSize: 10, color: theme === "dark" ? "#777" : "#999" }}>Tap to open</CustomText>
                              </View>
                            ) : (
                              <WebView originWhitelist={["*"]} source={{ uri: receiptPdfWebViewUri }} style={{ flex: 1 }} mixedContentMode="always" allowingReadAccessToURL="*" allowFileAccess />
                            )
                          ) : (
                            <iframe src={receiptPdfUri} style={{ width: "100%", height: "100%", border: "none" }} title="Receipt PDF" />
                          )}
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity onPress={handleRemoveAttachment} style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#ef444475", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center", zIndex: 10 }}>
                        <Ionicons name="remove" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>}
                    {/* Invoice panel */}
                    {!isFlexiDocument && <View style={{ flex: 1, marginLeft: 2, position: "relative", overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: theme === "dark" ? "#3f3f46" : "#e5e7eb" }}>
                      <CustomText style={{ position: "absolute", top: 4, left: 6, zIndex: 5, fontSize: 9, fontWeight: "700", color: "#ff2a00", backgroundColor: theme === "dark" ? "#18181bcc" : "#ffffffcc", paddingHorizontal: 4, borderRadius: 4 }}>
                        INV
                      </CustomText>
                      {invoiceImageUri ? (
                        <TouchableOpacity onPress={() => setImageModalVisible(true)} style={{ flex: 1 }}>
                          <Image source={{ uri: invoiceImageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                        </TouchableOpacity>
                      ) : invoicePdfUri2 ? (
                        <TouchableOpacity onPress={() => handlePreviewPdf(invoicePdfUri2)} style={{ flex: 1 }}>
                          {Platform.OS !== "web" ? (
                            isDeviceLocalUri(invoicePdfUri2) ? (
                              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}>
                                <Ionicons name="document-text" size={36} color="#04ecc1" />
                                <CustomText style={{ fontSize: 10, color: theme === "dark" ? "#777" : "#999" }}>Tap to open</CustomText>
                              </View>
                            ) : (
                              <WebView originWhitelist={["*"]} source={{ uri: invoicePdfWebViewUri2 }} style={{ flex: 1 }} mixedContentMode="always" allowingReadAccessToURL="*" allowFileAccess />
                            )
                          ) : (
                            <iframe src={invoicePdfUri2} style={{ width: "100%", height: "100%", border: "none" }} title="Invoice PDF" />
                          )}
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity onPress={handleRemoveInvoiceAttachment} style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#ef444475", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center", zIndex: 10 }}>
                        <Ionicons name="remove" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>}
                  </View>
                ) : (
                  /* Single-panel (existing behavior) */
                  <>
                    <TouchableOpacity
                      onPress={() => hasImagePreview && setImageModalVisible(true)}
                      activeOpacity={hasImagePreview ? 0.8 : 1}
                    >
                      {hasImagePreview && imagePreviewUri && (
                        <View style={{ position: "relative", alignSelf: "center" }}>
                          <Image source={{ uri: imagePreviewUri }} style={{ width: 300, height: 300 }} className="mt-4 mb-6 self-center rounded-md" />
                          <TouchableOpacity onPress={handleRemoveAttachment} style={{ position: "absolute", top: 35, right: 20, backgroundColor: "#ef444475", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center", zIndex: 10 }}>
                            <Ionicons name="remove" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                    {hasPdfPreview && pdfPreviewUri && (
                      <View className="mb-6 w-full self-center" style={{ position: "relative" }}>
                        <TouchableOpacity onPress={handleRemoveAttachment} style={{ position: "absolute", top: 24, right: 14, backgroundColor: "#ef444475", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center", zIndex: 10 }}>
                          <Ionicons name="remove" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handlePreviewPdf(pdfPreviewUri)} style={{ width: "100%", height: Platform.OS === "web" ? 420 : 360, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: theme === "dark" ? "#3f3f46" : "#e5e7eb", backgroundColor: theme === "dark" ? "#18181b" : "#f9fafb" }}>
                          {Platform.OS !== "web" ? (
                            isDeviceLocalUri(pdfPreviewUri) ? (
                              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
                                <Ionicons name="document-text" size={52} color="#04ecc1" />
                                <CustomText style={{ color: theme === "dark" ? "#ccc" : "#444", textAlign: "center", paddingHorizontal: 16 }} numberOfLines={2}>
                                  {extractFileName(pdfPreviewUri)}
                                </CustomText>
                                <CustomText style={{ fontSize: 12, color: theme === "dark" ? "#777" : "#999" }}>
                                  Tap to open
                                </CustomText>
                              </View>
                            ) : (
                              <WebView originWhitelist={["*"]} source={{ uri: pdfWebViewUri }} style={{ flex: 1 }} mixedContentMode="always" allowingReadAccessToURL="*" allowFileAccess />
                            )
                          ) : (
                            <View className="flex-1 justify-center items-center bg-white">
                              <iframe src={pdfPreviewUri} style={{ width: "100%", height: "100%", border: "none", backgroundColor: "white" }} title="PDF Preview" />
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
                {/* Debt / Paid toggle */}
                <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 8, marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme === "dark" ? "#444" : "#ddd", borderRadius: 8, overflow: "hidden" }}>
                    <TouchableOpacity
                      onPress={() => { if (!isFlexiDocument) setIsDebt(false); }}
                      activeOpacity={isFlexiDocument ? 1 : 0.7}
                      style={{ paddingHorizontal: 10, paddingVertical: 3, backgroundColor: !isDebt ? "#3bf6da" : "transparent", opacity: isFlexiDocument ? 0.5 : 1 }}
                    >
                      <CustomText style={{ fontSize: 11, color: !isDebt ? "#000" : (theme === "dark" ? "#555" : "#aaa") }}>
                        {t("expense.create.paid")}
                      </CustomText>
                    </TouchableOpacity>
                    <View style={{ width: 1, alignSelf: "stretch", backgroundColor: theme === "dark" ? "#444" : "#ddd" }} />
                    <TouchableOpacity
                      onPress={() => { if (!isFlexiDocument) setIsDebt(true); }}
                      activeOpacity={isFlexiDocument ? 1 : 0.7}
                      style={{ paddingHorizontal: 10, paddingVertical: 3, backgroundColor: isDebt ? "#FF9C01" : "transparent", opacity: isFlexiDocument ? 0.5 : 1 }}
                    >
                      <CustomText style={{ fontSize: 11, color: isDebt ? "#000" : (theme === "dark" ? "#555" : "#aaa") }}>
                        {t("expense.create.debt")}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 8, marginBottom: 4 }}>
                  <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#aaa" : "#666", marginRight: 8 }}>
                    {t("expense.create.date")}
                  </CustomText>
                  <TouchableOpacity
                    onPress={() => setCalendarVisible(true)}
                    style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme === "dark" ? "#333" : "#f0f0f0" }}
                  >
                    <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#ccc" : "#444", marginRight: 4 }}>
                      {formatDate(date)}
                    </CustomText>
                    <Ionicons name="calendar-outline" size={16} color={theme === "dark" ? "#ccc" : "#444"} />
                  </TouchableOpacity>
                </View>
                {isDebt && (
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 8, marginBottom: 4 }}>
                    <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#aaa" : "#666", marginRight: 8 }}>
                      {t("expense.create.dueDate")}
                    </CustomText>
                    <TouchableOpacity
                      onPress={() => setDueDatePickerVisible(true)}
                      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme === "dark" ? "#333" : "#f0f0f0" }}
                    >
                      <CustomText style={{ fontSize: 13, color: theme === "dark" ? "#ccc" : "#444", marginRight: 4 }}>
                        {dueDate ? `${String(dueDate.getUTCDate()).padStart(2,"0")}/${String(dueDate.getUTCMonth()+1).padStart(2,"0")}/${dueDate.getUTCFullYear()}` : t("expense.create.selectDueDate")}
                      </CustomText>
                      <Ionicons name="calendar-outline" size={16} color={theme === "dark" ? "#ccc" : "#444"} />
                    </TouchableOpacity>
                    {dueDate && (
                      <TouchableOpacity onPress={() => setDueDate(null)} style={{ marginLeft: 6 }}>
                        <Ionicons name="close-circle-outline" size={18} color={theme === "dark" ? "#aaa" : "#888"} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <View style={{ position: "relative" }}>
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
                </View>

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
                            {formatNumber(computedBase)}
                          </CustomText>
                          <CustomText style={{ textAlign: "left" }}>
                            {formatNumber(computedVatAmount)}
                          </CustomText>
                        </>
                      )}
                      {DocumentType &&
                        DocumentType.includes("WithholdingTax") &&
                        withHoldingTax && (
                          <CustomText style={{ textAlign: "left" }}>
                            {typeof computedWHTAmount === "number" &&
                            !isNaN(computedWHTAmount)
                              ? computedWHTAmount
                                  .toFixed(2)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                      activeOpacity={1} // Prevent fade effect on press
                    >
                      <Ionicons
                        name={vatIncluded ? "checkbox" : "square-outline"}
                        size={22}
                        color={
                          group === "Fuel"
                            ? theme === "dark"
                              ? "#666666"
                              : "#c1c1c1"
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
                              : theme === "dark"
                              ? "#b4b3b3"
                              : "#2a2a2a",
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
                        activeOpacity={1} // Prevent fade effect on press
                      >
                        <Ionicons
                          name={withHoldingTax ? "checkbox" : "square-outline"}
                          size={22}
                          color={
                            group === "Fuel"
                              ? theme === "dark"
                                ? "#666666"
                                : "#c1c1c1"
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
                                : theme === "dark"
                                ? "#b4b3b3"
                                : "#2a2a2a",
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
                  {!vatIncluded && !withHoldingTax && (
                    <TouchableOpacity
                      style={{
                        alignSelf: "flex-end",
                        justifyContent: "flex-end",
                        marginLeft: "auto",
                      }}
                      onPress={() => setShowAllFormField((prev) => !prev)}
                      activeOpacity={0.5}
                    >
                      <MaterialIcons
                        name="expand-more"
                        size={24}
                        color={theme === "dark" ? "#888888" : "#555555"}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <FloatingLabelInput
                  label={t("expense.detail.note")}
                  value={note}
                  onChangeText={setNote}
                />

                <DropdownFloat
                  title={t("expense.detail.group.title")}
                  placeholder={t("expense.detail.group.title")}
                  options={[
                    {
                      value: "Employee",
                      label: t("expense.detail.group.employee"),
                    },
                    {
                      value: "Freelancer",
                      label: t("expense.detail.group.freelancer"),
                    },
                    {
                      value: "Office",
                      label: t("expense.detail.group.office"),
                    },
                    {
                      value: "OfficeRental",
                      label: t("expense.detail.group.officeRental"),
                    },
                    {
                      value: "CarRental",
                      label: t("expense.detail.group.carRental"),
                    },
                    {
                      value: "Commission",
                      label: t("expense.detail.group.commission"),
                    },
                    {
                      value: "Advertising",
                      label: t("expense.detail.group.advertising"),
                    },
                    {
                      value: "Marketing",
                      label: t("expense.detail.group.marketing"),
                    },
                    {
                      value: "Copyright",
                      label: t("expense.detail.group.copyright"),
                    },
                    {
                      value: "Dividend",
                      label: t("expense.detail.group.dividend"),
                    },
                    {
                      value: "Interest",
                      label: t("expense.detail.group.interest"),
                    },
                    {
                      value: "Influencer",
                      label: t("expense.detail.group.influencer"),
                    },
                    {
                      value: "Accounting",
                      label: t("expense.detail.group.accounting"),
                    },
                    {
                      value: "Legal",
                      label: t("expense.detail.group.legal"),
                    },
                    {
                      value: "Taxation",
                      label: t("expense.detail.group.taxation"),
                    },
                    {
                      value: "Transport",
                      label: t("expense.detail.group.transport"),
                    },
                    {
                      value: "Product",
                      label: t("expense.detail.group.product"),
                    },
                    {
                      value: "Packing",
                      label: t("expense.detail.group.packing"),
                    },
                    {
                      value: "Fuel",
                      label: t("expense.detail.group.fuel"),
                    },
                    {
                      value: "Maintenance",
                      label: t("expense.detail.group.maintenance"),
                    },
                    {
                      value: "Utilities",
                      label: t("expense.detail.group.utility"),
                    },
                    {
                      value: "Operation",
                      label: t("expense.detail.group.operation"),
                    },
                    {
                      value: "Others",
                      label: t("expense.detail.group.other"),
                    },
                  ]}
                  selectedValue={group}
                  onValueChange={handleGroupChange}
                  borderColor={theme === "dark" ? "#555" : "#CCC"}
                  textcolor={theme === "dark" ? "#FFF" : "#000"}
                  bgChoiceColor={theme === "dark" ? "#333" : "#FFF"}
                  otherStyles="mb-1"
                />

                <FloatingLabelInput
                  label={t("expense.detail.sName")}
                  value={sName}
                  onChangeText={setSName}
                />

                {(vatIncluded ||
                  withHoldingTax ||
                  showAllFormField ||
                  group === "Fuel") && (
                  <>
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
                        activeOpacity={1} // Prevent fade effect on press
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
                      {group !== "Employee" && (
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
                          activeOpacity={1} // Prevent fade effect on press
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
                      )}
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
                        onChangeText={(text) => setSTaxId(text.replace(/\D/g, ""))}
                        containerStyle={{ flex: 1, marginVertical: 0 }}
                        keyboardType="numeric"
                        maxLength={13}
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
                <FloatingLabelInput
                  label={t("expense.detail.description")}
                  value={desc}
                  onChangeText={setDesc}
                />

                {error ? (
                  <CustomText
                    className=" mt-4"
                    style={{
                      color: "#ff4d4f",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginHorizontal: 20,
                    }}
                  >
                    {error}
                  </CustomText>
                ) : null}

                <View className="flex-row justify-evenly mt-2">
                  <TouchableOpacity
                    onPress={() => showDeleteConfirmation()}
                    className=" items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={24} color="#999999" />
                    <CustomText className="text-center mt-1">
                      {t("common.delete")}
                    </CustomText>
                  </TouchableOpacity>
                  {/* attach bill document */}

                 {/* hideAttachment if FlexiDocument */}
                  
                
                  {!isFlexiDocument && (
                    <TouchableOpacity
                      onPress={handleOpenAttachmentPicker}
                      className=" items-center justify-center"
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={24}
                        color="#999999"
                      />
                      <CustomText className="text-center mt-1">
                        {isDebt ? t("expense.detail.attachInv") : t("expense.detail.attachRec")}
                      </CustomText>
                    </TouchableOpacity>
                  )}

                  <SecondaryButton
                    title={t("common.save")}
                    handlePress={handleUpdateExpense}
                    containerStyles="px-12 mt-2"
                    textStyles="!text-white"
                  />
                  <GrayButton
                    title="✕"
                    handlePress={handleAttemptClose}
                    containerStyles="px-6 mt-2"
                  />
                </View>

                {/* Download WHT Doc & Preview */}
                {withHoldingTax && computedWHTAmount > 0 && (
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
                          ? t("common.creatingDocument") ||
                            "Creating Document..."
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
          visible={imageModalVisible && hasImagePreview}
          transparent={true}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPressOut={() => setImageModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-90">
              {hasImagePreview && imagePreviewUri ? (
                <Image
                  source={{
                    uri: imagePreviewUri,
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              ) : null}
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

        <CustomAlert
          visible={attachmentPickerVisible}
          title={isDebt ? t("expense.detail.attachInv") : t("expense.detail.attachRec")}
          message={
            t("expense.detail.chooseAttachmentType") ||
            "Choose how you want to attach the bill"
          }
          buttons={[
            {
              text: t("expense.detail.pickPdf") || "Pick PDF",
              iconName: "file-pdf",
              onPress: handlePickPdf,
            },
            {
              text: t("expense.detail.pickImage") || "Pick Image",
              iconName: "file-image",
              onPress: () => pickImage(false),
            },
            {
              text: t("common.cancel"),
              style: "cancel",
              onPress: closeAttachmentPicker,
            },
          ]}
          onClose={closeAttachmentPicker}
        />

        <DateTimePicker
          visible={calendarVisible}
          value={new Date(date)}
          onChange={handleDateTimeChange}
          onClose={() => setCalendarVisible(false)}
          maxDate={new Date()}
        />
        <DateTimePicker
          visible={dueDatePickerVisible}
          value={dueDate ?? new Date()}
          onChange={(next: Date) => setDueDate(next)}
          onClose={() => setDueDatePickerVisible(false)}
        />
      </TouchableOpacity>
    </Modal>
  );
}
