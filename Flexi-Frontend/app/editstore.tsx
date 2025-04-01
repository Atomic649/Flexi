import { useState, useEffect } from "react";
import CallAPIPlatform from "@/api/platform_api";
import CallAPIStore from "@/api/store_api"; // Adjust the import path as necessary
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

export default function EditStore() {
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
          const ads = await CallAPIStore.getAStoreAPI(Number(id));
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
    const handleUpdateStore = async () => {
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
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
        return;
      }
  
      try {
        // Call the update API
        const data = await CallAPIStore.updateStoreAPI(Number(id), {
          platform,
          accName,
          accId,
          memberId: memberId || "",
        });
  
        if (data.error) throw new Error(data.error);
  
        setAlertConfig({
          visible: true,
          title: t("store.alerts.successTitle"),
          message: t("store.alerts.successMessage"),
          buttons: [
            {
              text: t("store.alerts.ok"),
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                // go to store page
                router.replace("(tabs)/store");
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
            title={t("store.platform")}
            options={[
              {
          label: t("store.platformOption.Facebook"),
          value: "Facebook",
              },
              {
          label: t("store.platformOption.Tiktok"),
          value: "Tiktok",
              },
              {
          label: t("store.platformOption.Shopee"),
          value: "Shopee",                
              },
              {
          label: t("store.platformOption.Line"),
          value: "Line"
              }
            ]}
            placeholder={t("store.choosePlatform")}
            selectedValue={t(`store.platformOption.${platform}`)}
            onValueChange= {setPlatform}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-0 mb-2"
          />
          <FormField2
            title={t("store.accName")}
            value={accName}
            handleChangeText={setAccName}
            placeholder={t("store.accNameRecommend")}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor = {theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles={fieldStyles}
          />
          <FormField2
            title={t("store.accId")}
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
            title={t("store.createbutton")}
            handlePress={handleUpdateStore}
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

