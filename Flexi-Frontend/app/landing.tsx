import {
  View,
  Text,
  ScrollView,
  Platform,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { images, icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // ฟังก์ชันสลับภาษา
  const toggleLanguage = () => {
    const newLang = i18n.language === "th" ? "en" : "th";
    AsyncStorage.setItem("language", newLang);
    i18n.changeLanguage(newLang);
  };

  // Handle contact form submission
  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(t("contact.error.title"), t("contact.error.allFields"), [
        { text: "OK" },
      ]);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert(t("contact.error.title"), t("contact.error.invalidEmail"), [
        { text: "OK" },
      ]);
      return;
    }

    // Here you would typically send the data to your backend
    // For now, just show a success message
    Alert.alert(t("contact.success.title"), t("contact.success.message"), [
      { text: "OK" },
    ]);

    // Clear form
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        style={{
          backgroundColor: theme === "dark" ? "#1c1c1d" : "#f8f8f8",
          flexDirection: "column",
        }}
      >
        {/* ปุ่มเปลี่ยนภาษา */}
        <TouchableOpacity
          onPress={toggleLanguage}
          className="absolute top-4 right-4 z-10 bg-gray-700 p-2 rounded-full"
        >
          <View className="flex-row items-center gap-2 !bg-transparent px-2">
            <Image
              source={i18n.language === "th" ? icons.flagen : icons.flagth}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
            <CustomText className="!text-white text-sm">
              {i18n.language === "th" ? "EN" : "ไทย"}
            </CustomText>
          </View>
        </TouchableOpacity>
        {/* content */}
        <View
          className="flex justify-start items-center px-8"
          style={{
            flex: 1,
            height:
              Dimensions.get("window").width > 768
                ? Dimensions.get("window").height
                : "auto",
            width: Dimensions.get("window").width > 768 ? "80%" : "100%",
            maxWidth: 800,
            paddingTop: Dimensions.get("window").height * 0.25,
            alignSelf: "center",
          }}
        >
          {/* Logo */}
          <Image
            source={images.logo}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />

          {/* Slogan */}
          <View className="relative mt-5">
            <CustomText
              weight="bold"
              className="text-2xl text-center text-white leading-10"
            >
              {t("Minimize Your Task")}
              {"\n"}
              {t("Maximize Your Profit")}{" "}
            </CustomText>
          </View>

          {/* คำอธิบาย */}
          <CustomText
            weight="regular"
            className="text-md mt-7 text-center text-white"
          >
            {t("landing.description")}
          </CustomText>

          {/* ปุ่มไปหน้า Login */}
          <CustomButton
            title={t("landing.button")}
            handlePress={() => {
              router.push("/login");
            }}
            containerStyles="w-full mt-7"
            textStyles="!text-white"
          />
        </View>
        {/* how to*/}
        {Dimensions.get("window").width > 768 && (
          <View
            className=" pt-5 px-2"
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              paddingBottom: 520,
              marginBottom: 30,
            }}
          >
            <View className="relative">
              <CustomText
                weight="bold"
                className=" text-center text-white leading-10"
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.title")}
              </CustomText>
              <CustomText
                weight="regular"
                className=" text-start text-white  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content1")}
              </CustomText>
              {/* Image of get start */}
              <Image
                source={images.start}
                style={{
                  width: Dimensions.get("window").width > 768 ? 600 : 350,
                  height: Dimensions.get("window").width > 768 ? 300 : 200,
                  alignSelf: "center",
                }}
                resizeMode="contain"
              />

              <CustomText
                weight="regular"
                className=" text-start text-white leading-10  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content2")}
              </CustomText>
              <Image
                source={images.loginshopee}
                style={{
                  width: Dimensions.get("window").width > 768 ? 600 : 350,
                  height: Dimensions.get("window").width > 768 ? 500 : 200,
                  marginTop: 10,
                  marginBottom: 20,
                }}
                resizeMode="contain"
              />
              <CustomText
                weight="regular"
                className=" text-start text-white leading-10  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content3")}
              </CustomText>
              <CustomText
                weight="regular"
                className=" text-start text-white leading-10  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content4")}
              </CustomText>
            </View>
          </View>
        )}
        {/* Contact Box Section - Only shown on desktop/tablet */}
        {Dimensions.get("window").width > 768 && (
          <View
            className=" mt-10 "
            style={{
              width: "100%",
              padding: 50,
              alignSelf: "center",
              backgroundColor: theme === "dark" ? "#1c1c1d" : "#86f8df",
              flexDirection:
                Dimensions.get("window").width > 768 ? "row" : "column",
            }}
          >
            <View
              className="w-full  justify-center items-center px-8"
              style={{
                flex: 1,
                paddingTop: 5,
                height: Dimensions.get("window").width > 768 ? "auto" : "auto",
                marginBottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* คำอธิบาย */}
              <CustomText
                weight="semibold"
                className="mt-7 text-center text-white"
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 14 : 12,
                  lineHeight: 24,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("landing.description")}
              </CustomText>
              {/* Slogan */}
              <View className="relative m-5">
                <CustomText
                  className=" text-start text-white leading-10"
                  style={{
                    fontSize: Dimensions.get("window").width > 768 ? 14 : 12,
                    lineHeight: 24,
                    color: theme === "dark" ? "#c9c9c9" : "#48453e",
                  }}
                >
                  {t("automate")}
                </CustomText>
              </View>
            </View>
            <View className="flex-1 justify-center items-center">
              {/* contact us*/}
              <CustomText
                weight="bold"
                className="text-center text-white"
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  lineHeight: 24,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("footer.contact.title")}
              </CustomText>

              <CustomText
                className=" text-start text-white leading-10"
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 14 : 13,
                  lineHeight: 24,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("footer.contact.detail")}
              </CustomText>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  paddingHorizontal: 110,
                  marginTop: 30,
                  marginBottom: 10,
                  gap: 30,
                }}
              >
                <CustomText
                  weight="semibold"
                  className="text-center text-white"
                  style={{
                    fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                    lineHeight: 24,
                    color: theme === "dark" ? "#c9c9c9" : "#48453e",
                  }}
                  onPress={() => {
                    router.push("/term");
                  }}
                >
                  {t("footer.terms")}
                </CustomText>

                <CustomText
                  weight="semibold"
                  className="text-center text-white"
                  style={{
                    fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                    lineHeight: 24,
                    color: theme === "dark" ? "#c9c9c9" : "#48453e",
                  }}
                  onPress={() => {
                    router.push("/privacy");
                  }}
                >
                  {t("footer.privacy")}
                </CustomText>
              </View>
              <CustomText className={`text-xs font-normal `}>
                {t("copyright")}
              </CustomText>
            </View>
          </View>
        )}
        {/* Mobile-only Copyright Footer */}
        {Dimensions.get("window").width <= 768 && (
          <View
            style={{
              width: "100%",
              padding: 20,
              marginTop: "auto",
            }}
          >
            <CustomText
              style={{
                fontSize: 10,
                textAlign: "center",
                color: theme === "dark" ? "#a0a0a0" : "#555555",
              }}
            >
              {t("copyright")}
            </CustomText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
