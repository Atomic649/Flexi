import {
  Dimensions,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { View } from "@/components/Themed";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import { useState } from "react";
import Button from "@/components/Button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIUser from "@/api/auth_api";
import images from "@/constants/images";
import { t } from "i18next";
import { saveBusinessId, saveMemberId, saveToken, saveUserId } from "@/utils/utility";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";

export default function Login() {
  // State variables for email and password
  const [form, setForm] = useState(
    {
      email: "",
      password: "",
    }
    // email: "rukoontananya@gmail.com",
    // password: "123456",
  );

  // State variable for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Function to handle form submission
  const submit = async () => {
    setIsSubmitting(true);

    if (form.email === "" || form.password === "") {
      setAlertConfig({
        visible: true,
        title: t("auth.login.validation.incomplete"),
        message: t("auth.login.validation.invalidData"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
      setIsSubmitting(false);
      return
      
      ;
    }

    const { error, token, user } = await CallAPIUser.loginAPI(form);

    if (error) {
      setAlertConfig({
        visible: true,
        title: t("auth.login.alerts.error"),
        message: typeof error.message === "string" ? error.message : t("auth.login.alerts.genericError"), // Ensure message is a string
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } else {
      // Save token and user details
      saveToken(token);
      await AsyncStorage.setItem("isLoggedIn", "true");
      saveUserId(user.id);
      saveMemberId(user.memberId);
      saveBusinessId(user.businessId);

      setAlertConfig({
        visible: true,
        title: t("auth.login.alerts.success"),
        message: t("auth.login.alerts.successMessage"),
        buttons: [
          {
            text: t("auth.login.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.replace("/(tabs)/home");
            },
          },
        ],
      });
    }

    setIsSubmitting(false);
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
              alignItems: Platform.OS === "web" ? "center" : "center",
            }}
          >
            <View
              style={{
                width: Dimensions.get("window").width > 768  ? "40%" : "100%",
                maxWidth: 600,
              }}
            >
              <View className="flex items-center">
                <Image
                  source={images.logo}
                  resizeMode="contain"
                  className="h-[190px]"
                  style={{
                    height: Platform.OS === "web" ? 100 : 190,
                    width: Platform.OS === "web" ? 150 : 190,
                  }}
                />
              </View>

              <CustomText
                className={`text-2xl font-bold mt-4 ${useTextColorClass()}`}
              >
                {t("auth.login.title")}
              </CustomText>

              <FormField
                title={t("auth.login.emailPlaceholder")}
                placeholder={t("auth.login.emailPlaceholder")}
                value={form.email}
                handleChangeText={(e: any) => setForm({ ...form, email: e })}
                otherStyles="mt-7 dark:text-white"
                keyboardType="email-address"
              />

              <FormField
                title={t("auth.login.passwordPlaceholder")}
                placeholder={t("auth.login.passwordPlaceholder")}
                value={form.password}
                handleChangeText={(e: any) => setForm({ ...form, password: e })}
                otherStyles="mt-7"
              />

              <CustomButton
                title={t("auth.login.button")}
                handlePress={submit}
                containerStyles="mt-7"
                textStyles="!text-white"
                isLoading={isSubmitting}
              />

              <View className="flex justify-center pt-5 flex-row gap-2">
                <CustomText weight="regular" className="text-lg">
                  {t("auth.login.noAccount")}
                </CustomText>
                <Button
                  title={t("auth.login.registerButton")}
                  onPress={() => router.replace("/register")}
                />
              </View>
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
