import {
  Dimensions,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { View } from "@/components/Themed";
import {CustomButton, Button } from "@/components/CustomButton";
import FormField from "@/components/formfield/FormField";
import { useRef, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIUser from "@/api/auth_api";
import images from "@/constants/images";
import { t } from "i18next";
import {
  saveBusinessId,
  saveMemberId,
  saveToken,
  saveUserId,
} from "@/utils/utility";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { SafeAreaView } from "react-native-safe-area-context";

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
      return;
    }

    try {
      const response = await CallAPIUser.loginAPI(form);

      // Save token and user details
      saveToken(response.token);
      await AsyncStorage.setItem("isLoggedIn", "true");
      saveUserId(response.user.id);
      saveMemberId(response.user.memberId);
      saveBusinessId(response.user.businessId);

      const emailVerificationRequired =
        response?.emailVerificationRequired ?? !response?.user?.emailVerifiedAt;

      if (emailVerificationRequired) {
        setAlertConfig({
          visible: true,
          title: t("auth.login.emailVerification.title"),
          message: t("auth.login.emailVerification.message"),
          buttons: [
            {
              text: t("auth.login.emailVerification.resend"),
              onPress: async () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                setIsSubmitting(true);
                try {
                  await CallAPIUser.resendVerificationEmailAPI({
                    email: response?.user?.email || form.email,
                  });
                  setAlertConfig({
                    visible: true,
                    title: t("auth.login.emailVerification.sentTitle"),
                    message: t("auth.login.emailVerification.sentMessage"),
                    buttons: [
                      {
                        text: t("common.continue"),
                        onPress: () => {
                          setAlertConfig((prev) => ({ ...prev, visible: false }));
                          router.replace("/(tabs)/home");
                        },
                      },
                    ],
                  });
                } catch (e: any) {
                  const errorMessage =
                    e?.message ||
                    "auth.login.emailVerification.resendFailed";
                  setAlertConfig({
                    visible: true,
                    title: t("common.error"),
                    message: t(errorMessage),
                    buttons: [
                      {
                        text: t("common.ok"),
                        onPress: () =>
                          setAlertConfig((prev) => ({ ...prev, visible: false })),
                      },
                    ],
                  });
                } finally {
                  setIsSubmitting(false);
                }
              },
            },
            {
              text: t("common.continue"),
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                router.replace("/(tabs)/home");
              },
            },
          ],
        });
        return;
      }

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
    } catch (error: any) {
      // Handle login error properly
      console.error("Login error:", error instanceof Error ? error.message : "Unknown error");

      let errorMessage = "auth.login.alerts.genericError";

      // Extract meaningful error message
      if (error && typeof error === "object") {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        }
      }

      // Special handling: missing business account -> offer choices
      if (errorMessage === "Business account not found") {
        // Attempt to persist token/user if backend still returned them (some APIs may include partial success data)
        try {
          if (error?.token) saveToken(error.token);
          if (error?.user?.id) saveUserId(error.user.id);
          if (error?.user?.memberId) saveMemberId(error.user.memberId);
        } catch {}
        setAlertConfig({
          visible: true,
          title: t("auth.login.alerts.error"),
          message: t("auth.login.alerts.businessAccountNotFound"),
          buttons: [
            {
              text: t("auth.login.alerts.partnerOption"),
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                // Navigate to a partner onboarding screen (placeholder). Adjust route if a dedicated screen exists.
                // Use object form with cast to satisfy type until route types regenerate
                router.push({ pathname: "/partner" } as any);
              },
            },
            {
              text: t("auth.login.alerts.registerBusinessOption"),
              onPress: async () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                const storedUserId = await AsyncStorage.getItem("userId");
                const storedMemberId = await AsyncStorage.getItem("memberId");
                router.push({
                  pathname: "/business_register",
                  params: {
                    ...(storedUserId ? { userId: storedUserId } : {}),
                    ...(storedMemberId ? { uniqueId: storedMemberId } : {}),
                  },
                });
              },
            },
            {
              text: t("common.cancel"),
              style: "cancel",
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      } else {
        setAlertConfig({
          visible: true,
          title: t("auth.login.alerts.error"),
          message: t(errorMessage),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="h-full"
      >
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled">
          <View
            className="w-full flex justify-center h-full px-4"
            style={{
              minHeight: Dimensions.get("window").height,
              alignItems: Platform.OS === "web" ? "center" : "center",
            }}
          >
            <View
              style={{
                width: Dimensions.get("window").width > 768 ? "40%" : "100%",
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
                className={`text-2xl font-bold mt-4 py-1 ${useTextColorClass()}`}
              >
                {t("auth.login.title")}
              </CustomText>

              <FormField
                title={t("auth.login.emailPlaceholder")}
                placeholder={t("auth.login.emailPlaceholder")}
                value={form.email}
                handleChangeText={(e: any) => setForm({ ...form, email: e.toLowerCase() })}
                otherStyles="mt-7 dark:text-white"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  },150);
                }}
              />

              <FormField
                title={t("auth.login.passwordPlaceholder")}
                placeholder={t("auth.login.passwordPlaceholder")}
                value={form.password}
                handleChangeText={(e: any) => setForm({ ...form, password: e })}
                otherStyles="mt-7"
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
                secureTextEntry={true}
              />

              <CustomButton
                title={t("auth.login.button")}
                handlePress={submit}
                containerStyles="mt-7"
                textStyles="!text-white"
                isLoading={isSubmitting}
              />

              <View className="flex justify-center  items-center pt-5 flex-row gap-6">
                <Button
                  title={t("auth.login.registerButton")}
                  onPress={() => router.replace("/register")}
                />
                <Button
                  title={t("auth.login.ForgotPasswordButton")}
                  onPress={() => router.replace("/forgot_password")}
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
