import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/Themed";
import CustomButton from "@/components/CustomButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import FormField2 from "@/components/FormField2";
import { getBusinessId, getMemberId } from "@/utils/utility";
import CallAPIAds from "@/api/ads_api";
import CallAPIPlatform from "@/api/platform_api";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown2 from "@/components/Dropdown2";
import { useTheme } from "@/providers/ThemeProvider";
import { router } from "expo-router";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import CallAPIProduct from "@/api/product_api";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { th } from "date-fns/locale"; // Import Thai locale if needed

export default function createAdsCost() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [adsCost, setAdsCost] = useState("");
  const [product, setProduct] = useState("");
  const [platformId, setPlatformId] = useState<number | null>(null);
  const [businessAcc, setBusinessAcc] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Data for dropdowns
  const [platforms, setPlatforms] = useState<
    Array<{ id: number; platform: string }>
  >([]);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [date, setDate] = useState<string[]>([new Date().toISOString()]);
  const [SelectedDates, setSelectedDates] = useState<string[]>([
    new Date().toISOString(),
  ]);
  // Product choice
  const [productChoice, setProductChoice] = useState<any[]>([]);

  const fieldStyles = "mt-2 mb-2";

  useEffect(() => {
    const fetchMemberId = async () => {
      const uniqueId = await getMemberId();
      const businessId = await getBusinessId();

      setMemberId(uniqueId);
      if (businessId) {
        setBusinessAcc(businessId);
      }
    };

    fetchMemberId();

    // Fetch platforms
    const fetchPlatforms = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          // Changed to use the correct platform API call
          const response = await CallAPIPlatform.getPlatformsAPI(memberId);
          setPlatforms(response || []);
          console.log("Platforms fetched:", response);
        }
      } catch (error) {
        console.error("Error fetching platforms:", error);
        setPlatforms([]);
      }
    };
    fetchPlatforms();

    // Call Api Produt list
    const fetchProductChoice = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIProduct.getProductChoiceAPI(memberId);
          setProductChoice(response || []);
          console.log("Product choice fetched:", response);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductChoice([]);
      }
    };

    fetchProductChoice();
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

  const handleCreateAdsCost = async () => {
    setError("");

    // Check if all fields are filled
    if (!adsCost || !platformId || !businessAcc || !product) {
      setAlertConfig({
        visible: true,
        title: t("adsCost.validation.incomplete"),
        message: t("adsCost.validation.invalidData"),
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
      // Parse adsCost to number
      const adsCostNumber = parseFloat(adsCost);
      if (isNaN(adsCostNumber)) {
        throw new Error(t("adsCost.validation.invalidAmount"));
      }

      // Call API to create ads cost
      const data = await CallAPIAds.createAdsCostAPI({
        date: new Date(date[0]),
        memberId: (await getMemberId()) || "",
        adsCost: adsCostNumber,
        platformId: platformId!,
        businessAcc: businessAcc!,
        product,
      });

      if (data.error) throw new Error(data.error);

      setAlertConfig({
        visible: true,
        title: t("adsCost.alerts.successTitle"),
        message: t("adsCost.alerts.successMessage"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.replace("/ads");
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

    // Update the date state to the first selected date
    if (dates && dates.length > 0) {
      setDate([new Date(dates[0]).toISOString()]);
    }

    setCalendarVisible(false);
  }; // force to chose only one date


  return (
    <SafeAreaView
      className={`flex-1 ${useBackgroundColorClass()}`}
      style={{
        minHeight: Dimensions.get("window").height,
        alignItems: Platform.OS === "web" ? "center" : "center",
      }}
    >
      <ScrollView>
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
                width: "90%",
                backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
                borderRadius: 10,
                padding: 20,
              }}
            >
              <MultiDateCalendar onDatesChange={handleDatesChange} />
            </View>
          </TouchableOpacity>
        </Modal>

        <View className="flex-1 justify-center mt-14 h-full px-4 py-5 pb-20">
       
          {/* Date selector */}
                        <View className="flex-row items-center justify-center bg-transparent mt-8 rounded-full p-2 ml-2">
                          <CustomText
                            className={`text-base mx-2 ${
                              theme === "dark" ? "text-[#c9c9c9]" : "text-[#48453e]"
                            }`}
                          >
                            {SelectedDates.length > 0
                              ? format(new Date(SelectedDates[0]), "dd-MM-yyyy HH:mm", {
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

          {/* Platform Dropdown */}
          <Dropdown2
            title={t("adsCost.platform")}
            options={platforms.map((p) => ({
              label: p.platform,
              value: p.id.toString(),
            }))}
            placeholder={t("adsCost.choosePlatform")}
            selectedValue={platformId?.toString() || ""}
            onValueChange={(value: string) => {
              console.log("Platform selected:", value);
              setPlatformId(parseInt(value));
            }}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-2 mb-2"
          />

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

          {/* Cost Amount Field */}
          <FormField2
            title={t("adsCost.amount")}
            value={adsCost}
            handleChangeText={setAdsCost}
            otherStyles={fieldStyles}
            placeholder="0.00"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            keyboardType="numeric"
          />

          {error ? (
            <CustomText className="text-red-500 mt-4">{error}</CustomText>
          ) : null}

          <CustomButton
            title={t("adsCost.createButton")}
            handlePress={handleCreateAdsCost}
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
