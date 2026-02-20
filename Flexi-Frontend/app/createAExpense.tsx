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
import {
  SecondaryButton,
  GrayButton,
  DarkGrayButton,
  CustomButton,
  MiniCustomButton,
} from "@/components/CustomButton";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { FloatingLabelInput } from "@/components/formfield/FloatingLabelInput";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Print from "expo-print";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIExpense from "@/api/expense_api";
import { getMemberId } from "@/utils/utility";
import { format } from "date-fns";
import i18n from "@/i18n";
import { useBusiness } from "@/providers/BusinessProvider";
import { getWHTPercentage } from "@/components/TaxVariable";
import { formatNumber, reverseCalculateFromFinal } from "@/utils/taxUtils";
import { DEFAULT_VAT_PERCENT, DEFAULT_WHT_PERCENT } from "@/utils/taxUtils";
import DateTimePicker from "@/components/DateTimePicker";
import { isMobile, isTablet } from "@/utils/responsive";
import DropdownFloat from "@/components/dropdown/DropdownFloat";

// Format date in DD/MM/YYYY HH:MM (24-hour) format
const formatDate = (dateString: string) => {
  if (!dateString) return "";

  try {
    let parsedDate;

    // Handle DD/MM/YYYY format from OCR
    if (dateString.includes("/") && !dateString.includes("T")) {
      const dateParts = dateString.split("/");
      if (dateParts.length === 3) {
        // Assuming DD/MM/YYYY format
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
        const year = parseInt(dateParts[2]);
        parsedDate = new Date(year, month, day, 12, 0, 0); // Set to noon to avoid timezone issues
      } else {
        parsedDate = new Date(dateString);
      }
    } else {
      parsedDate = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn("⚠️ Invalid date format:", dateString);
      return dateString; // Return original string if parsing fails
    }

    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();

    const time24h = format(parsedDate, "HH:mm");
    return `${day}/${month}/${year} ${time24h}`;
  } catch (error) {
    console.error("❌ Error formatting date:", error, "Original:", dateString);
    return dateString; // Return original string if any error occurs
  }
};

interface ExpenseDetailProps {
  visible: boolean;
  onClose: () => void;
  success: () => void;
  expense: {
    date: string;
    note: string;
    desc: string;
    amount: string;
    image: string;
    pdf: string;
    id: number;
    group: string;
  };
}

type AttachmentPreviewType = "image" | "pdf";

interface AttachmentFile {
  uri: string;
  name: string;
  type: string;
  preview: AttachmentPreviewType;
}

