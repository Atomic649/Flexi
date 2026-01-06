import {
  Dimensions,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { View } from "@/components/Themed";
import { CustomButton, GrayButton } from "@/components/CustomButton";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { saveRemark, getRemark } from "@/utils/utility";
import {
  savePaymentTermCondition,
  getPaymentTermCondition,
} from "@/utils/utility";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import DateTimePicker from "@/components/DateTimePicker";
import CallAPIProduct from "@/api/product_api";
import DropdownClear from "@/components/dropdown/DropdownClear";
import CallAPIBill from "@/api/bill_api";
import CallAPIPlatform from "@/api/platform_api";
import { useBusiness } from "@/providers/BusinessProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getBusinessId, getMemberId } from "@/utils/utility";
import { isMobile, isMobileApp } from "@/utils/responsive";
import FormFieldClear from "@/components/formfield/FormFieldClear";
import AutoFillBill, { ParsedCustomerInfo } from "@/components/autoFillBill";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";

// Format date in DD/MM/YYYY HH:MM (24-hour) format
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return format(parsedDate, "dd/MM/yyyy HH:mm");
};

export default function CreateBill() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const searchParams = useLocalSearchParams<{
    duplicateId?: string | string[];
  }>();
  const duplicateIdParam = Array.isArray(searchParams.duplicateId)
    ? searchParams.duplicateId[0]
    : searchParams.duplicateId;
  const parsedDuplicateId = duplicateIdParam ? Number(duplicateIdParam) : null;
  const duplicateBillId =
    parsedDuplicateId !== null && !Number.isNaN(parsedDuplicateId)
      ? parsedDuplicateId
      : null;
  const [platformOptions, setPlatformOptions] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [error, setError] = useState("");
  const [purchaseAt, setPurchaseAt] = useState(new Date());

  // Note: Avoid reacting to memberId via effect to fetch defaults; handled during credentials fetch

  // Handler to save remark to AsyncStorage
  const handleSaveRemark = async () => {
    try {
      if (memberId) {
        await saveRemark(remark, memberId);
        setAlertConfig({
          visible: true,
          title: t("bill.alerts.success"),
          message: t("bill.remarkSaved"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: t("bill.remarkSaveError"),
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

  // Customer information
  const [cName, setCName] = useState("");
  const [cLastName, setCLastName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cGender, setCGender] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cPostId, setCPostId] = useState("");
  const [cProvince, setCProvince] = useState("");
  const [cTaxId, setTaxId] = useState("");
  const [note, setNote] = useState("");
  const [paymentTermCondition, setPaymentTermCondition] = useState("");

  // Handler to save payment terms to AsyncStorage
  const handleSavePaymentTerms = async () => {
    try {
      if (memberId) {
        await savePaymentTermCondition(paymentTermCondition, memberId);
        setAlertConfig({
          visible: true,
          title: t("bill.alerts.success"),
          message: t("bill.paymentTermSaved"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: t("bill.paymentTermSaveError"),
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
  const [remark, setRemark] = useState("");
  const [priceValid, setPriceValid] = useState<Date | null>(null);
  const [priceValidDays, setPriceValidDays] = useState<7 | 15 | 30 | null>(
    null
  );

  // Product information
  const [payment, setPayment] = useState("NotSpecified");
  const [amount, setAmount] = useState("1");
  const [cashStatus, setCashStatus] = useState(false);
  const [businessAcc, setBusinessAcc] = useState(0);
  const [image, setImage] = useState("");

  // Product choice
  const [productChoice, setProductChoice] = useState<any[]>([]);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [date, setDate] = useState<string[]>([new Date().toISOString()]);
  const [SelectedDates, setSelectedDates] = useState<string[]>([
    new Date().toISOString(),
  ]);

  // --- Product Items State ---
  const [productItems, setProductItems] = useState([
    { product: "", price: "", quantity: "1", unit: "", unitDiscount: "" },
  ]);
  const duplicatePrefillCacheRef = useRef<{ id: number; data: any } | null>(
    null
  );

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

  // Repeat bill state
  const [isRepeat, setIsRepeat] = useState(false);
  const [repeatMonths, setRepeatMonths] = useState(1);
  const [repeatMonthsInput, setRepeatMonthsInput] = useState("1");

  // Document type progression state
  const [selectedDocumentType, setSelectedDocumentType] = useState<
    "QA" | "IV" | "RE"
  >("QA");
  const [showProgressSection, setShowProgressSection] = useState(true);
  // availableDocumentTypes and businessType are derived from context below

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

  // Helper function to convert internal document type to API format
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

  const getDocumentTypeFromAPI = (
    docType?: string | string[] | null
  ): "QA" | "IV" | "RE" | null => {
    if (!docType) return null;
    const value = Array.isArray(docType) ? docType[0] : docType;
    switch (value) {
      case "Invoice":
        return "IV";
      case "Receipt":
        return "RE";
      case "Quotation":
      case "Bill":
      default:
        return "QA";
    }
  };

  useEffect(() => {
    const fetchMemberId = async () => {
      const uniqueId = await getMemberId();
      const businessId = await getBusinessId();

      setMemberId(uniqueId);
      if (businessId) {
        setBusinessAcc(businessId);
      }
      // Load defaults tied to memberId
      if (uniqueId) {
        const [defaultRemark, defaultTerm] = await Promise.all([
          getRemark(uniqueId),
          getPaymentTermCondition(uniqueId),
        ]);
        if (defaultRemark !== null && defaultRemark !== undefined) {
          setRemark(defaultRemark);
        }
        if (defaultTerm !== null && defaultTerm !== undefined) {
          setPaymentTermCondition(defaultTerm);
        }
      }
      // Fetch platforms for this member
      if (uniqueId) {
        try {
          const platformData = await CallAPIPlatform.getPlatformEnumAPI(
            uniqueId
          );
          setPlatformOptions(Array.isArray(platformData) ? platformData : []);
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
          const response = await CallAPIProduct.getProductChoiceWithPriceAPI(
            memberId
          );
          setProductChoice(response || []);
          console.log("Product choice with price fetched:", response);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductChoice([]);
      }
    };

    fetchProductChoice();
  }, []);

  // Access BusinessProvider context
  const {
    DocumentType: contextDocumentTypes,
    businessType: contextBusinessType,
  } = useBusiness();

  // Derive available document types directly from context
  const availableDocumentTypes = Array.isArray(contextDocumentTypes)
    ? contextDocumentTypes
    : contextDocumentTypes
    ? [contextDocumentTypes]
    : [];
  const availableDocumentTypesKey = availableDocumentTypes.join(",");

  // Derive businessType directly for render
  const businessType = contextBusinessType ?? null;

  useEffect(() => {
    if (businessType === "Rental") {
      setIsRepeat(true);
    }
  }, [businessType]);

  // Derive valid contact date by extending purchase date with repeat months
  const repeatValidDate = useMemo(() => {
    if (!isRepeat) {
      return null;
    }

    const months = Number(repeatMonths);
    if (!Number.isFinite(months) || months <= 0) {
      return null;
    }

    const baseDate = new Date(purchaseAt);
    if (Number.isNaN(baseDate.getTime())) {
      return null;
    }

    const extendedDate = new Date(baseDate);
    extendedDate.setMonth(extendedDate.getMonth() + months);
    return extendedDate;
  }, [isRepeat, purchaseAt, repeatMonths]);

  // Initialize progression visibility and selected step from available types
  useEffect(() => {
    if (duplicateBillId) {
      return;
    }

    if (
      availableDocumentTypes.length === 1 &&
      availableDocumentTypes[0] === "Receipt"
    ) {
      setShowProgressSection(false);
      setSelectedDocumentType("RE");
    } else if (availableDocumentTypes.length > 0) {
      setShowProgressSection(true);
      if (availableDocumentTypes.includes("Quotation")) {
        setSelectedDocumentType("QA");
      } else if (availableDocumentTypes.includes("Invoice")) {
        setSelectedDocumentType("IV");
      } else if (availableDocumentTypes.includes("Receipt")) {
        setSelectedDocumentType("RE");
      }
    }
  }, [availableDocumentTypesKey, duplicateBillId]);

  useEffect(() => {
    if (!duplicateBillId) {
      return;
    }

    let isCancelled = false;

    const applyBillData = (billData: any) => {
      if (isCancelled || !billData) {
        return;
      }

      const purchaseDate = billData.purchaseAt
        ? new Date(billData.purchaseAt)
        : new Date();
      setPurchaseAt(purchaseDate);
      setSelectedDates([purchaseDate.toISOString()]);
      setDate([purchaseDate.toISOString()]);

      setCName(billData.cName ?? "");
      setCLastName(billData.cLastName ?? "");
      setCPhone(billData.cPhone ?? "");
      setCGender(billData.cGender ?? "");
      setCAddress(billData.cAddress ?? "");
      setCPostId(billData.cPostId ?? "");
      setCProvince(billData.cProvince ?? "");
      setTaxId(billData.cTaxId ?? "");
      setPayment(billData.payment ?? "NotSpecified");
      setCashStatus(Boolean(billData.cashStatus));
      setSelectedPlatform(billData.platform ?? "");
      if (billData.businessAcc !== undefined && billData.businessAcc !== null) {
        setBusinessAcc(billData.businessAcc);
      }
      setImage(billData.image ?? "");
      setNote(billData.note ?? "");
      setPaymentTermCondition(billData.paymentTermCondition ?? "");
      setRemark(billData.remark ?? "");

      const isJuristicCustomer =
        billData.TaxType === "Juristic" ||
        Boolean(billData.cTaxId && billData.cTaxId.length > 0);
      setTaxType(isJuristicCustomer ? "Juristic" : "Individual");

      if (
        billData.product &&
        Array.isArray(billData.product) &&
        billData.product.length > 0
      ) {
        setProductItems(
          billData.product.map((item: any) => ({
            product: item.product ?? "",
            price:
              item.unitPrice !== undefined && item.unitPrice !== null
                ? item.unitPrice.toString()
                : "",
            quantity:
              item.quantity !== undefined && item.quantity !== null
                ? item.quantity.toString()
                : "1",
            unit: item.unit ?? "",
            unitDiscount:
              item.unitDiscount !== undefined && item.unitDiscount !== null
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

      if (businessType === "Rental") {
        setIsRepeat(true);
      } else if (typeof billData.repeat === "boolean") {
        setIsRepeat(billData.repeat);
      } else {
        setIsRepeat(false);
      }
      if (billData.repeatMonths && billData.repeatMonths > 0) {
        setRepeatMonths(billData.repeatMonths);
        setRepeatMonthsInput(billData.repeatMonths.toString());
      } else {
        setRepeatMonths(1);
        setRepeatMonthsInput("1");
      }

      if (billData.priceValid) {
        const priceValidDate = new Date(billData.priceValid);
        setPriceValid(priceValidDate);
        const baseDate = billData.purchaseAt
          ? new Date(billData.purchaseAt)
          : new Date();
        const diffDays = Math.round(
          (priceValidDate.getTime() - baseDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (diffDays === 7 || diffDays === 15 || diffDays === 30) {
          setPriceValidDays(diffDays as 7 | 15 | 30);
        } else {
          setPriceValidDays(null);
        }
      } else {
        setPriceValid(null);
        setPriceValidDays(null);
      }

      // Default to Quotation when duplicating if available
      if (availableDocumentTypes.includes("Quotation")) {
        setSelectedDocumentType("QA");
      } else {
        const documentTypeFromBill = getDocumentTypeFromAPI(
          billData.DocumentType
        );
        if (
          documentTypeFromBill &&
          (availableDocumentTypes.length === 0 ||
            availableDocumentTypes.includes(
              getDocumentTypeForAPI(documentTypeFromBill)
            ))
        ) {
          setSelectedDocumentType(documentTypeFromBill);
        } else if (availableDocumentTypes.length > 0) {
          if (availableDocumentTypes.includes("Invoice")) {
            setSelectedDocumentType("IV");
          } else if (availableDocumentTypes.includes("Receipt")) {
            setSelectedDocumentType("RE");
          }
        }
      }
    };

    const prefillFromBill = async () => {
      try {
        if (
          duplicatePrefillCacheRef.current &&
          duplicatePrefillCacheRef.current.id === duplicateBillId
        ) {
          applyBillData(duplicatePrefillCacheRef.current.data);
          return;
        }

        const billData = await CallAPIBill.getBillByIdAPI(duplicateBillId);
        if (!billData) {
          return;
        }
        duplicatePrefillCacheRef.current = {
          id: duplicateBillId,
          data: billData,
        };
        applyBillData(billData);
      } catch (error) {
        console.error("Failed to prefill bill for duplication:", error);
        setError(
          error instanceof Error ? error.message : "Failed to duplicate bill"
        );
      }
    };

    prefillFromBill();

    return () => {
      isCancelled = true;
    };
  }, [duplicateBillId, availableDocumentTypesKey, businessType]);

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
        const selectedProduct = productChoice.find((p) => p.name === value);
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
          setCName("บริษัท ติ๊กต๊อก (ไทยแลนด์) จำกัด");
          setCLastName("");
          setCPhone("0000000000");
          setTaxId("0105562003561");
          setCGender("NotSpecified");
          setCAddress(
            "เลขที่ 289/3 ซอยลาดพร้าว 80 แยก 22 แขวงวังทองหลาง เขตวังทองหลาง"
          );
          setCProvince("กรุงเทพมหานคร");
          setCPostId("10310");
          setPayment("Transfer");
          setCashStatus(true);
          setTaxType("Juristic"); // Set tax type to Juristic for Tiktok Affiliate
          setMemberId(memberId);
          setSelectedPlatform("Tiktok");
        }
        // Auto-fill customer fields if product is Shopee Affiliate
        if (value === "Shopee Affiliate") {
          setCName("บริษัท ช้อปปี้ (ประเทศไทย) จำกัด");
          setCLastName("");
          setCPhone("0000000000");
          setTaxId("0105558019581");
          setCGender("NotSpecified");
          setCAddress(
            "89 อาคารเอไอเอ แคปปิตอล เซ็นเตอร์ ชั้นที่ 24 ถนนรัชดาภิเษก ดินแดง"
          );
          setCProvince("กรุงเทพมหานคร");
          setCPostId("10400");
          setPayment("Transfer");
          setCashStatus(true);
          setTaxType("Juristic"); // Set tax type to Juristic for Shopee Affiliate
          setMemberId(memberId);
          setSelectedPlatform("Shopee");
        }
      }
      return updated;
    });
  };

  const handleAddProductItem = () => {
    // Check if no products are available
    if (!productChoice || productChoice.length === 0) {
      // Navigate to create product page
      router.push("/createproduct");
      return;
    }

    setProductItems((prev) => [
      ...prev,
      { product: "", price: "", quantity: "1", unit: "", unitDiscount: "" },
    ]);
  };

  const handleRemoveProductItem = (index: number) => {
    setProductItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateBill = async () => {
    setError("");

    // Check if all required fields are filled and create array of missing fields
    const missingFields = [];

    if (!cName) missingFields.push(t("bill.customerName"));
    // if (!cLastName) missingFields.push(t("bill.customerLastName"));
    // if (!cPhone) missingFields.push(t("bill.customerPhone"));
    if (!cGender) missingFields.push(t("bill.customerGender"));
    if (!cAddress) missingFields.push(t("bill.customerAddress"));
    if (!cPostId) missingFields.push(t("bill.customerPostal"));
    if (!cProvince) missingFields.push(t("bill.customerProvince"));
    if (!selectedPlatform) missingFields.push(t("bill.platform"));

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

    // Validate repeat months if repeat is enabled
    if (
      isRepeat &&
      (repeatMonths < 1 ||
        repeatMonths > 12 ||
        repeatMonthsInput === "" ||
        isNaN(parseInt(repeatMonthsInput)))
    ) {
      // Ensure we have a valid value before submission
      if (repeatMonthsInput === "" || isNaN(parseInt(repeatMonthsInput))) {
        setRepeatMonthsInput("1");
        setRepeatMonths(1);
      } else if (parseInt(repeatMonthsInput) > 12) {
        setRepeatMonthsInput("12");
        setRepeatMonths(12);
      }

      setAlertConfig({
        visible: true,
        title: t("bill.validation.invalidRepeat"),
        message: t("bill.validation.repeatMonth"),
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
      // Call API to create bill
      const data = await CallAPIBill.createBillAPI({
        purchaseAt,
        cName,
        cLastName,
        cPhone,
        cGender: cGender as "Female" | "Male" | "NotSpecified",
        cAddress,
        cPostId,
        cProvince,
        cTaxId: String(cTaxId),
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
        productItems: productItems.map((item) => ({
          product: item.product,
          unit: item.unit || undefined,
          unitPrice: Number(item.price),
          unitDiscount: Number(item.unitDiscount) || 0,
          quantity: Number(item.quantity),
        })),
        note,
        paymentTermCondition:
          selectedDocumentType === "QA" && paymentTermCondition
            ? paymentTermCondition
            : undefined,
        remark: remark || undefined,
        priceValid: priceValid || undefined,
        repeat: isRepeat,
        repeatMonths: isRepeat ? repeatMonths : 1,
        DocumentType: [getDocumentTypeForAPI(selectedDocumentType)],
        taxType: taxType,
      });

      if (data.error) throw new Error(data.error);

      setAlertConfig({
        visible: true,
        title: t("bill.alerts.successTitle"),
        message: isRepeat
          ? t("bill.alerts.repeatSuccessMessage").replace(
              "{months}",
              repeatMonths.toString()
            )
          : t("bill.alerts.successMessage"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.back();
            },
          },
        ],
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDateTimeChange = (next: Date) => {
    setPurchaseAt(next);
    setSelectedDates([format(next, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")]);
  };

  const handlePriceValidDaysChange = (days: 7 | 15 | 30) => {
    setPriceValidDays(days);
    // Calculate the date from current date
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + days);
    setPriceValid(validDate);
  }; // force to chose only one date

  // Clear all customer and bill fields
  const handleClearFields = () => {
    setCName("");
    setCLastName("");
    setCPhone("");
    setTaxId("");
    setCGender("");
    setCAddress("");
    setCProvince("");
    setCPostId("");
    setNote("");
    setPaymentTermCondition("");
    setRemark("");
    setPayment("");
    setCashStatus(false);
    setTaxType("Individual");
    setMemberId(memberId); // keep memberId for context, but reset fields
    setSelectedPlatform("");
    setIsRepeat(businessType === "Rental");
    setRepeatMonths(1);
    setRepeatMonthsInput("1");
  };
  const handleAutoFillApply = (parsed: ParsedCustomerInfo) => {
    const effectiveTaxType = parsed.taxType ?? taxType;

    if (parsed.taxType) {
      setTaxType(parsed.taxType);
    }

    setCName(parsed.name ?? "");

    if (effectiveTaxType === "Juristic") {
      setCLastName("");
      setCGender("NotSpecified");
    } else {
      setCLastName(parsed.lastName ?? "");
      setCGender(parsed.gender ?? "");
    }

    setCPhone(parsed.phone ?? "");
    setTaxId(parsed.taxId ?? "");
    setCAddress(parsed.address ?? "");
    setCProvince(parsed.province ?? "");
    setCPostId(parsed.postal ?? "");
  };

  const scrollViewRef = useRef<ScrollView>(null);

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
        value={purchaseAt}
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
            width: isMobile() ? "100%" : "40%",
            paddingHorizontal: isMobileApp() ? 0 : 15,
            maxWidth: 600,
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
                          onPress={() => setSelectedDocumentType(step)}
                          activeOpacity={0.7}
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

          {/* Main Content Area */}
          <View
            className="flex-1 justify-center  h-full px-4 mb-20 pb-20"
            style={{
              maxWidth: Platform.OS === "web" ? 600 : "100%",
              alignSelf: Platform.OS === "web" ? "center" : "auto",
            }}
          >
            {/* Clear Button in Top Right */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 10,
                flexDirection: "row",
              }}
            >
              <AutoFillBill
                onApply={handleAutoFillApply}
                taxType={taxType}
                containerStyle={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 5,
                }}
              />
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
                }}
                onPress={handleClearFields}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CustomText
                  weight="bold"
                  style={{
                    color: theme === "dark" ? "#03dbc1" : "#03dbc1",
                    fontSize: 18,
                    paddingHorizontal: 5,
                  }}
                >
                  {t("bill.clearFields")}
                </CustomText>
              </TouchableOpacity>
            </View>

            <View className="flex flex-row justify-between items-center">
              <View className="w-1/2 pr-2">
                {platformOptions.length > 0 ? (
                  <DropdownClear
                    title={t("bill.store")}
                    options={platformOptions.map((plat) => {
                      if (typeof plat === "string") {
                        return { label: plat, value: plat };
                      }
                      const label =
                        plat?.accName ?? plat?.platform ?? plat?.plat ?? "";
                      const value =
                        plat?.platform ?? plat?.plat ?? plat?.accName ?? "";
                      return { label, value };
                    })}
                    placeholder={t("bill.selectStore")}
                    placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    selectedValue={selectedPlatform}
                    onValueChange={(value: any) => setSelectedPlatform(value)}
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles="mt-2 mb-2"
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
                    {SelectedDates.length > 0
                      ? formatDate(SelectedDates[0])
                      : t("dashboard.selectDate")}
                  </CustomText>
                  {/* icon Calendar */}
                  <Ionicons
                    name="calendar"
                    size={24}
                    color={theme === "dark" ? "#ffffff" : "#444541"}
                    onPress={() => setCalendarVisible(true)}
                  />
                </View>
              </View>
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
                />
              </View>
              {taxType !== "Juristic" && (
                <View className="w-1/2 pr-2">
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
                  />
                </View>
              )}
            </View>
            {taxType === "Juristic" && (
              <FormFieldClear
                title={t("bill.customerTaxId")}
                value={cTaxId}
                handleChangeText={setTaxId}
                placeholder={t("bill.enterTaxId")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                keyboardType="numeric"
                maxLength={13}
              />
            )}
            <View className="flex flex-row justify-between">
              <View
                className={taxType === "Juristic" ? "w-full" : "w-1/2 pr-2"}
              >
                <FormFieldClear
                  title={t("bill.customerPhone")}
                  value={cPhone}
                  handleChangeText={setCPhone}
                  placeholder="0812345678"
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  placeholderTextColor={
                    theme === "dark" ? "#606060" : "#b1b1b1"
                  }
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  otherStyles={fieldStyles}
                  keyboardType="numeric"
                  maxLength={10}
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
                    onValueChange={(value: string) => setCGender(value)}
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles="mt-2 mb-2"
                  />
                </View>
              )}
            </View>

            {/* Address Fields Section */}
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
              focus={() => {
                setIsAddressFocused(true);
              }}
              onBlur={() => setIsAddressFocused(false)}
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
                />
              </View>
              <View className="w-1/2 pr-2">
                <FormFieldClear
                  title={t("bill.customerPostal")}
                  value={cPostId}
                  handleChangeText={setCPostId}
                  placeholder={t("bill.customerPostal")}
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  placeholderTextColor={
                    theme === "dark" ? "#606060" : "#b1b1b1"
                  }
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  otherStyles={fieldStyles}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Product Items Section */}
            {productItems.map((item, idx) => (
              <View
                key={idx}
                className="flex flex-row items-center mb-1 relative"
              >
                <View className="w-2/5 pr-2" style={{ position: "relative" }}>
                  {idx !== 0 && (
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
                  />
                </View>
              </View>
            ))}
            <View className="flex flex-row justify-end mb-2">
              <TouchableOpacity onPress={handleAddProductItem}>
                <View className="flex flex-row items-center gap-2">
                  <Ionicons name="add-circle" size={28} color="#2ecc71" />
                  <CustomText>{t("bill.addProductItem")}</CustomText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Payment and Cash Status - Only show for Receipt */}
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
                      cashStatus === true
                        ? t("bill.status.paid")
                        : cashStatus === false && payment
                        ? t("bill.status.unpaid")
                        : ""
                    }
                    onValueChange={() => {}} // Disabled - backend handles cashStatus automatically
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles="mt-2 mb-2"
                    disabled={true} // Make it read-only
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
                maxLength={300}
                multiline={true}
                numberOfLines={4}
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
              maxLength={300}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              boxheight={
                isRemarkFocused
                  ? 110
                  : remark
                  ? Math.max(60, Math.min(110, remark.length * 0.8 + 40))
                  : undefined
              }
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
              numberOfLines={4}
              textAlignVertical="top"
              boxheight={isNoteFocused ? 110 : undefined}
              onFocus={() => {
                setIsNoteFocused(true);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
              onBlur={() => setIsNoteFocused(false)}
            />

            {/* Price Valid Section - Hide for Receipt and Rental business */}
            {selectedDocumentType !== "RE" && businessType !== "Rental" && (
              <>
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
                    style={{ flexDirection: "row", alignItems: "center" }}
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
                </View>

                {priceValid && (
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
              </>
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
                    marginRight: 20,
                  }}
                  // onPress={() => setIsRepeat(!isRepeat)}
                  activeOpacity={1}
                >
                  <MaterialCommunityIcons
                    name="file-document-edit"
                    size={24}
                    color={theme === "dark" ? "#b1b1b1" : "#606060"}
                  />
                  <CustomText
                    className="ml-2"
                    style={{ color: theme === "dark" ? "#b1b1b1" : "#606060" }}
                  >
                    {t("bill.repeatBill")}
                  </CustomText>
                </TouchableOpacity>

                {isRepeat && (
                  <View className="flex-1 ml-4">
                    <FormFieldClear
                      title={t("bill.repeatMonths")}
                      value={repeatMonthsInput}
                      handleChangeText={(value: string) => {
                        // Allow any input including empty string
                        setRepeatMonthsInput(value);

                        // Update the actual repeat months value if valid
                        if (value !== "") {
                          const num = parseInt(value);
                          if (!isNaN(num)) {
                            if (num > 12) {
                              // Show alert if number is over 12
                              setAlertConfig({
                                visible: true,
                                title: t("bill.validation.invalidRepeat"),
                                message:
                                  "Please enter a number between 1 and 12 months only.",
                                buttons: [
                                  {
                                    text: t("common.ok"),
                                    onPress: () => {
                                      setAlertConfig((prev) => ({
                                        ...prev,
                                        visible: false,
                                      }));
                                      // Reset to maximum allowed value
                                      setRepeatMonthsInput("12");
                                      setRepeatMonths(12);
                                    },
                                  },
                                ],
                              });
                            } else if (num >= 1 && num <= 12) {
                              setRepeatMonths(num);
                            }
                          }
                        }
                      }}
                      onBlur={() => {
                        // When field loses focus, ensure it has a valid value
                        if (
                          repeatMonthsInput === "" ||
                          parseInt(repeatMonthsInput) < 1 ||
                          isNaN(parseInt(repeatMonthsInput))
                        ) {
                          setRepeatMonthsInput("2");
                          setRepeatMonths(1);
                        } else {
                          // Ensure the repeat months is synchronized
                          const num = parseInt(repeatMonthsInput);
                          if (num > 12) {
                            // If over 12, set to 12
                            setRepeatMonthsInput("12");
                            setRepeatMonths(12);
                          } else if (num >= 1 && num <= 12) {
                            setRepeatMonths(num);
                          }
                        }
                      }}
                      placeholder="1-12"
                      borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                      placeholderTextColor={
                        theme === "dark" ? "#606060" : "#b1b1b1"
                      }
                      textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                      keyboardType="numeric"
                      maxLength={2}
                      otherStyles="mt-0 mb-0"
                    />
                    {/* show Vilid Contact date calculat from purchaseDate * repeatMonth */}
                    <CustomText
                      className="text-sm mt-2 pt-1"
                      style={{ color: theme === "dark" ? "#888" : "#666" }}
                    >
                      {t("bill.validContractUntil")}{" "}
                      {repeatValidDate
                        ? new Date(repeatValidDate).toLocaleDateString("en-GB")
                        : new Date().toLocaleDateString("en-GB")}
                    </CustomText>
                  </View>
                )}
              </View>
            )}

            {error ? (
              <CustomText className="text-red-500 mt-4">{error}</CustomText>
            ) : null}

            <CustomButton
              title={t("bill.createButton")}
              handlePress={handleCreateBill}
              containerStyles="mt-5"
              textStyles="!text-white"
            />
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
