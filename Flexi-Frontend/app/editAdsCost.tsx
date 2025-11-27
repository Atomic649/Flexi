import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/Themed";
import { CustomButton } from "@/components/CustomButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import FormField2 from "@/components/formfield/FormField2";
import { getBusinessId, getMemberId } from "@/utils/utility";
import CallAPIAds from "@/api/ads_api";
import CallAPIPlatform from "@/api/platform_api";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown2 from "@/components/dropdown/Dropdown2";
import { useTheme } from "@/providers/ThemeProvider";
import { router, useLocalSearchParams } from "expo-router";
import CallAPIProduct from "@/api/product_api";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { Ionicons } from "@expo/vector-icons";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  let hours = parsedDate.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

export default function EditAdsCost() {
  const { id, date: dateParam, expenses, desc } = useLocalSearchParams<{
    id?: string;
    date?: string;
    expenses?: string;
    desc?: string;
  }>();
  const normalizedId = Array.isArray(id) ? id[0] : id
  console.log("Received AdsCost ID param:", normalizedId);
  const normalizedDateParam = Array.isArray(dateParam) ? dateParam[0] : dateParam;
  const normalizedExpenses = Array.isArray(expenses) ? expenses[0] : expenses;
  const normalizedDesc = Array.isArray(desc) ? desc[0] : desc;
  const adsCostId = normalizedId ? Number(normalizedId) : null
  console.log("Editing AdsCost ID:", adsCostId);
  const fallbackDate = useMemo(() => {
    if (normalizedDateParam) {
      const parsed = new Date(normalizedDateParam);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    return new Date().toISOString();
  }, [normalizedDateParam]);

  const { theme } = useTheme();
  const { t } = useTranslation();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [adsCost, setAdsCost] = useState(
    normalizedExpenses ? String(normalizedExpenses) : ""
  );
  const [product, setProduct] = useState<string>(
    typeof normalizedDesc === "string" ? normalizedDesc : ""
  );
  const [platformId, setPlatformId] = useState<number | null>(null);
  const [businessAcc, setBusinessAcc] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [platforms, setPlatforms] = useState<
    Array<{ id: number; platform: string; accName: string }>
  >([]);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [date, setDate] = useState<string[]>([fallbackDate]);
  const [selectedDates, setSelectedDates] = useState<string[]>([fallbackDate]);
  const [productChoice, setProductChoice] = useState<any[]>([]);

  const fieldStyles = "mt-2 mb-2";

  useEffect(() => {
    const fetchInitialData = async () => {
      const uniqueId = await getMemberId();
      const businessId = await getBusinessId();

      setMemberId(uniqueId);
      if (businessId) {
        setBusinessAcc(businessId);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const uid = await getMemberId();
        if (uid) {
          const response = await CallAPIPlatform.getPlatformsAPI(uid);
          setPlatforms(response || []);
        }
      } catch (fetchError) {
        console.error("Error fetching platforms:", fetchError);
        setPlatforms([]);
      }
    };

    fetchPlatforms();
  }, []);

  useEffect(() => {
    const fetchProductChoice = async () => {
      try {
        const uid = await getMemberId();
        if (uid) {
          const response = await CallAPIProduct.getProductChoiceAPI(uid);
          setProductChoice(response || []);
        }
      } catch (fetchError) {
        console.error("Error fetching products:", fetchError);
        setProductChoice([]);
      }
    };

    fetchProductChoice();
  }, []);

  const fetchAdsCostDetails = useCallback(async () => {
    if (!adsCostId) return;    
    setIsLoadingDetails(true);
    try {
        console.log("Fetching details for AdsCost ID:", adsCostId);
      const response = await CallAPIAds.getAdsCostById(adsCostId);
      if (response) {
        setAdsCost(response.adsCost ? String(response.adsCost) : "");
        setProduct(response.product || "");
        setPlatformId(response.platformId || null);
        if (response.businessAcc) {
          setBusinessAcc(response.businessAcc);
        }

        if (response.date) {
          const normalizedDate = new Date(response.date).toISOString();
          setDate([normalizedDate]);
          setSelectedDates([normalizedDate]);
        }
      }
    } catch (fetchError: any) {
      console.error("Error fetching ads cost details:", fetchError);
      setError(fetchError?.message || t("ads.errors.fetchFailed"));
    } finally {
      setIsLoadingDetails(false);
    }
  }, [adsCostId, t]);

  useEffect(() => {
    fetchAdsCostDetails();
  }, [fetchAdsCostDetails]);

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

  const handleUpdateAdsCost = async () => {
    setError("");

    if (!adsCostId) {
      setError(t("ads.validation.missingRecord"));
      return;
    }

    if (!adsCost || !platformId || !businessAcc || !product) {
      setAlertConfig({
        visible: true,
        title: t("ads.validation.incomplete"),
        message: t("ads.validation.invalidData"),
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
      const adsCostNumber = parseFloat(adsCost);
      if (isNaN(adsCostNumber)) {
        throw new Error(t("adsCost.validation.invalidAmount"));
      }

      const primaryDateValue = date[0] ? new Date(date[0]) : new Date();

      const payload = {
        date: primaryDateValue,
        memberId: memberId || (await getMemberId()) || "",
        adsCost: adsCostNumber,
        platformId: platformId!,
        businessAcc: businessAcc!,
        product,
      };

      const response = await CallAPIAds.updateAdsCostAPI(adsCostId, payload);

      if (response?.error) {
        throw new Error(response.error);
      }

      setAlertConfig({
        visible: true,
        title: t("ads.alerts.successTitleUpdated"),
        message: t("ads.alerts.successMessage") ||
          t("ads.alerts.successMessage"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.replace("/expense");
            },
          },
        ],
      });
    } catch (updateError: any) {
      console.error("Error updating ads cost:", updateError);
      setError(updateError?.message || t("ads.errors.updateFailed"));
    }
  };

  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    if (dates && dates.length > 0) {
      const normalized = new Date(dates[0]).toISOString();
      setDate([normalized]);
    }

    setCalendarVisible(false);
  };

  const selectedPlatformLabel = platformId
    ? platforms.find((p) => p.id === platformId)?.accName ||
      platforms.find((p) => p.id === platformId)?.platform ||
      ""
    : "";

  return (
    <SafeAreaView
      className={`flex-1 ${useBackgroundColorClass()}`}
      style={{
        minHeight: Dimensions.get("window").height,
        alignItems: Platform.OS === "web" ? "center" : "center",
      }}
    >
      <ScrollView>
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
            <Ionicons
              name="calendar"
              size={24}
              color={theme === "dark" ? "#ffffff" : "#444541"}
              onPress={() => setCalendarVisible(true)}
            />
          </View>

          <Dropdown2
            title={t("ads.adsAccount")}
            options={platforms.map((p) => ({
              label: p.accName || p.platform,
              value: p.id.toString(),
            }))}
            placeholder={t("ads.chooseAdsAccount")}
            selectedValue={selectedPlatformLabel}
            onValueChange={(value: string) => {
              setPlatformId(parseInt(value));
            }}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-2 mb-2"
          />

          <Dropdown2
            title={t("bill.productName")}
            options={productChoice.map((choice) => ({
              label: choice.name,
              value: choice.name,
            }))}
            placeholder={t("bill.selectProduct")}
            selectedValue={product || t("bill.selectProduct")}
            onValueChange={setProduct}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-2 mb-2"
          />

          <FormField2
            title={t("ads.amount")}
            value={adsCost}
            handleChangeText={setAdsCost}
            otherStyles={fieldStyles}
            placeholder="0.00"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            keyboardType="numeric"
          />

          {isLoadingDetails ? (
            <CustomText className="mt-4 text-center">
              {t("common.loading")}
            </CustomText>
          ) : null}

          {error ? (
            <CustomText className="text-red-500 mt-4">{error}</CustomText>
          ) : null}

          <CustomButton
            title={t("common.save")}
            handlePress={handleUpdateAdsCost}
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