export default function CreateExpense({
  success,
  visible,
  onClose,
}: ExpenseDetailProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [note, setNote] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [group, setGroup] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [attachmentPickerVisible, setAttachmentPickerVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [date, setDate] = useState<string[]>([new Date().toISOString()]);
  const [SelectedDates, setSelectedDates] = useState<string[]>([
    new Date().toISOString(),
  ]);
  const { vat, DocumentType } = useBusiness();
  const [vatIncluded, setVatIncluded] = useState(false);
  const [vatAmount, setVatAmount] = useState(0);
  const [withHoldingTax, setWithHoldingTax] = useState(false);
  const [WHTpercent, setWHTpercent] = useState(0);
  const [WHTAmount, setWHTAmount] = useState(0);
  const [sName, setSName] = useState<string>("");
  const [sTaxId, setSTaxId] = useState<string>("");
  const [taxInvoiceNo, setTaxInvoiceNo] = useState<string>("");
  const [sAddress, setSAddress] = useState<string>("");
  const [taxType, setTaxType] = useState<"Individual" | "Juristic">(
    "Individual",
  );
  const [branch, setBranch] = useState<string>("headOffice");
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOCRProgress] = useState(0);
  const [ocrAlert, setOCRAlert] = useState<any>(null);
  const [showOCRResult, setShowOCRResult] = useState(false);
  const [showOCRSelection, setShowOCRSelection] = useState(false);
  const [createdExpenseId, setCreatedExpenseId] = useState<number | null>(null);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [showSelection, setShowSelection] = useState<boolean>(false);
  const [selectedOCRData, setSelectedOCRData] = useState<{
    selectedName?: string;
    selectedTaxId?: string;
    selectedTaxInvoiceId?: string;
    selectedVatAmount?: string;
    selectedAmount?: number;
    selectedDate?: string;
    selectedAddress?: string;
  }>({});
  const hasAttachment = Boolean(attachment);
  const isImageAttachment = attachment?.preview === "image";
  const isPdfAttachment = attachment?.preview === "pdf";
  const [showAllFormField, setShowAllFormField] = useState(false);
  const [isDebt, setIsDebt] = useState(false);

  // Helpers and handlers to compute tax amounts and react to user events (replace effect-as-handler)
  const recomputeAmounts = (overrides?: {
    amount?: string | number;
    vatIncluded?: boolean;
    withHoldingTax?: boolean;
    WHTpercent?: number;
  }) => {
    const finalAmt =
      Number(overrides?.amount !== undefined ? overrides.amount : amount) || 0;
    const nextVatIncluded =
      overrides?.vatIncluded !== undefined
        ? overrides.vatIncluded
        : vatIncluded;
    const nextWithHolding =
      overrides?.withHoldingTax !== undefined
        ? overrides.withHoldingTax
        : withHoldingTax;
    const nextWHTPercent =
      Number(
        overrides?.WHTpercent !== undefined ? overrides.WHTpercent : WHTpercent,
      ) || 0;

    // Only compute when either VAT or WHT is enabled
    if (nextVatIncluded || nextWithHolding) {
      const res = reverseCalculateFromFinal(
        finalAmt,
        nextVatIncluded ? DEFAULT_VAT_PERCENT : 0,
        nextWithHolding ? nextWHTPercent : 0,
      );
      // Keep vatAmount in sync only when VAT is enabled, otherwise zero it
      setVatAmount(nextVatIncluded ? res.vat : 0);
      // Keep WHTAmount in sync only when WHT is enabled, otherwise zero it
      setWHTAmount(nextWithHolding ? res.wht : 0);
    } else {
      // Neither VAT nor WHT selected
      setVatAmount(0);
      setWHTAmount(0);
    }
  };

  const handleGroupChange = (nextGroup: string) => {
    setGroup(nextGroup);
    if (nextGroup === "Fuel") {
      // Fuel: disable tax options and clear derived amounts
      setVatIncluded(false);
      setWithHoldingTax(false);
      setWHTpercent(0);
      setVatAmount(0);
      setWHTAmount(0);
      return;
    }
    // For non-fuel groups, if WHT is enabled, auto-set percent
    if (withHoldingTax) {
      const auto = getWHTPercentage(nextGroup, taxType);
      if (auto !== WHTpercent) setWHTpercent(auto);
      recomputeAmounts({ WHTpercent: auto });
    }
  };

  const handleToggleVatIncluded = () => {
    if (group === "Fuel") return; // VAT disabled for Fuel
    const next = !vatIncluded;
    setVatIncluded(next);
    recomputeAmounts({ vatIncluded: next });
  };

  const handleToggleWithHoldingTax = () => {
    if (group === "Fuel") return; // WHT disabled for Fuel
    const next = !withHoldingTax;
    let nextPercent = WHTpercent;
    if (next) {
      // turning on → auto percent from group+taxType
      if (group) {
        nextPercent = getWHTPercentage(group, taxType);
        if (nextPercent !== WHTpercent) setWHTpercent(nextPercent);
      }
    }
    setWithHoldingTax(next);
    recomputeAmounts({ withHoldingTax: next, WHTpercent: nextPercent });
  };

  const handleTaxTypeChange = (nextType: "Individual" | "Juristic") => {
    setTaxType(nextType);
    setBranch(nextType === "Juristic" ? "headOffice" : "");
    if (withHoldingTax && group) {
      const pct = getWHTPercentage(group, nextType);
      if (pct !== WHTpercent) setWHTpercent(pct);
      recomputeAmounts({ WHTpercent: pct });
    }
  };

  const handleAmountChange = (val: string) => {
    const raw = val.replace(/,/g, "");
    setAmount(raw);
    recomputeAmounts({ amount: raw });
  };

  const handleWHTPercentChange = (val: string) => {
    if (group === "Fuel") return; // guarded
    const num = parseFloat(val);
    const pct = isNaN(num) ? 0 : num;
    setWHTpercent(pct);
    recomputeAmounts({ WHTpercent: pct });
  };

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
        setOCRAlert(null); // Clear any previous OCR alerts when new image is selected
      }
    } catch (error) {
      console.error("Error picking image:", error);
    } finally {
      setAttachmentPickerVisible(false);
    }
  };

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
        setOCRAlert(null);
      }
    } catch (error) {
      console.error("Error picking PDF:", error);
    } finally {
      setAttachmentPickerVisible(false);
    }
  };

  const handleOpenAttachmentPicker = () => {
    setAttachmentPickerVisible(true);
  };

  const closeAttachmentPicker = () => {
    setAttachmentPickerVisible(false);
  };

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
            setAlertConfig((prev) => ({ ...prev, visible: false }));
          },
          style: "destructive",
        },
      ],
    });
  };

  const handlePreviewAttachment = async () => {
    if (!attachment) return;
    if (attachment.preview === "image") {
      setImageModalVisible(true);
      return;
    }
    try {
      await Print.printAsync({ uri: attachment.uri });
    } catch (error) {
      console.error("Error previewing attachment:", error);
    }
  };

  const appendAttachmentToFormData = async (formData: FormData) => {
    if (!attachment) return;

    const fileField = attachment.preview === "pdf" ? "pdf" : "image";

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
  //show all formfild

  // Apply selected OCR data and resubmit expense
  const applySelectedOCRData = async () => {
    try {
      // Apply selected data to form fields
      if (selectedOCRData.selectedName) setSName(selectedOCRData.selectedName);
      if (selectedOCRData.selectedTaxId)
        setSTaxId(selectedOCRData.selectedTaxId);
      if (selectedOCRData.selectedTaxInvoiceId)
        setTaxInvoiceNo(selectedOCRData.selectedTaxInvoiceId);
      if (selectedOCRData.selectedVatAmount) {
        setVatAmount(Number(selectedOCRData.selectedVatAmount));
        setVatIncluded(true);
      }
      if (selectedOCRData.selectedAmount)
        setAmount(selectedOCRData.selectedAmount.toString());
      if (selectedOCRData.selectedDate) {
        // convert DD/MM/YYYY to YYYY-MM-DD if needed
        const parts = selectedOCRData.selectedDate.split("/");
        if (parts.length === 3) {
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0",
          )}`;
          setSelectedDates([iso]);
          setDate([iso]);
        } else {
          setSelectedDates([selectedOCRData.selectedDate]);
          setDate([selectedOCRData.selectedDate]);
        }
      }
      if (selectedOCRData.selectedAddress)
        setSAddress(selectedOCRData.selectedAddress);

      // Build form data
      const formData = new FormData();
      formData.append(
        "amount",
        selectedOCRData.selectedAmount?.toString() || amount,
      );
      formData.append("desc", desc);
      formData.append("note", note);

      let dateToSubmit = Array.isArray(date) ? date[0] : date;
      if (selectedOCRData.selectedDate) {
        const parts = selectedOCRData.selectedDate.split("/");
        if (parts.length === 3) {
          dateToSubmit = `${parts[2]}-${parts[1].padStart(
            2,
            "0",
          )}-${parts[0].padStart(2, "0")}`;
        } else {
          dateToSubmit = selectedOCRData.selectedDate;
        }
      }
      formData.append("date", dateToSubmit as string);

      formData.append("sName", selectedOCRData.selectedName || sName);
      formData.append("sTaxId", selectedOCRData.selectedTaxId || sTaxId);
      formData.append("sAddress", selectedOCRData.selectedAddress || sAddress);
      formData.append(
        "taxInvoiceNo",
        selectedOCRData.selectedTaxInvoiceId || taxInvoiceNo,
      );
      formData.append("branch", branch);
      formData.append("taxType", taxType);

      await appendAttachmentToFormData(formData);

      formData.append("group", group || "");

      const finalVatAmount = selectedOCRData.selectedVatAmount
        ? Number(selectedOCRData.selectedVatAmount)
        : vatAmount;
      const finalVatIncluded = selectedOCRData.selectedVatAmount
        ? Number(selectedOCRData.selectedVatAmount) > 0
        : vatIncluded;
      formData.append("vat", finalVatIncluded ? "true" : "false");
      formData.append("vatAmount", finalVatAmount.toString());
      formData.append("withHoldingTax", withHoldingTax ? "true" : "false");
      formData.append("WHTpercent", WHTpercent.toString());

      const memberId = await getMemberId();
      if (memberId) formData.append("memberId", memberId);

      formData.append("ocrDataApplied", "true");
      if (createdExpenseId)
        formData.append("expenseId", createdExpenseId.toString());

      const updateResult =
        await CallAPIExpense.createAExpenseWithOCRAPI(formData);
      if (updateResult.error) throw new Error(updateResult.error);

      if (updateResult.taxType) setTaxType(updateResult.taxType);
      if (updateResult.vat !== undefined) setVatIncluded(updateResult.vat);
      if (updateResult.vatAmount !== undefined)
        setVatAmount(Number(updateResult.vatAmount));

      // Close and reset
      setIsProcessingOCR(false);
      setShowOCRResult(false);
      setOCRProgress(100);
      setOCRAlert(null);
      setSelectedOCRData({
        selectedName: "",
        selectedTaxId: "",
        selectedTaxInvoiceId: "",
        selectedVatAmount: "",
        selectedAmount: undefined,
        selectedDate: "",
        selectedAddress: "",
      });
      setShowSelection(false);
      console.log("✅ OCR data applied and expense resubmitted successfully");
    } catch (error) {
      console.error("❌ Error applying selected OCR data:", error);
      setError("Failed to update expense with selected data");
    }
  };

  const handleSkip = () => {
    console.log("⏭️ Skipping OCR data selection");

    // Close OCR indicator and proceed without applying data
    setIsProcessingOCR(false);
    setShowOCRResult(false);
    setOCRProgress(0);
    setOCRAlert(null);
    console.log("Expense ID:", createdExpenseId);

    // Reset selection state
    setSelectedOCRData({
      selectedName: "",
      selectedTaxId: "",
      selectedTaxInvoiceId: "",
      selectedVatAmount: "",
      selectedAmount: undefined,
      selectedDate: "",
      selectedAddress: "",
    });

    // hide selection UI
    setShowSelection(false);

    console.log("⏭️ OCR skipped, proceeding with expense creation");
  };

  // Confirm and save even when OCR reports missing items
  const handleSaveAnyway = () => {
    setAlertConfig({
      visible: true,
      title: t("ocr.alert.confirmreportOCR") || "Confirm save",
      message:
        t("ocr.alert.reportOCRmessage") ||
        "Save image and send report system ,the text detected data is not accurate.",
      buttons: [
        {
          text: t("common.cancel") || "Cancel",
          onPress: () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            handleSkip();
          },
          style: "cancel",
        },
        {
          text: t("common.confirm") || "Save image only",
          onPress: async () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));

            // Clear OCR UI/state: we explicitly ignore selected OCR fields
            setIsProcessingOCR(false);
            setShowOCRResult(false);
            setOCRProgress(0);
            setOCRAlert(null);
            setSelectedOCRData({
              selectedName: "",
              selectedTaxId: "",
              selectedTaxInvoiceId: "",
              selectedVatAmount: "",
              selectedAmount: undefined,
              selectedDate: "",
              selectedAddress: "",
            });
            setShowSelection(false);

            try {
              const memberId = await getMemberId();

              // Build minimal form data with image only (and memberId)
              const fd = new FormData();
              await appendAttachmentToFormData(fd);
              if (memberId) fd.append("memberId", memberId);

              if (createdExpenseId) {
                // Update existing draft with image-only
                const res = await CallAPIExpense.updateExpenseAPI(
                  createdExpenseId,
                  fd,
                );
                if (res.error) throw new Error(res.error);
              } else {
                // Create new expense with image-only
                const res = await CallAPIExpense.createAExpenseAPI(fd);
                if (res.error) throw new Error(res.error);
              }
            } catch (err: any) {
              console.warn("Error saving image-only:", err);
              setError(err?.message || String(err));
            }
          },
          style: "destructive",
        },
      ],
    });
  };

  // Simulate OCR progress for visual feedback
  const simulateOCRProgress = () => {
    setIsProcessingOCR(true);
    setOCRProgress(0);

    const progressSteps = [
      { progress: 20, delay: 500, message: "Processing image..." },
      { progress: 50, delay: 1000, message: "Analyzing text..." },
      { progress: 80, delay: 1500, message: "Detecting data..." },
      { progress: 95, delay: 2000, message: "Finalizing..." },
    ];

    progressSteps.forEach(({ progress, delay }) => {
      setTimeout(() => {
        setOCRProgress(progress);
      }, delay);
    });
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

  const isClosingRef = useRef(false);

  const checkHasData = () =>
    note.trim() !== "" ||
    (amount !== "" && Number(amount) > 0) ||
    attachment !== null ||
    sName.trim() !== "" ||
    sTaxId.trim() !== "" ||
    taxInvoiceNo.trim() !== "" ||
    sAddress.trim() !== "" ||
    group !== undefined ||
    desc.trim() !== "";

  const handleAttemptClose = () => {
    if (isClosingRef.current) return;
    if (!checkHasData()) {
      handleClose();
      return;
    }
    setAlertConfig({
      visible: true,
      title: t("expense.detail.unsavedChanges"),
      message: t("expense.detail.unsavedChangesMessage"),
      buttons: [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () =>
            setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
        {
          text: t("expense.detail.discardAndExit"),
          style: "destructive",
          onPress: () => {
            isClosingRef.current = true;
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            setTimeout(() => {
              handleCloseWithoutAlert();
              isClosingRef.current = false;
            }, 50);
          },
        },
        {
          text: t("expense.detail.saveAndExit"),
          style: "default",
          onPress: () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            handleCreateOrUpdate();
          },
        },
      ],
    });
  };

  const clearForm = () => {
    setNote("");
    setAmount("");
    setDesc("");
    setAttachment(null);
    setGroup(undefined);
    setDate([new Date().toISOString()]);
    setSelectedDates([new Date().toISOString()]);
    setError("");
    setVatIncluded(false);
    setWithHoldingTax(false);
    setWHTpercent(0);
    setSName("");
    setSTaxId("");
    setTaxInvoiceNo("");
    setSAddress("");
    setBranch("");
    setTaxType("Individual");
    setIsProcessingOCR(false);
    setOCRProgress(0);
    setOCRAlert(null);
    setShowOCRResult(false);
    setIsDebt(false);
  };

  const handleClose = () => {
    // Require a note before allowing the modal to close and save only when amount > 0
    if (Number(amount) > 0 && (!note || note.trim() === "")) {
      setAlertConfig({
        visible: true,
        title: t("expense.create.error"),
        message:
          t("expense.create.fillNote") ||
          "Please fill in the note before closing.",
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
            style: "default",
          },
        ],
      });
      return;
    }

    clearForm();
    onClose();
    handleDeleteExpense(); // Delete expense if created with amount 0
  };

  const handleCloseWithoutAlert = async () => {
    try {
      // Close any open alert immediately
      setAlertConfig((prev) => ({ ...prev, visible: false }));

      // Stop any OCR processing and reset progress
      setIsProcessingOCR(false);
      setOCRProgress(0);
      setOCRAlert(null);

      // Clear local form state first
      clearForm();

      // Attempt deletion in background and await it to avoid race conditions
      await handleDeleteExpense();

      // Defer onClose to next tick so state updates settle before parent unmounts
      setTimeout(() => {
        try {
          onClose();
        } catch (e) {
          console.error("Error during onClose:", e);
        }
      }, 0);
    } catch (err) {
      console.error("handleCloseWithoutAlert error:", err);
      // still try to close safely
      setTimeout(() => onClose(), 0);
    }
  };

  //handleCreateOrUpdate
  const handleCreateOrUpdate = async () => {
    if (isSubmittingExpense) return;
    setIsSubmittingExpense(true);
    // If we've already created an expense (createdExpenseId) update it,
    // otherwise create a new one. Relying on `selectedOCRData` was incorrect.
    try {
      if (createdExpenseId) {
        await handleUpdateExpense();
      } else {
        await handleCreateExpense();
      }
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  //handleUpdateExpense by createdExpenseId
  const handleUpdateExpense = async () => {
    setError("");

    try {
      const formData = new FormData();
      // Only append single string values
      if (note && typeof note === "string") formData.append("note", note);
      // Normalize amount formatting for update as well
      const normalizedAmount = amount
        ? amount.toString().replace(/,/g, "")
        : "0";
      formData.append("amount", isDebt ? "0" : normalizedAmount);
      if (desc) formData.append("desc", desc);
      // Always include group/branch/taxType to match create behavior
      formData.append("group", group || "");
      // Ensure VAT flag is sent so backend knows how to interpret vatAmount
      formData.append("vat", vatIncluded ? "true" : "false");
      formData.append("vatAmount", vatAmount ? vatAmount.toString() : "0");
      formData.append("withHoldingTax", withHoldingTax ? "true" : "false");
      formData.append("WHTpercent", WHTpercent.toString());
      formData.append("WHTAmount", WHTAmount ? WHTAmount.toString() : "0");
      formData.append("sName", sName || "");
      formData.append("sTaxId", sTaxId || "");
      formData.append("sAddress", sAddress || "");
      formData.append("taxInvoiceNo", taxInvoiceNo || "");
      formData.append("date", Array.isArray(date) ? date[0] : date);
      formData.append("branch", branch || "");
      formData.append("taxType", taxType || "");
      if (isDebt) {
        formData.append("DocumentType", "Invoice");
        formData.append("debtAmount", normalizedAmount);
      } else {
        formData.append("DocumentType", "Receipt");
        formData.append("debtAmount", "0");
      }
      await appendAttachmentToFormData(formData);

      if (createdExpenseId !== null) {
        const data = await CallAPIExpense.updateExpenseAPI(
          createdExpenseId,
          formData,
        );
        if (data.error) throw new Error(data.error);

        // Clear and close once on success
        clearForm();
        setCreatedExpenseId(null);
        onClose();
        success();
      } else {
        throw new Error("Expense ID is null or undefined");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCreateExpense = async () => {
    setError("");

    // Check if all fields are filled
    if (!date || !note || !amount) {
      setAlertConfig({
        visible: true,
        title: t("expense.create.error"),
        message: t("expense.create.message"),
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
      const memberId = await getMemberId();
      const formattedDate = format(
        new Date(date[0]),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
      );

      const formData = new FormData();
      formData.append("date", formattedDate);
      formData.append("note", note);
      // Normalize formatted amount (e.g., "1,234.00") to plain numeric string
      const normalizedAmount = amount
        ? amount.toString().replace(/,/g, "")
        : "0";
      formData.append("amount", isDebt ? "0" : normalizedAmount);
      formData.append("desc", desc);
      await appendAttachmentToFormData(formData);
      formData.append("group", group || "");
      formData.append("vat", vatIncluded ? "true" : "false");
      formData.append("vatAmount", vatAmount ? vatAmount.toString() : "0");
      formData.append("withHoldingTax", withHoldingTax ? "true" : "false");
      formData.append("WHTpercent", WHTpercent.toString());
      formData.append("WHTAmount", WHTAmount ? WHTAmount.toString() : "0");
      formData.append("sTaxId", sTaxId);
      formData.append("sName", sName);
      formData.append("taxInvoiceNo", taxInvoiceNo);
      formData.append("sAddress", sAddress);
      formData.append("branch", branch);
      formData.append("taxType", taxType);
      if (isDebt) {
        formData.append("DocumentType", "Invoice");
        formData.append("debtAmount", normalizedAmount);
      } else {
        formData.append("DocumentType", "Receipt");
        formData.append("debtAmount", "0");
      }
      if (memberId) {
        formData.append("memberId", memberId);
      } else {
        throw new Error("Member ID is null or undefined");
      }

      const data = await CallAPIExpense.createAExpenseAPI(formData);
      if (data.error) throw new Error(data.error);

      // Set vatAmount from backend response if available
      if (data.vatAmount !== undefined) {
        setVatAmount(data.vatAmount);
      }

      // Set vatAmount from backend response if available
      if (data.vatAmount !== undefined) {
        setVatAmount(data.vatAmount);
      }
      // Set WHTAmount from backend response if available
      if (data.WHTAmount !== undefined) {
        setWHTAmount(data.WHTAmount);
      }
      clearForm();
      onClose();
      success();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCreateExpenseWithOCR = async () => {
    console.log("🚀 === STARTING EXPENSE CREATION ===");
    setError("");
    setOCRAlert(null);
    const hasImageAttachment = attachment?.preview === "image";

    // Only check required fields if no image is selected
    // When image is present, OCR can fill in missing fields
    if (!hasImageAttachment && (!date || !note || !amount)) {
      console.log("❌ Missing required fields (no image for OCR)");
      setAlertConfig({
        visible: true,
        title: t("expense.create.error"),
        message: t("expense.create.message"),
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

    console.log("✅ Validation passed, proceeding...");

    try {
      const memberId = await getMemberId();
      const formattedDate = format(
        new Date(date[0]),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
      );

      // Start OCR progress simulation if image is present
      if (hasImageAttachment) {
        simulateOCRProgress();
      }

      const formData = new FormData();
      formData.append("date", formattedDate);
      formData.append("note", note);
      const normalizedAmount = amount
        ? amount.toString().replace(/,/g, "")
        : "0";
      formData.append("amount", isDebt ? "0" : normalizedAmount);
      formData.append("desc", desc);
      await appendAttachmentToFormData(formData);
      formData.append("group", group || "");
      formData.append("vat", vatIncluded ? "true" : "false");
      formData.append("vatAmount", vatAmount ? vatAmount.toString() : "0");
      formData.append("withHoldingTax", withHoldingTax ? "true" : "false");
      formData.append("WHTpercent", WHTpercent.toString());
      formData.append("WHTAmount", WHTAmount ? WHTAmount.toString() : "0");
      formData.append("sTaxId", sTaxId);
      formData.append("sName", sName);
      formData.append("taxInvoiceNo", taxInvoiceNo);
      formData.append("sAddress", sAddress);
      formData.append("branch", branch);
      formData.append("taxType", taxType);
      if (isDebt) {
        formData.append("DocumentType", "Invoice");
        formData.append("debtAmount", normalizedAmount);
      } else {
        formData.append("DocumentType", "Receipt");
        formData.append("debtAmount", "0");
      }
      if (memberId) {
        formData.append("memberId", memberId);
      } else {
        throw new Error("Member ID is null or undefined");
      }

      console.log("📤 Sending expense data to backend...");
      const data = await CallAPIExpense.createAExpenseWithOCRAPI(formData);
      if (data.error) throw new Error(data.error);

      console.log("📥 Full backend response received:", data);
      console.log(
        "🔍 Checking for OCR alert:",
        data.ocrAlert ? "Found" : "Not found",
      );

      // Update frontend state with backend-processed data
      if (data.taxType && data.taxType !== taxType) {
        console.log(
          `🔄 Backend auto-detected taxType: "${data.taxType}" (was: "${taxType}")`,
        );
        setTaxType(data.taxType);
      }

      // Update VAT settings if backend processed them
      if (data.vat !== undefined && data.vat !== vatIncluded) {
        console.log(`🔄 Backend set VAT: ${data.vat} (was: ${vatIncluded})`);
        setVatIncluded(data.vat);
      }

      if (data.vatAmount !== undefined && data.vatAmount !== vatAmount) {
        console.log(
          `🔄 Backend set VAT Amount: ${data.vatAmount} (was: ${vatAmount})`,
        );
        setVatAmount(Number(data.vatAmount));
      }

      // Complete OCR progress
      setOCRProgress(100);

      // Handle OCR alert from backend response
      if (data.ocrAlert) {
        // Store the created expense ID for later updates
        if (data.id) {
          setCreatedExpenseId(data.id);
          console.log("💾 Stored created expense ID:", data.id);
        }

        setOCRAlert(data.ocrAlert);
        console.log("🔍 OCR Alert received:", data.ocrAlert);
        console.log("📋 OCR Alert type:", data.ocrAlert.type);
        console.log("📋 OCR Alert details:", data.ocrAlert.details);

        // Show OCR result in the progress indicator
        setTimeout(() => {
          console.log(
            "⏰ About to show OCR result, setting showOCRResult to true",
          );
          setShowOCRResult(true);
        }, 500);

        return; // Don't continue to normal success until user dismisses OCR result
      } else {
        console.log("ℹ️ No OCR alert in response");
        // No OCR alert, complete normally
        setIsProcessingOCR(false);
      }

      // Set vatAmount from backend response if available
      if (data.vatAmount !== undefined) {
        setVatAmount(data.vatAmount);
      }

      // Set WHTAmount from backend response if available
      if (data.WHTAmount !== undefined) {
        setWHTAmount(data.WHTAmount);
      }

      // Normal success flow (no OCR alert)
      clearForm();
      onClose();
      success();
    } catch (error: any) {
      setIsProcessingOCR(false);
      setOCRProgress(0);
      setError(error.message);
    }
  };

  // delete expense by id if amount is 0
  const handleDeleteExpense = async () => {
    if (createdExpenseId && Number(amount) === 0) {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          await CallAPIExpense.deleteExpenseAPI(createdExpenseId, memberId);
          console.log(
            "🗑️ Auto-deleted expense 0 Amount with ID:",
            createdExpenseId,
          );
          setCreatedExpenseId(null); // Clear stored ID after deletion
        } else {
          console.error("❌ memberId is null, cannot delete expense.");
        }
      } catch (error) {
        console.error("❌ Failed to auto-delete expense:", error);
      }
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

  const handleDateTimeChange = (next: Date) => {
    // Store in local-offset format (not UTC Z) to avoid timezone shifting
    const formatted = format(next, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    setSelectedDates([formatted]);
    setDate([formatted]);
  };

  // Reusable selectable list for OCR options to reduce duplication
  const SelectableOption = ({
    labelKey,
    items,
    selectedValue,
    onSelect,
    formatter,
  }: {
    labelKey: string;
    items?: any[];
    selectedValue?: any;
    onSelect: (val: any) => void;
    formatter?: (val: any) => string;
  }) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={{ marginBottom: 10 }}>
        <CustomText
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: theme === "dark" ? "#fff" : "#333",
            marginBottom: 8,
            marginLeft: 10,
          }}
        >
          {t(labelKey)}
        </CustomText>

        {items.map((item: any, index: number) => {
          const isSelected = item === selectedValue;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onSelect(isSelected ? undefined : item)}
              style={{
                padding: 8,
                marginBottom: 4,
                marginLeft: 10,
                backgroundColor: isSelected
                  ? theme === "dark"
                    ? "#2f2f2f"
                    : "#dbfefa"
                  : theme === "dark"
                    ? "#2f2f2f"
                    : "#f3f4f6",
                borderRadius: 10,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected
                  ? "#3bf6da"
                  : theme === "dark"
                    ? "transparent"
                    : "#d1d5db",
              }}
            >
              <CustomText
                style={{
                  fontSize: 12,
                  color: isSelected
                    ? theme === "dark"
                      ? "#ccc"
                      : "#636363"
                    : theme === "dark"
                      ? "#ccc"
                      : "#666",
                }}
              >
                {`${isSelected ? "✓ " : "○ "}${
                  formatter ? formatter(item) : String(item)
                }`}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleAttemptClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#000000aa" : "#bfbfbfaa",
        }}
        activeOpacity={1}
        onPressOut={() => {
          if (alertConfig.visible) return;
          // Allow closing by tapping the backdrop when amount is empty or <= 0.
          // Require a note only when amount > 0.
          if (Number(amount) > 0 && (!note || note.trim() === "")) {
            setAlertConfig({
              visible: true,
              title: t("ocr.alert.incompleteData") || "Incomplete data",
              message:
                t("ocr.alert.fillNote") ||
                "Please fill in the note before closing.",
              buttons: [
                {
                  text: t("ocr.alert.continueEditToCompleteAllFill"),
                  onPress: () =>
                    setAlertConfig((prev) => ({ ...prev, visible: false })),
                  style: "default",
                },
                {
                  text: t("ocr.alert.closeWithoutSaving"),
                  onPress: () => handleCloseWithoutAlert(),
                  style: "default",
                },
              ],
            });
            return;
          }
          handleClose();
        }}
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
            scrollEnabled={!showOCRResult}
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
              <View className=" flex-1 justify-center h-full py-6 px-4 rounded-lg">
                {isImageAttachment && (
                  <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                    <View style={{ position: "relative", alignSelf: "center" }}>
                      <Image
                        source={{ uri: attachment?.uri }}
                        style={{ width: 300, height: 300 }}
                        className="mt-4 mb-6 self-center rounded-md"
                      />
                      <TouchableOpacity
                        onPress={handleRemoveAttachment}
                        style={{
                          position: "absolute",
                          top: 35,
                          right:20,
                          backgroundColor: "#ef4444",
                          borderRadius: 12,
                          width: 24,
                          height: 24,
                          justifyContent: "center",
                          alignItems: "center",
                          zIndex: 10,
                        }}
                      >
                        <Ionicons name="remove" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}

                {attachment?.preview === "pdf" && attachment.uri && (
                  <View className="mt-4 mb-6 self-center w-full" style={{ position: "relative" }}>
                    <TouchableOpacity
                      onPress={handleRemoveAttachment}
                      style={{
                        position: "absolute",
                        top: 24,
                        right: 14,
                        backgroundColor: "#ef4444",
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                      }}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </TouchableOpacity>
                    <View
                      style={{
                        width: "100%",
                        height: Platform.OS === "web" ? 420 : 360,
                        borderRadius: 12,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: theme === "dark" ? "#3f3f46" : "#e5e7eb",
                        backgroundColor:
                          theme === "dark" ? "#18181b" : "#f9fafb",
                      }}
                    >
                      {Platform.OS !== "web" ? (
                        <>
                          <WebView
                            originWhitelist={["*"]}
                            source={{ uri: attachment.uri }}
                            style={{ flex: 1 }}
                          />
                          <TouchableOpacity
                            onPress={handlePreviewAttachment}
                            activeOpacity={1}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                            }}
                          />
                        </>
                      ) : (
                        <TouchableOpacity
                          onPress={handlePreviewAttachment}
                          style={{ flex: 1 }}
                        >
                          <View className="flex-1 justify-center items-center bg-white">
                            <iframe
                              src={attachment.uri}
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                backgroundColor: "white",
                              }}
                              title="PDF Preview"
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* -----------------------OCR Progress Indicator---------------------------------- */}
                {isProcessingOCR && (
                  <View
                    style={{
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(0, 0, 0, 0.947)"
                          : "rgba(55, 55, 55, 0.9)",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                      zIndex: 1000,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          theme === "dark" ? "#181818" : "#ffffff",
                        padding: 20,
                        borderRadius: 10,
                        minWidth: 300,
                        maxWidth: "90%",
                        alignItems: "center",
                      }}
                    >
                      {!showOCRResult ? (
                        // Progress view
                        <>
                          {/* Progress Bar */}
                          <View
                            style={{
                              width: 200,
                              height: 6,
                              backgroundColor:
                                theme === "dark" ? "#444" : "#e0e0e0",
                              borderRadius: 3,
                              overflow: "hidden",
                              marginBottom: 10,
                              marginTop: 10,
                            }}
                          >
                            <View
                              style={{
                                width: `${ocrProgress}%`,
                                height: "100%",
                                backgroundColor:
                                  ocrProgress === 100 ? "#22c55e" : "#3b82f6",
                                borderRadius: 3,
                              }}
                            />
                          </View>

                          <CustomText
                            style={{
                              fontSize: 14,
                              color: theme === "dark" ? "#ccc" : "#666",
                            }}
                          >{`${ocrProgress}% ${t(
                            "common.complete",
                          )}`}</CustomText>
                          <CustomText
                            style={{
                              fontSize: 12,
                              color: theme === "dark" ? "#999" : "#888",
                              marginTop: 5,
                              textAlign: "center",
                            }}
                          >
                            {ocrProgress < 100
                              ? t("ocr.analyzing")
                              : t("ocr.complete")}
                          </CustomText>
                        </>
                      ) : (
                        // Results view
                        <>
                          {console.log(
                            "📱 Rendering OCR Results View - showOCRResult:",
                            showOCRResult,
                          )}
                          {console.log("📋 OCR Alert in results:", ocrAlert)}
                          {/* Replace title emoji/text with status image */}

                          {/* Alert Section */}

                          {!showSelection && (
                            <Image
                              source={
                                ocrAlert?.type === "success"
                                  ? require("@/constants/images").default
                                      .listcheck
                                  : ocrAlert?.type === "warning"
                                    ? require("@/constants/images").default
                                        .warning
                                    : ocrAlert?.type === "fail"
                                      ? require("@/constants/images").default
                                          .falseSign
                                      : require("@/constants/images").default
                                          .bug
                              }
                              style={{
                                width: 100,
                                height: 100,
                                marginBottom: 10,
                              }}
                              resizeMode="contain"
                            />
                          )}
                          {!showSelection && (
                            <CustomText
                              style={{
                                fontSize: 14,
                                fontWeight: "normal",
                                marginBottom: 15,
                                color: theme === "dark" ? "#fff" : "#000",
                                textAlign: "center",
                              }}
                            >
                              {ocrAlert?.type === "success"
                                ? `${t("ocr.alert.pass")}`
                                : ocrAlert?.type === "warning"
                                  ? `${t("ocr.alert.warning")}`
                                  : ocrAlert?.type === "fail"
                                    ? `${t("ocr.alert.fail")}`
                                    : `${t("ocr.alert.error")}`}
                            </CustomText>
                          )}

                          {!showSelection &&
                            (ocrAlert?.type === "warning" ||
                              ocrAlert?.type === "fail") &&
                            ocrAlert?.details?.failedRequirements && (
                              <>
                                <CustomText
                                  style={{
                                    fontSize: 13,
                                    alignSelf: "flex-start",
                                    marginLeft: 10,
                                    color:
                                      theme === "dark" ? "#ac1b02" : "#ff2d31",
                                  }}
                                >
                                  {t("ocr.shouldSpecify")}
                                </CustomText>
                                {ocrAlert.details.failedRequirements.map(
                                  (
                                    req: {
                                      key: string;
                                      values?: Record<string, string>;
                                    },
                                    index: number,
                                  ) => (
                                    <CustomText
                                      key={index}
                                      style={{
                                        fontSize: 13,
                                        alignSelf: "flex-start",
                                        marginLeft: 10,
                                        color:
                                          theme === "dark"
                                            ? "#ac1b02"
                                            : "#ff2d31",
                                      }}
                                    >
                                      {`• ${t(req.key, req.values)}`}
                                    </CustomText>
                                  ),
                                )}
                              </>
                            )}

                          {/* If Fail show 2 CustomButton and GreyButton ( Save Anyway and Close) */}
                          {ocrAlert?.type == "fail" && (
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 15,
                                gap: 4,
                                backgroundColor: "transparent",
                              }}
                            >
                              <DarkGrayButton
                                title={t("ocr.alert.saveAnyway")}
                                handlePress={handleSaveAnyway}
                                containerStyles="px-12 mt-2"
                              />
                              <GrayButton
                                title={t("ocr.alert.close")}
                                handlePress={handleSkip}
                                containerStyles="px-12 mt-2"
                              />
                            </View>
                          )}

                          {/* Select All Button + Close */}
                          {!showSelection && ocrAlert?.type !== "fail" && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignSelf: "center",
                                marginTop: 15,
                                gap: 8,
                              }}
                            >
                              <DarkGrayButton
                                title={t("ocr.selectAll")}
                                handlePress={() => {
                                  console.log(
                                    "🔄 Selecting all available OCR data",
                                  );

                                  setSelectedOCRData((prev) => ({
                                    ...prev,
                                    // Select first available option from each category
                                    selectedName:
                                      ocrAlert?.details?.selectableOptions
                                        ?.names?.[0] || prev.selectedName,
                                    selectedTaxId:
                                      ocrAlert?.details?.selectableOptions
                                        ?.taxIds?.[0] || prev.selectedTaxId,
                                    selectedTaxInvoiceId:
                                      ocrAlert?.details?.selectableOptions
                                        ?.taxInvoiceIds?.[0] ||
                                      prev.selectedTaxInvoiceId,
                                    selectedVatAmount:
                                      ocrAlert?.details?.selectableOptions
                                        ?.vatAmounts?.[0] ||
                                      prev.selectedVatAmount,
                                    selectedAmount:
                                      ocrAlert?.details?.selectableOptions
                                        ?.amounts?.[0] || prev.selectedAmount,
                                    selectedDate:
                                      ocrAlert?.details?.selectableOptions
                                        ?.dates?.[0] || prev.selectedDate,
                                    selectedAddress:
                                      ocrAlert?.details?.selectableOptions
                                        ?.addresses?.[0] ||
                                      prev.selectedAddress,
                                  }));

                                  // reveal selection UI
                                  setShowSelection(true);

                                  console.log(
                                    "✅ All available OCR data selected",
                                  );
                                }}
                                containerStyles="px-6 mt-2"
                              />

                              <GrayButton
                                title={t("ocr.alert.close")}
                                handlePress={handleSkip}
                                containerStyles="px-6 mt-2"
                              />
                            </View>
                          )}

                          {/* End Alert Section */}

                          {showSelection && ocrAlert?.type !== "fail" && (
                            <ScrollView
                              style={{
                                maxHeight: 500,
                                width: "100%",
                              }}
                              showsVerticalScrollIndicator={true}
                            >
                              {/* Selectable OCR Data */}
                              {ocrAlert?.type !== "fail" &&
                                ocrAlert?.details?.selectableOptions && (
                                  <>
                                    <CustomText
                                      style={{
                                        fontSize: 14,
                                        fontWeight: "bold",
                                        marginTop: 15,
                                        marginBottom: 12,
                                      }}
                                    >
                                      {`${t("ocr.selectDetectedData")}`}
                                    </CustomText>

                                    <SelectableOption
                                      labelKey="ocr.name"
                                      items={
                                        ocrAlert.details.selectableOptions.names
                                      }
                                      selectedValue={
                                        selectedOCRData.selectedName
                                      }
                                      onSelect={(val: string) =>
                                        setSelectedOCRData((prev) => ({
                                          ...prev,
                                          selectedName: val,
                                        }))
                                      }
                                    />

                                    <SelectableOption
                                      labelKey="ocr.taxId"
                                      items={
                                        ocrAlert.details.selectableOptions
                                          .taxIds
                                      }
                                      selectedValue={
                                        selectedOCRData.selectedTaxId
                                      }
                                      onSelect={(val: string) =>
                                        setSelectedOCRData((prev) => ({
                                          ...prev,
                                          selectedTaxId: val,
                                        }))
                                      }
                                    />

                                    <SelectableOption
                                      labelKey="ocr.taxInvoiceNo"
                                      items={
                                        ocrAlert.details.selectableOptions
                                          .taxInvoiceIds
                                      }
                                      selectedValue={
                                        selectedOCRData.selectedTaxInvoiceId
                                      }
                                      onSelect={(val: string) =>
                                        setSelectedOCRData((prev) => ({
                                          ...prev,
                                          selectedTaxInvoiceId: val,
                                        }))
                                      }
                                    />

                                    <SelectableOption
                                      labelKey="ocr.vatAmount"
                                      items={
                                        ocrAlert.details.selectableOptions
                                          .vatAmounts
                                      }
                                      selectedValue={
                                        selectedOCRData.selectedVatAmount
                                      }
                                      onSelect={(val: string) =>
                                        setSelectedOCRData((prev) => ({
                                          ...prev,
                                          selectedVatAmount: val,
                                        }))
                                      }
                                    />

                                    <SelectableOption
                                      labelKey="ocr.amount"
                                      items={
                                        ocrAlert.details.selectableOptions
                                          .amounts
                                      }
                                      selectedValue={
                                        selectedOCRData.selectedAmount
                                      }
                                      onSelect={(val: number) =>
                                        setSelectedOCRData((prev) => ({
                                          ...prev,
                                          selectedAmount: val,
                                        }))
                                      }
                                      formatter={(amt: number) =>
                                        `${amt.toLocaleString()}`
                                      }
                                    />

                                    <SelectableOption
                                      labelKey="ocr.date"
                                      items={
                                        ocrAlert.details.selectableOptions.dates
                                      }
                                      selectedValue={
                                        selectedOCRData.selectedDate
                                      }
                                      onSelect={(val: string) =>
                                        setSelectedOCRData((prev) => ({
                                          ...prev,
                                          selectedDate: val,
                                        }))
                                      }
                                    />

                                    <SelectableOption
                                      labelKey="ocr.address"
                                      items={
                                        ocrAlert.details.selectableOptions
                                          .addresses
                                      }
                                      selectedValue={
                                        selectedOCRData.selectedAddress
                                      }
                                      onSelect={(val: string) =>
                                        setSelectedOCRData((prev) => ({
                                          ...prev,
                                          selectedAddress: val,
                                        }))
                                      }
                                    />
                                  </>
                                )}
                            </ScrollView>
                          )}

                          {/* Action Buttons */}
                          {showSelection && (
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent:
                                  ocrAlert?.type !== "fail"
                                    ? "space-around"
                                    : "center",
                                alignSelf: "center",
                                marginTop: 10,
                                width: "100%",
                                gap: 2,
                              }}
                            >
                              {/* Use Selected Data Button */}
                              {ocrAlert?.type !== "fail" && (
                                <MiniCustomButton
                                  title={t("ocr.useData")}
                                  handlePress={applySelectedOCRData}
                                  containerStyles="px-12 mt-2"
                                  textStyles="!text-white"
                                />
                              )}

                              <GrayButton
                                title={t("ocr.skipOcr")}
                                handlePress={handleSkip}
                                containerStyles="px-12 mt-2"
                                textStyles="!text-white"
                              />
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                )}
                {/* -----------------------End OCR Progress Indicator------------------------------ */}
                {/* Debt / Paid toggle - top right */}
                <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", paddingHorizontal: 8, marginBottom: 4 }}>
                  <TouchableOpacity
                    onPress={() => setIsDebt(false)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 4,
                      borderRadius: 20,
                      backgroundColor: !isDebt ? "#3bf6da" : (theme === "dark" ? "#333" : "#e5e5e5"),
                      marginRight: 6,
                    }}
                  >
                    <CustomText style={{ fontSize: 13, color: !isDebt ? "#000" : (theme === "dark" ? "#aaa" : "#666") }}>
                      {t("expense.create.paid")}
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsDebt(true)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 4,
                      borderRadius: 20,
                      backgroundColor: isDebt ? "#3bf6da" : (theme === "dark" ? "#333" : "#e5e5e5"),
                    }}
                  >
                    <CustomText style={{ fontSize: 13, color: isDebt ? "#000" : (theme === "dark" ? "#aaa" : "#666") }}>
                      {t("expense.create.debt")}
                    </CustomText>
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center justify-center bg-transparent  rounded-full p-2 ml-2">
                  <CustomText
                    className={`text-base mx-2 ${
                      theme === "dark" ? "text-[#c9c9c9]" : "text-[#48453e]"
                    }`}
                  >
                    {`${
                      SelectedDates.length > 0
                        ? formatDate(SelectedDates[0])
                        : t("dashboard.selectDate")
                    }`}
                  </CustomText>
                  {/* icon Calendar */}
                  <Ionicons
                    name="calendar"
                    size={24}
                    color={theme === "dark" ? "#ffffff" : "#444541"}
                    onPress={() => setCalendarVisible(true)}
                  />
                </View>
                <View style={{ position: "relative" }}>
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
                    onChangeText={handleAmountChange}
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
                            {formatNumber(
                              // If vatIncluded is true we treat `amount` as final paid amount
                              // and reverse-calculate base and VAT using current WHTpercent.
                              reverseCalculateFromFinal(
                                Number(amount) || 0,
                                DEFAULT_VAT_PERCENT,
                                withHoldingTax ? Number(WHTpercent) : 0,
                              ).base,
                            )}
                          </CustomText>
                          <CustomText style={{ textAlign: "left" }}>
                            {formatNumber(
                              reverseCalculateFromFinal(
                                Number(amount) || 0,
                                DEFAULT_VAT_PERCENT,
                                withHoldingTax ? Number(WHTpercent) : 0,
                              ).vat,
                            )}
                          </CustomText>
                        </>
                      )}
                      {DocumentType &&
                        DocumentType.includes("WithholdingTax") &&
                        withHoldingTax && (
                          <CustomText style={{ textAlign: "left" }}>
                            {typeof WHTAmount === "number" && !isNaN(WHTAmount)
                              ? formatNumber(WHTAmount)
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
                      onPress={handleToggleVatIncluded}
                      activeOpacity={1} // Prevent fade effect on press
                      disabled={group === "Fuel"}
                    >
                      <Ionicons
                        name={vatIncluded ? "checkbox" : "square-outline"}
                        size={22}
                        color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
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
                        onPress={handleToggleWithHoldingTax}
                        disabled={group === "Fuel"}
                        activeOpacity={1} // Prevent fade effect on press
                      >
                        <Ionicons
                          name={withHoldingTax ? "checkbox" : "square-outline"}
                          size={22}
                          color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
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
                            }}
                            value={WHTpercent.toString()}
                            onChangeText={handleWHTPercentChange}
                            placeholder={t("expense.detail.percent")}
                            keyboardType="numeric"
                            editable={group !== "Fuel"}
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
                  required={ocrProgress === 100}
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
                        onPress={() => handleTaxTypeChange("Individual")}
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
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 8,
                        }}
                        onPress={() => handleTaxTypeChange("Juristic")}
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
                />

                {error ? (
                  <View className="items-center">
                    <Text className="text-secondary mt-3">{error}</Text>
                  </View>
                ) : null}

                <View className="flex-row justify-evenly pt-2">
                  <TouchableOpacity
                    onPress={handleOpenAttachmentPicker}
                    className=" items-center justify-center pt-2"
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={26}
                      color="#999999"
                    />
                    <CustomText className="text-center mt-1">
                      {t("expense.detail.attachBill")}
                    </CustomText>
                  </TouchableOpacity>

                  {isImageAttachment && (
                    <TouchableOpacity
                      onPress={() => {
                        handleCreateExpenseWithOCR();
                      }}
                      className=" items-center justify-center pt-2"
                    >
                      <Ionicons name="scan" size={26} color="#999999" />
                      <CustomText className="text-center mt-1">
                        {t("common.OCR")}
                      </CustomText>
                    </TouchableOpacity>
                  )}

                  <SecondaryButton
                    title={t("common.save")}
                    handlePress={() => handleCreateOrUpdate()}
                    containerStyles="px-12 mt-2"
                    textStyles="!text-white"
                    isLoading={isSubmittingExpense}
                  />
                  <GrayButton
                    title="✕"
                    handlePress={handleAttemptClose}
                    containerStyles="px-6 mt-2"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal to view image */}
        <Modal
          visible={imageModalVisible && isImageAttachment}
          transparent={true}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPressOut={() => setImageModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-90">
              {isImageAttachment && attachment?.uri ? (
                <Image
                  source={{
                    uri: attachment.uri,
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

        <DateTimePicker
          visible={calendarVisible}
          value={new Date(Array.isArray(date) ? date[0] : date)}
          onChange={handleDateTimeChange}
          onClose={() => setCalendarVisible(false)}
          maxDate={new Date()}
        />

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
          title={t("expense.detail.attachBill") || "Attach Bill"}
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
      </TouchableOpacity>
    </Modal>
  );
}
