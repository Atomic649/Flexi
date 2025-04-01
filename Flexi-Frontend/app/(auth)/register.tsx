import {
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { View } from "@/components/Themed";
import FormField from "@/components/FormField";
import { router } from "expo-router";
import Button from "@/components/Button";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIUser from "@/api/auth_api";
import CallMemberAPI from "@/api/member_api";
import { useTextColorClass } from "@/utils/themeUtils";

export default function Register() {
  const { t } = useTranslation();
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!firstName || !lastName || !email || !password || !phone) {
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

    try {
      // Call the register API
      const data = await CallAPIUser.registerAPI({
        firstName,
        lastName,
        phone,
        email,
        password,
      });

      if (data.error) throw new Error(data.error);

      // setAlertConfig({
      //   visible: true,
      //   title: t("auth.register.alerts.success"),
      //   message: t("auth.register.alerts.successMessage"),
      //   buttons: [
      //     {
      //       text: t("auth.register.alerts.ok"),
      //       onPress: () => {
      //         setAlertConfig((prev) => ({ ...prev, visible: false }));
      //         router.replace("/login");
      //       },
      //     },
      //   ],
      // });

      // Automatically create Unique ID in Member Table
      const data2 = await CallMemberAPI.createMemberAPI({
        permission: "user",
        role: "owner",
        userId: data.user.id,
      });

      if (data2.error) throw new Error(data2.error);

      // go to business register with params
      router.replace({
        pathname: "/business_register",
        params: { userId: data.user.id, uniqueId: data2.uniqueId },
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView className="h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView>
          <View
            className="w-full flex justify-center h-full px-4 py-10"
            style={{
              minHeight: Dimensions.get("window").height,
            }}
          >
            <CustomText className={`text-2xl font-bold mt-4 justify-center ${useTextColorClass()}`}>
              {t("auth.register.title")}
            </CustomText>

            <FormField
              title={t("auth.register.firstName")}
              placeholder={t("auth.register.firstName")}
              value={firstName}
              handleChangeText={setfirstName}
              otherStyles="mt-7"
            />

            <FormField
              title={t("auth.register.lastName")}
              placeholder={t("auth.register.lastName")}
              value={lastName}
              handleChangeText={setlastName}
              otherStyles="mt-7"
            />

            <FormField
              title={t("auth.register.phoneTitle")}
              placeholder={t("auth.register.phonePlaceholder")}
              value={phone}
              handleChangeText={setPhone}
              otherStyles="mt-7"
              keyboardType="phone-pad"
            />

            <FormField
              title={t("auth.register.emailPlaceholder")}
              placeholder={t("auth.register.emailPlaceholder")}
              value={email}
              handleChangeText={setEmail}
              otherStyles="mt-7"
              keyboardType="email-address"
            />

            <FormField
              title={t("auth.register.passwordPlaceholder")}
              placeholder={t("auth.register.passwordPlaceholder")}
              value={password}
              handleChangeText={setPassword}
              otherStyles="mt-7"
              secureTextEntry
            />

            {error ? <CustomText className="text-red-500 mt-4">{error}</CustomText> : null}

            <CustomButton
              title={t("auth.register.button")}
              handlePress={handleRegister}
              containerStyles="mt-7"
              textStyles="!text-white"
            />

            <View className="flex justify-center pt-5 flex-row gap-2">
              <CustomText weight="regular" className="text-lg text-gray-100">
                {t("auth.register.hasAccount")}
              </CustomText>
              <Button
                title={t("auth.register.loginButton")}
                onPress={() => router.replace("/login")}
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
