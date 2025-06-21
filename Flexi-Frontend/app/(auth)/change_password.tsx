import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { CustomText } from "@/components/CustomText";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import CallAPIUser from "@/api/auth_api";
import { router } from "expo-router";
import { ShieldCheck } from "@/components/ui/lucide-react";

export default function ChangePassword() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert configuration state
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

  // Handle password change
  const handleChangePassword = async () => {
    setError("");
    setIsSubmitting(true);

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("profile.password.validation.allFields"));
      setIsSubmitting(false);
      return;
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      setError(t("profile.password.validation.passwordsDoNotMatch"));
      setIsSubmitting(false);
      return;
    }

    // Check if password meets minimum requirements (at least 6 characters)
    if (newPassword.length < 6) {
      setError(t("profile.password.validation.passwordTooShort"));
      setIsSubmitting(false);
      return;
    }

    try {
      // Call API to change password
      const response = await CallAPIUser.changePasswordAPI({
        currentPassword,
        newPassword,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Show success message
      setAlertConfig({
        visible: true,
        title: t("profile.password.success.title"),
        message: t("profile.password.success.message"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              // Navigate back to settings
              router.back();
            },
          },
        ],
      });
    } catch (error: any) {
      setError(error.message || t("profile.password.error.generalError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
         contentContainerStyle={{
          padding: 20,
  
          flexGrow: 1,
        }}>
          <View
            className="flex-1 px-4 py-10"
            style={{
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: Dimensions.get("window").width > 768 ? "50%" : "100%",
                maxWidth: 500,
              }}
            >
              {/* Password Security Icon */}
              <View className="items-center mb-6">
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor:
                      theme === "dark"
                        ? "rgba(78, 218, 192, 0.1)"
                        : "rgba(78, 218, 192, 0.1)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <ShieldCheck
                    size={40}
                    color={theme === "dark" ? "#0feac2" : "#0feac2"}
                  />
                </View>

                <CustomText
                  weight="bold"
                  className={`text-2xl ${useTextColorClass()}`}
                >
                  {t("profile.password.title") || "Change Password"}
                </CustomText>

                <CustomText
                  className={`text-center mt-2 px-4 ${useTextColorClass()}`}
                  style={{ opacity: 0.7 }}
                >
                  {t("profile.password.subtitle") ||
                    "Keep your account secure with a strong password"}
                </CustomText>
              </View>

              {/* Password Change Form */}
              <View className="w-full mt-4">
                <FormField
                  title={
                    t("profile.password.currentPassword") || "Current Password"
                  }
                  placeholder={
                    t("profile.password.enterCurrentPassword") ||
                    "Enter your current password"
                  }
                  value={currentPassword}
                  handleChangeText={setCurrentPassword}
                  otherStyles="mt-4"
                  secureTextEntry
                />

                <FormField
                  title={t("profile.password.newPassword") || "New Password"}
                  placeholder={
                    t("profile.password.enterNewPassword") ||
                    "Enter new password"
                  }
                  value={newPassword}
                  handleChangeText={setNewPassword}
                  otherStyles="mt-7"
                  secureTextEntry
                />

                <FormField
                  title={
                    t("profile.password.confirmPassword") ||
                    "Confirm New Password"
                  }
                  placeholder={
                    t("profile.password.confirmNewPassword") ||
                    "Confirm new password"
                  }
                  value={confirmPassword}
                  handleChangeText={setConfirmPassword}
                  otherStyles="mt-7"
                  secureTextEntry
                />

                {error ? (
                  <CustomText className="text-red-500 mt-4 text-center">
                    {error}
                  </CustomText>
                ) : null}

                <CustomButton
                  title={
                    t("profile.password.changeButton") || "Change Password"
                  }
                  handlePress={handleChangePassword}
                  containerStyles="mt-8"
                  textStyles="!text-white"
                  isLoading={isSubmitting}
                />

                <CustomButton
                  title={t("common.cancel") || "Cancel"}
                  handlePress={() => router.push("/settings")}
                  containerStyles="mt-4 bg-transparent "                  
                  textStyles={
                    theme === "dark" ? "!text-zinc-300" : "!text-zinc-700"
                  }
                  variant="outline"
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
