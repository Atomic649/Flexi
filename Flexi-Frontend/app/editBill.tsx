import {
  Dimensions,
  Platform,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { View } from "@/components/Themed";
import CustomButton from "@/components/CustomButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import FormField2 from "@/components/FormField2";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import CallAPIProduct from "@/api/product_api";
import CallAPIBill from "@/api/bill_api";
import CallAPIStore from "@/api/store_api";
import Dropdown2 from "@/components/Dropdown2";
import { useTheme } from "@/providers/ThemeProvider";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { getBusinessId, getMemberId } from "@/utils/utility";

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

  // Customer information
  const [cName, setCName] = useState("");
  const [cLastName, setCLastName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cGender, setCGender] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cPostId, setCPostId] = useState("");
  const [cProvince, setCProvince] = useState("");

  // Product information
  const [product, setProduct] = useState("");
  const [payment, setPayment] = useState("");
  const [amount, setAmount] = useState("");
  const [platform, setPlatform] = useState("");
  const [cashStatus, setCashStatus] = useState(false);
  const [price, setPrice] = useState("");
  const [businessAcc, setBusinessAcc] = useState(0);
  const [image, setImage] = useState("");

  // Product choice
  const [productChoice, setProductChoice] = useState<any[]>([]);

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

        // Set all the bill data to the state
        setCName(billData.cName);
        setCLastName(billData.cLastName);
        setCPhone(billData.cPhone);
        setCGender(billData.cGender);
        setCAddress(billData.cAddress);
        setCPostId(billData.cPostId);
        setCProvince(billData.cProvince);
        setProduct(billData.product);
        setPayment(billData.payment);
        setAmount(billData.amount.toString());
        setPlatform(billData.platform);
        setCashStatus(billData.cashStatus);
        setPrice(billData.price.toString());
        setStoreId(billData.storeId);
        setImage(billData.image);

        // Set purchase date
        if (billData.purchaseAt) {
          const purchaseDate = new Date(billData.purchaseAt);
          setPurchaseAt(purchaseDate);
          setSelectedDates([purchaseDate.toISOString()]);
          setDate([purchaseDate.toISOString()]);
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

    // Call Api Product list
    const fetchProductChoice = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIProduct.getProductChoiceAPI(memberId);
          setProductChoice(response || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductChoice([]);
      }
    };

    fetchProductChoice();
  }, []);

  const validatePhone = (phone: string) => {
    return phone.length === 10 && /^\d+$/.test(phone);
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
    if (!product) missingFields.push(t("bill.productName"));
    if (!payment) missingFields.push(t("bill.paymentMethod"));
    if (!amount) missingFields.push(t("bill.amount"));
    if (!price) missingFields.push(t("bill.price"));
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
        product,
        payment: payment as "COD" | "Transfer" | "CreditCard",
        amount: Number(amount),
        cashStatus,
        price: Number(price),
        memberId: memberId || "",
        businessAcc,
        storeId,
        image,
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
              router.replace("/");
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
              width: "40%",
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
                <Dropdown2
                  title={t("bill.store")}
                  options={stores.map((store) => ({
                    label: store.accName,
                    value: store.id.toString(),
                  }))}
                  placeholder={t("bill.selectStore")}
                  selectedValue={
                    stores.find((store) => store.id === storeId)?.accName ||
                    t("bill.selectStore")
                  }
                  onValueChange={(value: any) => setStoreId(Number(value))}
                  bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
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
                  {selectedDates.length > 0
                    ? format(new Date(selectedDates[0]), "dd-MM-yyyy HH:mm", {
                        locale: th,
                      })
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
          <View className="flex flex-row justify-between">
          <View className="w-1/2 pr-2">
          <FormField2
            title={t("bill.customerName")}
            value={cName}
            handleChangeText={setCName}
            placeholder={t("bill.enterName")}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles={fieldStyles}
          />
            </View>
            <View className="w-1/2 pr-2">

          <FormField2
            title={t("bill.customerLastName")}
            value={cLastName}
            handleChangeText={setCLastName}
            placeholder={t("bill.enterLastName")}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles={fieldStyles}
          />
          </View>
            </View>
          
          <View className="flex flex-row justify-between">
            <View className="w-2/3 pr-2">
              <FormField2
                title={t("bill.customerPhone")}
                value={cPhone}
                handleChangeText={setCPhone}
                placeholder="0812345678"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View className="w-1/3 pr-2">
              <Dropdown2
                title={t("bill.customerGender")}
                options={[
                  { label: t("bill.gender.male"), value: "Male" },
                  { label: t("bill.gender.female"), value: "Female" },
                ]}
                placeholder={t("bill.selectGender")}
                selectedValue={
                  cGender === "Male"
                    ? t("bill.gender.male")
                    : cGender === "Female"
                    ? t("bill.gender.female")
                    : t("bill.selectGender")
                }
                onValueChange={setCGender}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles="mt-2 mb-2"
              />
            </View>
          </View>

          <FormField2
            title={t("bill.customerAddress")}
            value={cAddress}
            handleChangeText={setCAddress}
            placeholder={t("bill.enterAddress")}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles={fieldStyles}
            multiline
          />
          
          <View className="flex flex-row justify-between">
            <View className="w-2/3 pr-2">
              <FormField2
                title={t("bill.customerProvince")}
                value={cProvince}
                handleChangeText={setCProvince}
                placeholder={t("bill.enterProvince")}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
              />
            </View>
            <View className="w-1/3 pr-2">
              <FormField2
                title={t("bill.customerPostal")}
                value={cPostId}
                handleChangeText={setCPostId}
                placeholder="10400"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View className="flex flex-row justify-between">
            <View className="w-2/3 pr-2">
            <Dropdown2
                title={t("bill.productName")}
                options={productChoice.map((product) => ({
                  label: product.name,
                  value: product.name,
                }))}
                placeholder={t("bill.selectProduct")}
                selectedValue={product || t("bill.selectProduct")}
                onValueChange={setProduct}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles="mt-2 mb-2"
              />
            </View>
            <View className="w-1/3 pr-2">
              <FormField2
                title={t("bill.price")}
                value={price}
                handleChangeText={setPrice}
                placeholder="1000"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View className="flex flex-row justify-between">
            <View className="w-2/3 pr-2">
              <Dropdown2
                title={t("bill.paymentMethod")}
                options={[
                  { label: t("bill.payment.cod"), value: "COD" },
                  { label: t("bill.payment.transfer"), value: "Transfer" },
                  { label: t("bill.payment.creditCard"), value: "CreditCard" },
                ]}
                placeholder={t("bill.selectPayment")}
                selectedValue={
                  payment
                    ? payment === "COD"
                      ? t("bill.payment.cod")
                      : payment === "Transfer"
                      ? t("bill.payment.transfer")
                      : payment === "CreditCard"
                      ? t("bill.payment.creditCard")
                      : t("bill.selectPayment")
                    : t("bill.selectPayment")
                }
                onValueChange={setPayment}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles="mt-2 mb-2"
              />
            </View>
            <View className="w-1/3 pr-2">
              <FormField2
                title={t("bill.amount")}
                value={amount}
                handleChangeText={setAmount}
                placeholder="1"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Dropdown2
            title={t("bill.paymentStatus")}
            options={[
              { label: t("bill.status.paid"), value: "true" },
              { label: t("bill.status.unpaid"), value: "false" },
            ]}
            placeholder={t("bill.selectStatus")}
            selectedValue={
              cashStatus ? t("bill.status.paid") : t("bill.status.unpaid")
            }
            onValueChange={(value: string) => setCashStatus(value === "true")}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-2 mb-2"
          />

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

            <CustomButton
              title={t("bill.updateButton")}
              handlePress={handleUpdateBill}
              containerStyles="mt-5 w-2/3"
              textStyles="!text-white"
            />
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
