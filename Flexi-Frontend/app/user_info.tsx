import { Dimensions, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, TextInput } from "react-native";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { CustomButton } from "@/components/CustomButton";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { getUserId } from "@/utils/utility";
import FormField2 from "@/components/formfield/FormField2";
import CallAPIUser from "@/api/auth_api";
import FormField from "@/components/formfield/FormField";

export default function UserInfo() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  // Confirm password modal state (top-level)
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const scrollViewRef = useRef<ScrollView>(null);

  const loadUserProfile = async () => {
    try {
      const id = await getUserId();
      if (!id) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }
      setUserId(id);
      const data = await CallAPIUser.getUserAPI(id);
      // Pre-fill with existing user data
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
      setUsername(data.username || "");
      setBio(data.bio || "");
  setPhone(data.phone || "");
  setAvatar(data.avatar || "");
    } catch (err: any) {
      console.error("Error loading user profile:", err);
      setError(err?.message || "Failed to load user profile");
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleUpdate = async () => {
    setError("");

    if (!firstName || !lastName || !email) {
      setAlertConfig({
        visible: true,
        title: t("auth.register.validation.incomplete"),
        message: t("auth.register.validation.invalidData"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
      return;
    }

    // Show confirm password modal before sending to backend
    setConfirmVisible(true);
  };

  const submitUpdateWithPassword = async () => {
    try {
      if (!userId) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }
      if (!confirmPassword) {
        setAlertConfig({
          visible: true,
          title: t("common.error"),
          message: t("auth.changePassword.validation.enterPassword") || "Please enter your password",
          buttons: [
            { text: t("common.ok"), onPress: () => setAlertConfig((p)=>({...p,visible:false})) },
          ],
        });
        return;
      }

      // Backend requires password, email, firstName, lastName, avatar, phone
      const payload: any = {       
        id: userId,
        email,
        password: confirmPassword,
        firstName,
        lastName,
        avatar: avatar || "",
        phone: phone || "",       
        username,
        bio,
      };

      const res = await CallAPIUser.updateUserAPI(payload);
      if (res?.error) throw new Error(res.error);

      setConfirmVisible(false);
      setConfirmPassword("");
      setAlertConfig({
        visible: true,
        title: t("auth.register.alerts.success"),
        message: t("auth.register.alerts.successMessage"),
        buttons: [
          {
            text: t("auth.register.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.back();
            },
          },
        ],
      });
    } catch (err: any) {
      console.error("Update user profile error:", err);
      setConfirmVisible(false);
      setError(err?.message || "Failed to update user profile");
    }
  };

  return (
    <View
      className={`h-full ${useBackgroundColorClass()}`}
      style={{ width: "100%", alignSelf: "center" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          style={{
            width: Dimensions.get("window").width > 768 ? "40%" : "100%",
            maxWidth: 600,
            alignSelf: "center",
          }}
        >
          <View className="flex-1 justify-center px-4 py-10" style={{ width: "100%" }}>
            <FormField2
              title={t("auth.register.firstName") || "First Name"}
              placeholder={t("auth.register.firstName") || "First Name"}
              value={firstName}
              handleChangeText={setFirstName}
              otherStyles="mt-0"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            />

            <FormField2
              title={t("auth.register.lastName") || "Last Name"}
              placeholder={t("auth.register.lastName") || "Last Name"}
              value={lastName}
              handleChangeText={setLastName}
              otherStyles="mt-7"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            />

            <FormField2
              title={t("auth.register.emailPlaceholder") || "Email"}
              placeholder={t("auth.register.emailPlaceholder") || "Enter your email"}
              value={email}
              handleChangeText={setEmail}
              otherStyles="mt-7"
              keyboardType="email-address"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            />

            <FormField2
              title={t("auth.register.username") || "Username"}
              placeholder={t("auth.register.username") || "Username"}
              value={username}
              handleChangeText={setUsername}
              otherStyles="mt-7"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            />

            <FormField2
              title={t("auth.register.bio") || "Bio"}
              placeholder={t("auth.register.bio") || "Tell something about you"}
              value={bio}
              handleChangeText={setBio}
              otherStyles="mt-7"
              boxheight={80}
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            {error ? (
              <CustomText className="text-red-500 mt-4">{error}</CustomText>
            ) : null}

            <CustomButton
              title={t("auth.update.button")}
              handlePress={handleUpdate}
              containerStyles="mt-7"
              textStyles="!text-white"
            />
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

      {/* Confirm Password Modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setConfirmVisible(false)}
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ width: "85%", maxWidth: 500, backgroundColor: theme === "dark" ? "#18181b" : "#ffffff", borderRadius: 12, padding: 16 }}
          >
            <CustomText className="text-lg mt-2 " style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}>
              {t("profile.password.currentPassword") || "Confirm your password"}
            </CustomText>
            
            <FormField2
                placeholder={t("profile.password.enterCurrentPassword") || "Enter password"}
                placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                value={confirmPassword}
                handleChangeText={setConfirmPassword}
                secureTextEntry
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles=""
            />
            

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)}>
                <CustomText style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}>{t("common.cancel")}</CustomText>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitUpdateWithPassword}>
                <CustomText
                weight="bold"
                style={{ color: "#04ecc1" }}>{t("common.confirm")}</CustomText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
