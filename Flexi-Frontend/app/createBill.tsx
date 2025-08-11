import {
  Dimensions,
  Platform,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";
import { View } from "@/components/Themed";
import CustomButton from "@/components/CustomButton";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import CallAPIProduct from "@/api/product_api";
import DropdownClear from "@/components/DropdownClear";
import CallAPIBill from "@/api/bill_api";
import CallAPIStore from "@/api/store_api";
import CallAPIBusiness from "@/api/business_api";
import { useTheme } from "@/providers/ThemeProvider";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getBusinessId, getMemberId } from "@/utils/utility";
import { isMobile } from "@/utils/responsive";
import FormFieldClear from "@/components/FormFieldClear";

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

export default function CreateBill() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<number>(0);
  const [stores, setStores] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [purchaseAt, setPurchaseAt] = useState(new Date());

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

  // Product information
  // [product, setProduct] = useState("");
  const [payment, setPayment] = useState("");
  const [amount, setAmount] = useState("1");
  // [platform, setPlatform] = useState("");
  const [cashStatus, setCashStatus] = useState(false);
  //const [price, setPrice] = useState("");
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
    { product: "", price: "", quantity: "1", unit: "" },
  ]);

  const fieldStyles = "mt-2 mb-2";

  // Tax type state
  const [taxType, setTaxType] = useState<"Individual" | "Juristic">(
    "Individual"
  );

  // Repeat bill state
  const [isRepeat, setIsRepeat] = useState(false);
  const [repeatMonths, setRepeatMonths] = useState(2);
  const [repeatMonthsInput, setRepeatMonthsInput] = useState("2");

  // Business type state
  const [businessType, setBusinessType] = useState<string | null>(null);

  // Document type progression state
  const [selectedDocumentType, setSelectedDocumentType] = useState<"QA" | "IV" | "RE">("QA");
  const [showProgressSection, setShowProgressSection] = useState(true);
  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<string[]>([]);

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

  const getStepTextColor = (step: "QA" | "IV" | "RE"): string => {
    if (isStepCompleted(step)) return "#0feac2";
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
          // Do NOT auto-select the first store
          // if (storesData.length > 0) {
          //   setStoreId(storesData[0].id);
          //   console.log("Store ID set to:", storesData[0].id);
          // }
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
          console.log("Product choice with price fetched:", response);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductChoice([]);
      }
    };

    fetchProductChoice();

    // Fetch business details to get business type and document types
    const fetchBusinessDetails = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIBusiness.getBusinessDetailsAPI(
            memberId
          );
          if (response && response.businessType) {
            setBusinessType(response.businessType);
            console.log("Business type fetched:", response.businessType);
          }
          
          // Handle DocumentType from business details
          if (response && response.DocumentType) {
            console.log("DocumentType fetched:", response.DocumentType);
            
            let docTypes: string[] = [];
            if (Array.isArray(response.DocumentType)) {
              docTypes = response.DocumentType;
            } else if (typeof response.DocumentType === 'string') {
              docTypes = [response.DocumentType];
            }
            
            setAvailableDocumentTypes(docTypes);
            
            // Check if DocumentType is only "Receipt"
            if (docTypes.length === 1 && docTypes[0] === "Receipt") {
              // Hide Progress Section and set DocumentType to Receipt
              setShowProgressSection(false);
              setSelectedDocumentType("RE");
              console.log("Only Receipt document type available - hiding progress section");
            } else {
              // Show Progress Section for multiple document types
              setShowProgressSection(true);
              
              // Set default selected document type to first available
              if (docTypes.includes("Quotation")) {
                setSelectedDocumentType("QA");
              } else if (docTypes.includes("Invoice")) {
                setSelectedDocumentType("IV");
              } else if (docTypes.includes("Receipt")) {
                setSelectedDocumentType("RE");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching business details:", error);
      }
    };

    fetchBusinessDetails();
  }, []);

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
          // Set storeId to the store with name "Tiktok Affiliate" if it exists
          const tiktokStore = stores.find(
            (store) => store.accName === "Tiktok"
          );
          if (tiktokStore) {
            setStoreId(tiktokStore.id);
            console.log("Store ID set to:", tiktokStore.id);
          }
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
          // Set storeId to the store with name "Shopee Affiliate" if it exists
          const shopeeStore = stores.find(
            (store) => store.accName === "Shopee"
          );
          if (shopeeStore) {
            setStoreId(shopeeStore.id);
            console.log("Store ID set to:", shopeeStore.id);
          }
        }
      }
      return updated;
    });
  };

  const handleAddProductItem = () => {
    setProductItems((prev) => [
      ...prev,
      { product: "", price: "", quantity: "1", unit: "" },
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
    if (!storeId) missingFields.push(t("bill.store"));

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
        payment: payment as "COD" | "Transfer" | "CreditCard" | "Cash",
        cashStatus,
        memberId: memberId || "",
        businessAcc,
        storeId,
        image,
        productItems: productItems.map((item) => ({
          product: item.product,
          unit: item.unit || undefined,
          unitPrice: Number(item.price),
          quantity: Number(item.quantity),
        })),
        note,
        repeat: isRepeat,
        repeatMonths: isRepeat ? repeatMonths : 1,
        DocumentType: "Bill", // Default to Bill, can be changed later
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

  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    console.log("Selected Dates:", dates);
    setDate(dates); // Store the dates as an array

    // Update purchaseAt with the selected date when a date is chosen
    if (dates && dates.length > 0) {
      setPurchaseAt(new Date(dates[0]));
    }

    setCalendarVisible(false);
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
    setPayment("");
    setCashStatus(false);
    setTaxType("Individual");
    setMemberId(memberId); // keep memberId for context, but reset fields
    setStoreId(0); // Reset storeId to 0
    setIsRepeat(false);
    setRepeatMonths(1);
    setRepeatMonthsInput("1");
  };

  return (
    <SafeAreaView
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

      <ScrollView>
        {/* Enhanced DocumentType Progression - Only show if not Receipt-only business */}
        {showProgressSection && (
          <View style={{               
            backgroundColor: "#00000000"
          }}>        
            
            {/* Enhanced Progress Container */}
            <View style={{ 
              backgroundColor: "transparent",
              borderRadius: 20,
              padding: 10,
              marginVertical: 5,
              borderWidth: 0,
              borderColor: "transparent"
            }}>
              
              {/* Progress Line Container */}
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "center",
                backgroundColor: "transparent",
                paddingVertical: 5
              }}>
                
                {getAvailableSteps().map((step, index) => {
                  const stepConfig = {
                    QA: { 
                      icon: "document-text-outline", 
                      label: t("bill.quotation"),
                      type: "Quotation"
                    },
                    IV: { 
                      icon: "receipt-outline", 
                      label: t("bill.invoice"),
                      type: "Invoice"
                    },
                    RE: { 
                      icon: "checkmark-circle-outline", 
                      label: t("bill.receipt"),
                      type: "Receipt"
                    }
                  };
                  
                  const availableSteps = getAvailableSteps();
                  const isLastStep = index === availableSteps.length - 1;
                  
                  return (
                    <React.Fragment key={step}>
                      {/* Step Circle */}
                      <TouchableOpacity 
                        style={{ 
                          alignItems: "center", 
                          backgroundColor: "transparent"
                        }}
                        onPress={() => setSelectedDocumentType(step)}
                        activeOpacity={0.7}
                      >
                        <View style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: isStepCompleted(step) ? "#0feac2" : "transparent",
                          borderWidth: 3,
                          borderColor: isStepCompleted(step) ? "#0feac2" : (theme === "dark" ? "#666" : "#ccc"),
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: getStepOpacity(step),
                          shadowColor: isStepCompleted(step) ? "#0feac2" : "transparent",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 8,
                          elevation: isStepCompleted(step) ? 8 : 0,
                        }}>
                          <Ionicons
                            name={stepConfig[step].icon as any}
                            size={24}
                            color={isStepCompleted(step) ? "#ffffff" : getStepIconColor(step)}
                          />
                        </View>
                        
                        <CustomText style={{
                          fontSize: 10,
                          color: getStepDescriptionColor(step),
                          textAlign: "center",
                          marginTop: 5
                        }}>
                          {stepConfig[step].label}
                        </CustomText>
                      </TouchableOpacity>
                      
                      {/* Connection Line - Only show if not last step */}
                      {!isLastStep && (
                        <View style={{
                          width: 60,
                          height: 4,
                          marginHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingHorizontal: 5
                        }}>
                          {[...Array(5)].map((_, dotIndex) => (
                            <View
                              key={dotIndex}
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: index < availableSteps.findIndex(s => s === selectedDocumentType) 
                                  ? "#0feac2" 
                                  : (theme === "dark" ? "#444" : "#ddd"),
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
          <View style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}>
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
                  paddingHorizontal: 10,
                }}
              >
                {t("bill.clearFields")}
              </CustomText>
            </TouchableOpacity>
          </View>

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
                    storeId
                      ? stores.find((store) => store.id === storeId)?.accName ||
                        ""
                      : ""
                  }
                  onValueChange={(value: any) => setStoreId(Number(value))}
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
            >
              <Ionicons
                name={taxType === "Individual" ? "checkbox" : "square-outline"}
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
            <View className={taxType === "Juristic" ? "w-full" : "w-1/2 pr-2"}>
              <FormFieldClear
                title={t("bill.customerName")}
                value={cName}
                handleChangeText={setCName}
                placeholder={t("bill.enterName")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
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
            <View className={taxType === "Juristic" ? "w-full" : "w-1/2 pr-2"}>
              <FormFieldClear
                title={t("bill.customerPhone")}
                value={cPhone}
                handleChangeText={setCPhone}
                placeholder="0812345678"
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
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
            boxheight={110}
          />
          <View className="flex flex-row justify-between">
            <View className="w-1/2 pr-2">
              <FormFieldClear
                title={t("bill.customerProvince")}
                value={cProvince}
                handleChangeText={setCProvince}
                placeholder={t("bill.enterProvince")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
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
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
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
              <View className="w-1/2 pr-2">
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
                  value={item.price}
                  handleChangeText={(value: string) =>
                    handleProductItemChange(idx, "price", value)
                  }
                  placeholder="1000"
                  borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                  placeholderTextColor={
                    theme === "dark" ? "#606060" : "#b1b1b1"
                  }
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  otherStyles="mt-1 mb-1"
                  keyboardType="numeric"
                />
              </View>
              <View className="w-1/4 pr-2" style={{ position: "relative" }}>
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
                />
                {idx !== 0 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveProductItem(idx)}
                    style={{
                      position: "absolute",
                      top: 17,
                      right: -6,
                      zIndex: 1,
                    }}
                  >
                    <Ionicons name="remove-circle" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                )}
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
          <View className="flex flex-row justify-between">
            <View className="w-1/2 pr-2">
              <DropdownClear
                title={t("bill.paymentMethod")}
                options={[
                  { label: t("bill.payment.cod"), value: "COD" },
                  { label: t("bill.payment.transfer"), value: "Transfer" },
                  { label: t("bill.payment.creditcard"), value: "CreditCard" },
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
                onValueChange={(value: string) =>
                  setCashStatus(value === "true")
                }
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles="mt-2 mb-2"
              />
            </View>
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
          />

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
                onPress={() => setIsRepeat(!isRepeat)}
              >
                <Ionicons
                  name={isRepeat ? "checkbox" : "square-outline"}
                  size={22}
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
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
