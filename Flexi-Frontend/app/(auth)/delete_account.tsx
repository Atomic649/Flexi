import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "@/components/CustomButton";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import FormField2 from "@/components/FormField2";
import CallAPIUser from "@/api/auth_api";
import { getUserId, removeToken, removeMemberId, removeBusinessId, getMemberId } from "@/utils/utility";

export default function DeleteAccount() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  
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

  // Get the user ID when component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!password) {
      setAlertConfig({
        visible: true,
        title: t("profile.delete.validation.incomplete") || "Validation Error",
        message: t("profile.delete.validation.passwordRequired") || "Password is required to delete your account",
        buttons: [
          {
            text: t("common.ok") || "OK",
            onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
      return;
    }

    // Show confirmation alert
    setAlertConfig({
      visible: true,
      title: t("profile.delete.confirmation.title") || "Delete Account",
      message: t("profile.delete.confirmation.message") || "This action will permanently delete your account and all associated data. This cannot be undone. Are you sure?",
      buttons: [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
        {
          text: t("profile.delete.confirmation.deleteButton") || "Delete",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ],
    });
  };

  // Handle actual account deletion
  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");

    try {
    // Get the member ID from local storage
      const memberId = await getMemberId();
      if (!memberId) {
        throw new Error(t("profile.delete.errors.userNotFound") || "User ID not found");
      }

      // Call API to permanently delete user account with password verification
      const response = await CallAPIUser.deleteUserAPI(memberId, { password });

      if (response.error) {
        throw new Error(response.error);
      }

      // Clear all local storage data
      await AsyncStorage.clear();
      await removeToken();
      await removeMemberId();
      await removeBusinessId();
      await AsyncStorage.setItem("isLoggedIn", "false");

      // Show success message and redirect to landing page
      setAlertConfig({
        visible: true,
        title: t("profile.delete.success.title") || "Account Deleted",
        message: t("profile.delete.success.message") || "Your account has been successfully deleted.",
        buttons: [
          {
            text: t("common.ok") || "OK",
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.replace("/landing");
            },
          },
        ],
      });
    } catch (error: any) {
      console.error("Delete account error:", error);
      setError(error.message || t("profile.delete.errors.generic") || "An error occurred while deleting your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${useBackgroundColorClass()}`}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: Dimensions.get("window").width > 768 ? "50%" : "100%",
            maxWidth: 600,
            alignSelf: "center",
            padding: 20,
          }}
        >
          <View className="items-center mb-8">
            <Ionicons
              name="warning-outline"
              size={64}
              color={theme === "dark" ? "#ff4040" : "#ff2a00"}
            />

            <CustomText
              className="text-2xl font-bold text-center mt-4"
              style={{ color: theme === "dark" ? "#ff4040" : "#ff2a00" }}
            >
              {t("profile.delete.title") || "Delete Your Account"}
            </CustomText>
          </View>

          <View className="mb-8">
            <CustomText
              className="text-base text-center mb-4"
              style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
            >
              {t("profile.delete.warning") || 
                "Warning: This action is irreversible. Once you delete your account, all your data will be permanently removed and cannot be recovered."}
            </CustomText>

            <CustomText
              className="text-base text-center"
              style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
            >
              {t("profile.delete.confirmPassword") || 
                "Please enter your password to confirm deletion:"}
            </CustomText>
          </View>

          <FormField2
            title={t("auth.login.passwordPlaceholder") || "Password"}
            placeholder={t("auth.login.passwordPlaceholder") || "Password"}
            value={password}
            handleChangeText={setPassword}
            otherStyles="mb-6"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#707070" : "#909090"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            secureTextEntry
          />

          {error ? (
            <CustomText className="text-red-500 mt-2 mb-4 text-center">
              {error}
            </CustomText>
          ) : null}

          <View className="flex-row justify-center mt-4 space-x-4">
            <CustomButton
              title={t("common.cancel") || "Cancel"}
              handlePress={() => router.push("/settings")}
              containerStyles="flex-1 bg-gray-500"
              textStyles="!text-white"
            />
            
            <CustomButton
              title={t("profile.delete.deleteButton") || "Delete Account"}
              handlePress={handleConfirmDelete}
              containerStyles="flex-1 !bg-red-600"
              textStyles="!text-white"
              isLoading={loading}
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