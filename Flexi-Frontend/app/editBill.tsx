import {
  Dimensions,
  Platform,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { View } from "@/components/Themed";
import CustomButton from "@/components/CustomButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import CallAPIProduct from "@/api/product_api";
import CallAPIBill from "@/api/bill_api";
import CallAPIStore from "@/api/store_api";
import DropdownClear from "@/components/DropdownClear";
import { useTheme } from "@/providers/ThemeProvider";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getBusinessId, getMemberId } from "@/utils/utility";
import { isMobile } from "@/utils/responsive";
import FormFieldClear from "@/components/FormFieldClear";

// Format date in DD/MM/YYYY H:MM AM/PM format
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();
  
  // Get hours in 12-hour format
  let hours = parsedDate.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Get minutes
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
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

  // Payment information
  const [payment, setPayment] = useState("");
  const [cashStatus, setCashStatus] = useState(false);
  const [businessAcc, setBusinessAcc] = useState(0);
  const [image, setImage] = useState("");

  // --- Product Items State ---
  const [productItems, setProductItems] = useState([
    { product: "", price: "", quantity: "1", unit: "" },
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

  // Fetch bill data
  useEffect(() => {
    const fetchBillData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
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
        // Set productItems from billData.product (array of items)
        if (billData.product && Array.isArray(billData.product) && billData.product.length > 0) {
          setProductItems(
            billData.product.map((item: any) => ({
              product: item.product,
              price: item.unitPrice.toString(),
              quantity: item.quantity.toString(),
              unit: item.unit || ""
            }))
          );
        } else {
          setProductItems([{ product: "", price: "", quantity: "1", unit: "" }]);
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
  }, [id]);

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
  }, []);

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
      // Always ensure unit exists
      updated[index] = { ...updated[index], [field]: value };
      // If product is changed, auto-fill price and unit
      if (field === "product") {
        const selectedProduct = productChoice.find((p: any) => p.name === value);
        updated[index].price =
          selectedProduct && selectedProduct.price
            ? selectedProduct.price.toString()
            : "";
        updated[index].unit =
          selectedProduct && selectedProduct.unit
            ? selectedProduct.unit.toString()
            : "";
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

  const handleUpdateBill = async () => {
    setError("");
    // Check if all required fields are filled and create array of missing fields
    const missingFields = [];
    if (!cName) missingFields.push(t("bill.customerName"));
    if (!cLastName) missingFields.push(t("bill.customerLastName"));
    if (!cPhone) missingFields.push(t("bill.customerPhone"));
    if (!cGender) missingFields.push(t("bill.customerGender"));
    if (!cAddress) missingFields.push(t("bill.customerAddress"));
    if (!cPostId) missingFields.push(t("bill.customerPostal"));
    if (!cProvince) missingFields.push(t("bill.customerProvince"));
    if (!payment) missingFields.push(t("bill.paymentMethod"));
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
        cGender: cGender as "Female" | "Male",
        cAddress,
        cPostId,
        cProvince,
        payment: payment as "COD" | "Transfer" | "CreditCard" | "Cash",
        cashStatus,
        memberId: memberId || "",
        businessAcc,
        storeId,
        image,
        productItems: productItems.map((item) => ({
          product: item.product,
          unit: item.unit,
          unitPrice: Number(item.price),
          quantity: Number(item.quantity),
        })),
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
      <SafeAreaView className={`flex-1 ${useBackgroundColorClass()}`}>
        <View className="flex-1 justify-center items-center">
          <CustomText>{t("common.loading")}</CustomText>
        </View>
      </SafeAreaView>
    );
  }

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
                  selectedValue={stores.find((store) => store.id === storeId)?.accName || ""}
                  onValueChange={(value:any) => {
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
                  onPress={() => isEditMode ? setCalendarVisible(true) : null}
                  style={{ opacity: isEditMode ? 1 : 0.5 }}
                />
              </View>
            </View>
          </View>
          <View className="flex flex-row justify-between">
            <View className="w-1/2 pr-2">
              <FormFieldClear
                title={t("bill.customerName")}
                value={cName}
                handleChangeText={setCName}
                placeholder={t("bill.enterName")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                editable={isEditMode}
              />
            </View>
            <View className="w-1/2 pr-2">
              <FormFieldClear
                title={t("bill.customerLastName")}
                value={cLastName}
                handleChangeText={setCLastName}
                placeholder={t("bill.enterLastName")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                editable={isEditMode}
              />
            </View>
          </View>

          <View className="flex flex-row justify-between">
            <View className="w-2/3 pr-2">
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
                icons={"call"} // Use the phone icon from constants
                handlePress={() => {
                  Linking.openURL(`tel:${cPhone}`); // Open phone dialer with the number
                }}
                editable={isEditMode}
              />
            </View>
            <View className="w-1/3 pr-2">
              <DropdownClear
                title={t("bill.customerGender")}
                options={[
                  { label: t("bill.gender.male"), value: "Male" },
                  { label: t("bill.gender.female"), value: "Female" },
                ]}
                placeholder={t("bill.selectGender")}
                placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                selectedValue={cGender ? t(`bill.gender.${cGender.toLowerCase()}`) : ""}
                onValueChange={setCGender}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles="mt-2 mb-2"
                disabled={!isEditMode}
              />
            </View>
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
            boxheight={110}
            editable={isEditMode}
          />

          <View className="flex flex-row justify-between">
            <View className="w-2/3 pr-2">
              <FormFieldClear
                title={t("bill.customerProvince")}
                value={cProvince}
                handleChangeText={setCProvince}
                placeholder={t("bill.enterProvince")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                editable={isEditMode}
              />
            </View>
            <View className="w-1/3 pr-2">
              <FormFieldClear
                title={t("bill.customerPostal")}
                value={cPostId}
                handleChangeText={setCPostId}
                placeholder="10400"
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
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
                  onValueChange={(value: string) => handleProductItemChange(idx, "product", value)}
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
                  editable={isEditMode}
                />
              </View>
              <View className="w-1/4 pr-2" style={{ position: "relative" }}>
                <FormFieldClear
                  title={t("bill.amount")}
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
                {/* Show unit if available */}
                {item.unit && (
                  <CustomText className="absolute right-2 top-0 text-xs text-zinc-400">
                    {t(`product.unit.${item.unit}`) || item.unit}
                  </CustomText>
                )}
                {idx !== 0 && isEditMode && (
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

          <View className="flex flex-row justify-between">
            <View className="w-2/3 pr-2">
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
                disabled={!isEditMode}
              />
            </View>
            <View className="w-1/3 pr-2">
              <DropdownClear
                title={t("bill.paymentStatus")}
                options={[
                  { label: t("bill.status.paid"), value: "true" },
                  { label: t("bill.status.unpaid"), value: "false" },
                ]}
                placeholder={t("bill.selectStatus")}
                placeholderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                selectedValue={
                  cashStatus ? t("bill.status.paid") : t("bill.status.unpaid")
                }
                onValueChange={(value: string) => setCashStatus(value === "true")}
                borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles="mt-2 mb-2"
                disabled={!isEditMode}
              />
            </View>
          </View>

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
          <View className="absolute top-0 right-0">
            <TouchableOpacity
              onPress={() => setIsEditMode((prev) => !prev)}
              style={{
                backgroundColor: isEditMode ? "#ff8c00" : "#10f0d2",
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
              {/* <CustomText
                className="text-bas"
                style={{
                  color: "#404040",
                  fontWeight: "bold",
                }}
              >
                {isEditMode
                  ? t("common.editMode")
                  : t("common.readOnly")}
              </CustomText> */}
            </TouchableOpacity>
          </View>
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
