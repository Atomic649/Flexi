import {
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { View } from "@/components/Themed";
import FormField from "@/components/FormField";
import { router } from "expo-router";
import Button from "@/components/Button";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIUser from "@/api/auth_api";
import CallMemberAPI from "@/api/member_api";
import { useTextColorClass } from "@/utils/themeUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
  const { t } = useTranslation();
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsVisited, setTermsVisited] = useState(false);
  const [privacyVisited, setPrivacyVisited] = useState(false);

  // Load visited status from AsyncStorage on mount
  useEffect(() => {
    const loadVisitedStatus = async () => {
      try {
        const termsStatus = await AsyncStorage.getItem('termsVisited');
        const privacyStatus = await AsyncStorage.getItem('privacyVisited');
        
        if (termsStatus === 'true') setTermsVisited(true);
        if (privacyStatus === 'true') setPrivacyVisited(true);
      } catch (error) {
        console.error('Error loading visited status:', error);
      }
    };

    loadVisitedStatus();
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

  // Navigate to Terms and mark as visited
  const handleViewTerms = () => {
    AsyncStorage.setItem('termsVisited', 'true').then(() => {
      setTermsVisited(true);
      router.push("/term");
    });
  };

  // Navigate to Privacy Policy and mark as visited
  const handleViewPrivacy = () => {
    AsyncStorage.setItem('privacyVisited', 'true').then(() => {
      setPrivacyVisited(true);
      router.push("/privacy");
    });
  };

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

    // Check if terms and privacy policy are accepted
    if (!termsAccepted || !privacyAccepted) {
      setAlertConfig({
        visible: true,
        title: t("auth.register.validation.incomplete"),
        message: t("auth.register.validation.termsRequired", "You must accept the Terms of Service and Privacy Policy to continue"),
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

  // Attempt to toggle terms checkbox
  const toggleTermsAccepted = () => {
    if (!termsVisited) {
      setAlertConfig({
        visible: true,
        title: t("auth.register.validation.readRequired", "Reading Required"),
        message: t("auth.register.validation.readTermsFirst", "You must read the Terms of Service before accepting."),
        buttons: [
          {
            text: t("auth.register.readNow", "Read Now"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              handleViewTerms();
            },
          },
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } else {
      setTermsAccepted(!termsAccepted);
    }
  };

  // Attempt to toggle privacy checkbox
  const togglePrivacyAccepted = () => {
    if (!privacyVisited) {
      setAlertConfig({
        visible: true,
        title: t("auth.register.validation.readRequired"),
        message: t("auth.register.validation.readPrivacyFirst"),
        buttons: [
          {
            text: t("auth.register.readNow"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              handleViewPrivacy();
            },
          },
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } else {
      setPrivacyAccepted(!privacyAccepted);
    }
  };

  // Custom checkbox component
  const Checkbox: React.FC<{
    checked: boolean;
    onPress: () => void;
    label: string;
    linkText: string;
    linkRoute: string;
    visited: boolean;
  }> = ({ checked, onPress, label, linkText, linkRoute, visited }) => {
    return (
      <RNView className="flex-row items-start mb-3">
        <TouchableOpacity 
          onPress={onPress}
          className={`w-5 h-5 mt-1 border rounded ${checked 
            ? 'bg-[#0feac2] border-[#0feac2]' 
            : visited 
              ? 'border-gray-400' 
              : 'border-gray-600 bg-gray-200'}`}
        >
          {checked && (
            <RNView className="flex-1 items-center justify-center">
              <CustomText weight="bold" className="text-white text-xs">✓</CustomText>
            </RNView>
          )}
        </TouchableOpacity>
        <RNView className="flex-row flex-wrap ml-2">
          <CustomText className={`text-sm ${visited ? 'text-gray-500' : 'text-gray-600'}`}>{label}</CustomText>
          <TouchableOpacity onPress={linkRoute === "/term" ? handleViewTerms : handleViewPrivacy}>
            <RNView className="flex-row items-center">
              <CustomText className="text-sm text-[#0feac2] ml-1">{linkText}</CustomText>
              {!visited && <Ionicons name="arrow-forward" size={12} color="#0feac2" style={{ marginLeft: 4 }} />}
            </RNView>
          </TouchableOpacity>
        </RNView>
        {visited && (
          <RNView className="ml-1 mt-1">
            <Ionicons name="checkmark-circle" size={14} color="#0feac2" />
          </RNView>
        )}
      </RNView>
    );
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
              alignItems: Platform.OS === "web" ? "center" : "stretch",
            }}
          >
            <View
              style={{
                width: Dimensions.get("window").width > 768  ? "40%" : "100%",
                maxWidth: 600,
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

              <RNView className="mt-5">
                <Checkbox
                  checked={termsAccepted}
                  onPress={toggleTermsAccepted}
                  label={t("auth.register.agree")}
                  linkText={t("auth.register.terms")}
                  linkRoute="/term"
                  visited={termsVisited}
                />
                
                <Checkbox
                  checked={privacyAccepted}
                  onPress={togglePrivacyAccepted}
                  label={t("auth.register.agree")}
                  linkText={t("auth.register.privacy")}
                  linkRoute="/privacy"
                  visited={privacyVisited}
                />
              </RNView>

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
