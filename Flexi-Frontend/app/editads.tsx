import { useState, useEffect } from "react";
import CallAPIPlatform from "@/api/platform_api";
import { useTranslation } from "react-i18next";
import { getMemberId } from "@/utils/utility";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { ScrollView, View ,Text} from "react-native";
import CustomButton from "@/components/CustomButton";
import CustomAlert from "@/components/CustomAlert";
import FormField2 from "@/components/FormField2";
import Dropdown2 from "@/components/Dropdown2";
import { useTheme } from "@/providers/ThemeProvider";

export default function EditAds() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [platform, setPlatform] = useState("");
  const [accName, setAccName] = useState("");
  const [accId, setAccId] = useState("");
  const [error, setError] = useState("");

  const fieldStyles = "mt-2 mb-2";

  useEffect(() => {
    const fetchMemberId = async () => {
      const uniqueId = await getMemberId();
      setMemberId(uniqueId);
    };

    const fetchAds = async () => {
      try {
        const ads = await CallAPIPlatform.getAPIaPlatformAPI(Number(id));
        setPlatform(ads.platform);
        setAccName(ads.accName);
        setAccId(ads.accId);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchMemberId();
    fetchAds();
  }, [id]);

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

  // Handle update ads
  const handleUpdateAds = async () => {
    setError("");

    // Check if all fields are filled
    if (!platform || !accName || !accId) {
      setAlertConfig({
        visible: true,
        title: t("product.validation.incomplete"),
        message: t("product.validation.invalidData"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>{
              setAlertConfig((prev) => ({ ...prev, visible: false }))
            router.replace("/ads")}
          },
        ],
      });
      return;
    }

    try {
      // Call the update API
      const data = await CallAPIPlatform.updatePlatformAPI(Number(id), {
        platform,
        accName,
        accId,
        memberId: memberId || "",
      });

      if (data.error) throw new Error(data.error);

      setAlertConfig({
        visible: true,
        title: t("ads.alerts.successTitle"),
        message: t("ads.alerts.successMessage"),
        buttons: [
          {
            text: t("ads.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              // go to ads page
              router.replace("(tabs)/ads");
            },
          },
        ],
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView className={`flex-1  ${useBackgroundColorClass()}`}>
      <ScrollView>
        <View className=" flex-1 justify-center mt-14 h-full px-4 py-5 pb-20">
          <Dropdown2
            title={t("ads.platform")}
            options={[
              {
          label: t("ads.platformOption.Facebook"),
          value: "Facebook",
              },
              {
          label: t("ads.platformOption.Tiktok"),
          value: "Tiktok",
              },
              {
          label: t("ads.platformOption.Shopee"),
          value: "Shopee",                
              },
              {
          label: t("ads.platformOption.Line"),
          value: "Line"
              }
            ]}
            placeholder={t("ads.choosePlatform")}
            selectedValue={t(`ads.platformOption.${platform}`)}
            onValueChange= {setPlatform}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-0 mb-2"
          />
          <FormField2
            title={t("ads.accName")}
            value={accName}
            handleChangeText={setAccName}
            placeholder={t("ads.accNameRecommend")}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor = {theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles={fieldStyles}
          />
          <FormField2
            title={t("ads.accId")}
            value={accId}
            handleChangeText={setAccId}
            otherStyles={fieldStyles}
            placeholder= "00000000000000"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor = {theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            keyboardType="numeric"
          />

          {error ? <Text className="text-red-500 mt-4">{error}</Text> : null}

          <CustomButton
            title={t("ads.createbutton")}
            handlePress={handleUpdateAds}
            containerStyles="mt-5 "
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
