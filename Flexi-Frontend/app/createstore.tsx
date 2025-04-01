import { ScrollView } from "react-native";
import { View } from "@/components/Themed";
import CustomButton from "@/components/CustomButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import FormField2 from "@/components/FormField2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMemberId } from "@/utils/utility";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown2 from "@/components/Dropdown2";
import CallAPIStore from "@/api/store_api";
import { useTheme } from "@/providers/ThemeProvider";
import { router } from "expo-router";

export default function CreateStore() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [platform, setPlatform] = useState("");
  const [accName, setAccName] = useState("");
  const [accId, setAccId] = useState("");
  const [error, setError] = useState("");

  const fieldStyles = "mt-2 mb-2";

  useEffect(() => {
    const fetchMemberId = async () => {
      const uniqueId = await AsyncStorage.getItem("uniqueId");
      setMemberId(uniqueId);
    };

    fetchMemberId();
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

  const handleCreatePlatform = async () => {
    setError("");

    // Check if all fields are filled
    if (!platform || !accName || !accId) {
      setAlertConfig({
        visible: true,
        title: t("store.validation.incomplete"),
        message: t("store.validation.invalidData"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>{
              setAlertConfig((prev) => ({ ...prev, visible: false }))
            router.replace("/store")}
          },
        ],
      });
      return;
    }

    try {
      // Call API to create platform
      const data = await CallAPIStore.createStoreAPI({
        platform,
        accName,
        accId,
        memberId: (await getMemberId()) || "",
      });
      if (data.error) throw new Error(data.error);
      setAlertConfig({
        visible: true,
        title: t("store.alerts.successTitle"),
        message: t("store.alerts.successMessage"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
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
          label: t("store.platformOption.SCB"),
          value: "SCB",
              },
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
          value: "Line",
              },
            ]}
            placeholder={t("store.choosePlatform")}
            selectedValue={t(`store.platformOption.${platform}`)}
            onValueChange={setPlatform}
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
            placeholder="00000000000000"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor = {theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            keyboardType="numeric"
          />

          {error ? <CustomText className="text-red-500 mt-4">{error}</CustomText> : null}

          <CustomButton
            title={t("store.createbutton")}
            handlePress={handleCreatePlatform}
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
