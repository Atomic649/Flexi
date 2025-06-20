import {
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
} from "react-native";
import { View } from "@/components/Themed";
import FormField from "@/components/FormField";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import Dropdown from "@/components/Dropdown";
import CallAPIBusiness from "@/api/business_api";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";

export default function Register() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { userId, uniqueId } = useLocalSearchParams();
  const [businessName, setbusinessName] = useState("");
  const [taxType, settaxType] = useState("");
  const [vatId, setvatId] = useState("");
  const [businessType, setbusinessType] = useState("");
  const [error, setError] = useState("");

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

  // Handle register
  const handleRegister = async () => {
    setError("");

    // Check if all fields are filled
    if (!businessName || !taxType || !vatId || !businessType) {
      setAlertConfig({
        visible: true,
        title: t("auth.register.validation.incomplete"),
        message: t("auth.register.validation.invalidData"),
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

    console.log("userId", userId);
    console.log("uniqueId", uniqueId);

    try {
      // Call the register API
      const data = await CallAPIBusiness.RegisterAPI({
        businessName,
        vatId,
        businessType,
        taxType,
        userId: Number(userId),
        memberId: uniqueId,
      });

      if (data.error) throw new Error(data.error);

      setAlertConfig({
        visible: true,
        title: t("auth.register.alerts.success"),
        message: t("auth.register.alerts.successMessage"),
        buttons: [
          {
            text: t("auth.register.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.replace("/login");
            },
          },
        ],
      });

      // go to login page
      router.replace("/login");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="h-full"
      >
        <ScrollView contentContainerStyle={{ height: "100%" }}>
          <View
            className="w-full flex justify-center h-full px-4"
            style={{
              minHeight: Dimensions.get("window").height,
              alignItems: Platform.OS === "web" ? "center" : "stretch",
            }}
          >
            <View
              style={{
                width: Dimensions.get("window").width > 768 ? "40%" : "100%",
                maxWidth: 600,
              }}
            >
                <CustomText className={`text-2xl font-bold mt-4 justify-center ${useTextColorClass()}`}>
                {t("auth.businessRegister.title")}
                </CustomText>

              <FormField
                title={t("auth.businessRegister.businessName")}
                placeholder={t("auth.businessRegister.businessName")}
                value={businessName}
                handleChangeText={setbusinessName}
                otherStyles="mt-7"
              />

              <Dropdown
                title={t("auth.businessRegister.taxType")}
                options={[
                  {
                    label: t("auth.businessRegister.taxTypeOption.Individual"),
                    value: "Individual",
                  },
                  {
                    label: t("auth.businessRegister.taxTypeOption.Juristic"),
                    value: "Juristic",
                  },
                ]}
                placeholder={t("auth.businessRegister.taxType")}
                onValueChange={settaxType}
                selectedValue={t(
                  `auth.businessRegister.taxTypeOption.${taxType}`
                )}
                otherStyles="mt-7"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                
              />

              <FormField
                title={t("auth.businessRegister.vatId")}
                placeholder={t("0000000000000")}
                value={vatId}
                handleChangeText={setvatId}
                otherStyles="mt-7"
                keyboardType="number-pad"
              />

              <Dropdown
                title={t("auth.businessRegister.businessType")}
                options={[
                  {
                    label: t(
                      "auth.businessRegister.businessTypeOption.OnlineSale"
                    ),
                    value: "OnlineSale",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Massage"),
                    value: "Massage",
                  },
                  {
                    label: t(
                      "auth.businessRegister.businessTypeOption.Restaurant"
                    ),
                    value: "Restaurant",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Bar"),
                    value: "Bar",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Cafe"),
                    value: "Cafe",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Hotel"),
                    value: "Hotel",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Tutor"),
                    value: "Tutor",
                  },
                  {
                    label: t(
                      "auth.businessRegister.businessTypeOption.Influencer"
                    ),
                    value: "Influencer",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Other"),
                    value: "Other",
                  },
                ]}
                placeholder={t(
                  "auth.businessRegister.chooseBusinessType"
                )}
                selectedValue={t(
                  `auth.businessRegister.businessTypeOption.${businessType}`
                )}
                onValueChange={setbusinessType}
                otherStyles="mt-7"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              />

              {error ? (
                <Text className="text-red-500 mt-4">{error}</Text>
              ) : null}

              <CustomButton
                title={t("auth.register.button")}
                handlePress={handleRegister}
                containerStyles="mt-7"
                textStyles="!text-white"
              />
            </View>
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
    </SafeAreaView>
  );
}
