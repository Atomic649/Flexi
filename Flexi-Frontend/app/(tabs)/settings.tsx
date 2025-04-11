import React, { useState } from "react";
import { ScrollView, Pressable, SafeAreaView, Switch } from "react-native";
import { View } from "@/components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import Animated from "react-native-reanimated";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIUser from "@/api/auth_api";
import { removeToken } from "@/utils/utility";
import { useTextColorClass, useBackgroundColorClass } from "@/utils/themeUtils";

export default function Setting() {
  const [Marketing, setMarketing] = useState("ads");
  const { t, i18n } = useTranslation(); // กำหนดตัวแปรใช้งานภาษา
  const { theme, toggleTheme } = useTheme(); // กำหนดตัวแปรใช้งานธีม

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

  // ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    setAlertConfig({
      visible: true,
      title: t("settings.logout.confirmTitle"),
      message: t("settings.logout.confirmMessage"),
      buttons: [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () =>
            setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: async () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            try {
              const { error } = await CallAPIUser.logoutAPI();
              if (error) {
                setAlertConfig({
                  visible: true,
                  title: t("common.error"),
                  message: error.message,
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

              await removeToken();
              router.replace("/(auth)/login");
            } catch (error) {
              console.error("Failed to logout:", error);
              setAlertConfig({
                visible: true,
                title: t("common.error"),
                message: t("settings.logout.error"),
                buttons: [
                  {
                    text: t("common.ok"),
                    onPress: () =>
                      setAlertConfig((prev) => ({ ...prev, visible: false })),
                  },
                ],
              });
            }
          },
        },
      ],
    });
  };

  // ฟังก์ชันเปลี่ยนภาษา
  const changeLanguage = async (lang: string) => {
    try {
      // ปิด alert ก่อน
      setAlertConfig((prev) => ({ ...prev, visible: false }));

      // รอให้ alert เปิดสำเร็จก่อน
      await new Promise((resolve) => setTimeout(resolve, 500));

      // เปลี่ยนภาษา
      await AsyncStorage.setItem("language", lang);
      await i18n.changeLanguage(lang);

      // รอสักครู่ก่อนแสดง success alert
      await new Promise((resolve) => setTimeout(resolve, 500));

      // แสดง success alert
      setAlertConfig({
        visible: true,
        title: "สำเร็จ / Success",
        message:
          lang === "th"
            ? "เปลี่ยนภาษาเรียบร้อยแล้ว"
            : "Language changed successfully",
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } catch (error) {
      console.error("Error changing language:", error);

      // รอสักครู่ก่อนแสดง error alert
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAlertConfig({
        visible: true,
        title: "ผิดพลาด / Error",
        message:
          lang === "th"
            ? "ไม่สามารถเปลี่ยนภาษาได้"
            : "Could not change language",
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  // ฟังก์ชันแสดงตัวเลือกภาษา
  const showLanguageOptions = () => {
    // ตรวจสอบว่า alert ก่อนหน้าปิดแล้ว
    if (!alertConfig.visible) {
      setAlertConfig({
        visible: true,
        title: "เลือกภาษา / Select Language",
        message: "",
        buttons: [
          {
            text: "ไทย",
            onPress: async () => {
              await changeLanguage("th");
            },
          },
          {
            text: "English",
            onPress: async () => {
              await changeLanguage("en");
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
    }
  };

  // ฟังก์ชันเปลี่ยนการตลาด
  const toggleMarketing = () => {
    setMarketing((prev) => (prev === "ads" ? "organic" : "ads"));
    console.log(Marketing);
  };

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView>
        <View className={`px-4 pt-5 pb-5`}>
          {/* Settings Management */}
          <Section title={t("settings.management")}>
            <View>
              <SectionItem
              icon="language"
              text={`${t("settings.language")} (${
                i18n.language === "th" ? "ไทย" : "English"
              })`}
              onPress={showLanguageOptions}
              />
              <Divider />
              <SectionItem
              icon="user"
              text={t("settings.userProfile")}
              onPress={() => router.push("profile")}
              />
              <Divider />
              <SectionItem
              icon="building"
              text={t("settings.businessInfo")}
              onPress={() => router.push("business_info")}
              />
            </View>
          </Section>

          {/* Social Media Platform */}
            <Section title={t("settings.socialMedia.title")}>
            <View>
              {/* Facebook */}
              <Pressable
              className={`flex-row items-center justify-between p-4`}
              onPress={toggleTheme}
              >
              <View className="flex-row items-center !bg-transparent">
                <FontAwesome
                name="facebook"
                size={24}
                color={theme === "dark" ? "#fff" : "#75726a"}
                style={{ marginRight: 16 }}
                />
                <CustomText className="text-base">{t("settings.socialMedia.facebook")}</CustomText>
              </View>
              <View
                className={`w-14 h-8 rounded-full p-1 ${
                theme === "dark" ? "bg-gray-500" : "bg-zinc-200"
                }`}
              >
                <AnimatedToggle theme={theme} />
              </View>
              </Pressable>

              <Divider />

              {/* Tiktok */}
              <Pressable
              className={`flex-row items-center justify-between p-4`}
              onPress={toggleTheme}
              >
              <View className="flex-row items-center !bg-transparent">
                <FontAwesome
                name="music"
                size={24}
                color={theme === "dark" ? "#fff" : "#75726a"}
                style={{ marginRight: 16 }}
                />
                <CustomText className="text-base">{t("settings.socialMedia.tiktok")}</CustomText>
              </View>
              <View
                className={`w-14 h-8 rounded-full p-1 ${
                theme === "dark" ? "bg-gray-700" : "bg-zinc-200"
                }`}
              >
                <AnimatedToggle theme={theme} />
              </View>
              </Pressable>

              <Divider />

              {/* Shopee */}
              <Pressable
              className={`flex-row items-center justify-between p-4`}
              onPress={toggleTheme}
              >
              <View className="flex-row items-center !bg-transparent">
                <Ionicons
                name="bag"
                size={24}
                color={theme === "dark" ? "#fff" : "#75726a"}
                style={{ marginRight: 16 }}
                />
                <CustomText className="text-base">{t("settings.socialMedia.shopee")}</CustomText>
              </View>
              <View
                className={`w-14 h-8 rounded-full p-1 ${
                theme === "dark" ? "bg-gray-700" : "bg-zinc-200"
                }`}
              >
                <AnimatedToggle theme={theme} />
              </View>
              </Pressable>

              <Divider />

              {/* Line */}
              <Pressable
              className={`flex-row items-center justify-between p-4`}
              onPress={toggleTheme}
              >
              <View className="flex-row items-center !bg-transparent">
                <Ionicons
                name="chatbubble"
                size={24}
                color={theme === "dark" ? "#fff" : "#75726a"}
                style={{ marginRight: 16 }}
                />
                <CustomText className="text-base">{t("settings.socialMedia.line")}</CustomText>
              </View>
              <View
                className={`w-14 h-8 rounded-full p-1 ${
                theme === "dark" ? "bg-gray-700" : "bg-zinc-200"
                }`}
              >
                <AnimatedToggle theme={theme} />
              </View>
              </Pressable>
            </View>
            </Section>

          {/* Marketing Strategies */}
            <Section title={t("settings.marketing.title")}>
            <View>
              <Pressable
              className={`flex-row items-center justify-between p-4`}
              onPress={toggleMarketing}
              >
              <View className="flex-row items-center !bg-transparent">
                <FontAwesome
                name={Marketing === "ads" ? "money" : "leaf"}
                size={24}
                color={theme === "dark" ? "#fff" : "#75726a"}
                style={{ marginRight: 16 }}
                />
                <CustomText className="text-base">
                {Marketing === "ads"
                  ? t("settings.marketing.ads")
                  : t("settings.marketing.organic")}
                </CustomText>
              </View>
              <View
                className={`w-14 h-8 rounded-full p-1 ${
                Marketing === "ads" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <Animated.View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  transform: [
                  {
                    translateX: Marketing === "ads" ? 24 : 0,
                  },
                  ],
                  shadowColor: "#000",
                  shadowOffset: {
                  width: 0,
                  height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                />
              </View>
              </Pressable>
            </View>
            </Section>

          {/* Privacy */}
          <Section title={t("settings.privacy.title")}>
            <View>
              <SectionItem icon="lock" text={t("settings.privacy.settings")} />
              <Divider />
              <SectionItem
                icon="shield"
                text={t("settings.privacy.security")}
              />
            </View>
          </Section>

          {/* Theme Section */}
          <Section title={t("settings.appearance.title")}>
            <View >
              <Pressable
                className={`flex-row items-center justify-between p-4`}
                onPress={toggleTheme}
              >
                <View className="flex-row items-center !bg-transparent">
                  <FontAwesome
                    name={theme === "dark" ? "moon-o" : "sun-o"}
                    size={24}
                    color={theme === "dark" ? "#fff" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base">
                    {theme === "dark"
                      ? t("settings.appearance.dark")
                      : t("settings.appearance.light")}
                  </CustomText>
                </View>
                <View
                  className={`w-14 h-8 rounded-full p-1 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <Animated.View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#fff",
                      transform: [
                        {
                          translateX: theme === "dark" ? 24 : 0,
                        },
                      ],
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  />
                </View>
              </Pressable>
            </View>
          </Section>

          {/* Logout */}
          <CustomButton
            title={t("settings.logout.logout")}
            handlePress={handleLogout}
            containerStyles="mt-7 px-8"
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

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { theme } = useTheme();
  const textColorClass = useTextColorClass();

  return (
    <View className="my-4">
      <CustomText weight="medium" className={`text-lg mb-2 ${textColorClass}`}>
        {title}
      </CustomText>
      <View
        className={`rounded-xl overflow-hidden border ${
          theme === "dark" ? "border-zinc-500" : "border-zinc-200"
        }`}
      >
        {children}
      </View>
    </View>
  );
};

const SectionItem = ({
  icon,
  text,
  onPress,
}: {
  icon: string;
  text: string;
  onPress?: () => void;
}) => {
  const { theme } = useTheme();
  const textColorClass = useTextColorClass();

  return (
    <Pressable
      className={`
        flex-row items-center justify-between p-4
        ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"}
      `}
      onPress={onPress || (() => console.log(`Pressed: ${text}`))}
      android_ripple={{ color: "rgba(104, 104, 104, 0.3)" }}
    >
      <View className="flex-row items-center flex-1 !bg-transparent">
        <FontAwesome
          name={icon as any}
          size={24}
          color={theme === "dark" ? "#fff" : "#75726a"}
          style={{ marginRight: 16 }}
        />
        <CustomText weight="regular" className={`text-base flex-1 ${textColorClass}`}>
          {text}
        </CustomText>
        {onPress && (
          <FontAwesome
            name="chevron-right"
            size={12}
            color={theme === "dark" ? "#75726a" : "#918b8b"}
          />
        )}
      </View>
    </Pressable>
  );
};

// Platform Toggle
const AnimatedToggle = ({ theme }: { theme: string }) => (
  <Animated.View
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#fff",
      transform: [
        {
          translateX: theme === "dark" ? 24 : 0,
        },
      ],
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}
  />
);

const Divider = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme === "dark" ? "#4B5563" : "#D1D5DB",
      }}
    />
  );
};
