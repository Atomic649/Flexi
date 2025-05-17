import React, { useState } from "react";
import {
  ScrollView,
  Pressable,
  SafeAreaView,
  Switch,
  Platform,
  Dimensions,
} from "react-native";
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

// Utility function to get switch colors
const getSwitchPlatformColors = (theme: string, value: boolean) => ({
  trackColor: {
    false: theme === "dark" ? "#4B5563" : "#D1D5DB",
    true: theme === "dark" ? "#0feac2" : "#0feac2",
  },
  thumbColor: value ? "#ffffff" : "#75726a",
});

// Utility constant for toggle scaling
const toggleScaleStyle = { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] };

export default function Setting() {
  const [Marketing, setMarketing] = useState("ads");
  const [Facebook, setFacebook] = useState(false); // Default to false
  const [Tiktok, setTiktok] = useState(false); // Default to false
  const [Shopee, setShopee] = useState(false); // Default to false
  const [Line, setLine] = useState(false); // Default to false
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

  //---------- ฟังก์ชันเปลี่ยนการตลาด------------

  const toggleMarketing = () => {
    setMarketing((prev) => (prev === "ads" ? "organic" : "ads"));
  };

  //---------Platform Toggle Handlers---------

  // Handle Facebook toggle
  const handleFacebookToggle = () => {
    setFacebook((prev) => !prev); // Toggle between true and false
    console.log("Facebook toggle:", !Facebook);
  };

  // Handle TikTok toggle
  const handleTiktokToggle = () => {
    setTiktok((prev) => !prev); // Toggle between true and false
    console.log("TikTok toggle:", !Tiktok);
  };

  // Handle Shopee toggle
  const handleShopeeToggle = () => {
    setShopee((prev) => !prev); // Toggle between true and false
    console.log("Shopee toggle:", !Shopee);
  };

  // Handle Line toggle
  const handleLineToggle = () => {
    setLine((prev) => !prev); // Toggle between true and false
    console.log("Line toggle:", !Line);
  };

  //------------------------------------------

  return (
    <SafeAreaView
      className={`h-full ${useBackgroundColorClass()}`}
      style={Platform.OS === "web" ? { paddingTop: 60 } : {}}
    >
      <ScrollView>
        <View
          className={`px-4 pt-3 pb-5`}
          style={
            Dimensions.get("window").width > 768 ? { alignSelf: "center", width: "60%" } : {}
          }
        >
          {/* Social Media Platform */}
          <Section
            title={t("settings.socialMedia.title")}
            router={() => router.push("/store")}
            subtitle={t("settings.socialMedia.seeAll")}
          >
            <View>
              {/* Facebook */}
              <Pressable
                className={`flex-row items-center justify-between p-4`}
                onPress={handleFacebookToggle}
              >
                <View className="flex-row items-center !bg-transparent">
                  <FontAwesome
                    name="facebook"
                    size={24}
                    color={theme === "dark" ? "#fff" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base">
                    {t("settings.socialMedia.facebook")}
                  </CustomText>
                </View>
                <Switch
                  value={Facebook} // Bind to state
                  onValueChange={handleFacebookToggle} // Toggle handler
                  {...getSwitchPlatformColors(theme, Facebook)} // Use utility function
                  style={toggleScaleStyle} // Use centralized style
                />
              </Pressable>

              <Divider />

              {/* Tiktok */}
              <Pressable
                className={`flex-row items-center justify-between p-4`}
                onPress={handleTiktokToggle}
              >
                <View className="flex-row items-center !bg-transparent">
                  <FontAwesome
                    name="music"
                    size={24}
                    color={theme === "dark" ? "#fff" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base">
                    {t("settings.socialMedia.tiktok")}
                  </CustomText>
                </View>
                <Switch
                  value={Tiktok} // Bind to state
                  onValueChange={handleTiktokToggle} // Toggle handler
                  {...getSwitchPlatformColors(theme, Tiktok)} // Use utility function
                  style={toggleScaleStyle} // Use centralized style
                />
              </Pressable>

              <Divider />

              {/* Shopee */}
              <Pressable
                className={`flex-row items-center justify-between p-4`}
                onPress={handleShopeeToggle}
              >
                <View className="flex-row items-center !bg-transparent">
                  <Ionicons
                    name="bag"
                    size={24}
                    color={theme === "dark" ? "#fff" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base">
                    {t("settings.socialMedia.shopee")}
                  </CustomText>
                </View>
                <Switch
                  value={Shopee} // Bind to state
                  onValueChange={handleShopeeToggle} // Toggle handler
                  {...getSwitchPlatformColors(theme, Shopee)} // Use utility function
                  style={toggleScaleStyle} // Use centralized style
                />
              </Pressable>

              <Divider />

              {/* Line */}
              <Pressable
                className={`flex-row items-center justify-between p-4`}
                onPress={handleLineToggle}
              >
                <View className="flex-row items-center !bg-transparent">
                  <Ionicons
                    name="chatbubble"
                    size={24}
                    color={theme === "dark" ? "#fff" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base">
                    {t("settings.socialMedia.line")}
                  </CustomText>
                </View>
                <Switch
                  value={Line} // Bind to state
                  onValueChange={handleLineToggle} // Toggle handler
                  {...getSwitchPlatformColors(theme, Line)} // Use utility function
                  style={toggleScaleStyle} // Use centralized style
                />
              </Pressable>
            </View>
          </Section>

          {/* Business Settings*/}
          <Section title={t("settings.business")}>
            <View>
              <SectionItem
                icon="tags"
                text={t("settings.businessSetting.product")}
                onPress={() => router.push("/product")}
              />
              <Divider />
              <SectionItem
                icon="building"
                text={t("settings.businessInfo")}
                onPress={() => router.push("/business_info")}
              />
              <Divider />
              <SectionItem
                icon="users"
                text={t("settings.businessSetting.team")}
                onPress={() => {}}
              />
            </View>
          </Section>

          {/* Marketing Strategies */}
          <Section
            title={t("settings.marketing.title")}
            router={() => router.push("/ads")}
            subtitle={t("settings.socialMedia.seeAll")}
          >
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
                      boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
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
            <View>
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
                      boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
                    }}
                  />
                </View>
              </Pressable>
            </View>
          </Section>

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
                onPress={() => router.push("/profile")}
              />
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
  subtitle,
  description,
  router,
  children,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  router?: () => void;
  children: React.ReactNode;
}) => {
  const { theme } = useTheme();
  const textColorClass = useTextColorClass();

  return (
    <View className="my-4">
      <View className="flex-row items-center justify-between">
        <CustomText
          weight="medium"
          className={`text-lg mb-2 ${textColorClass}`}
        >
          {title}{" "}
        </CustomText>

        {subtitle && (
          <Pressable onPress={router}>
            <CustomText
              link={true}
              className={`text-sm mb-2 ${textColorClass}`}
            >
              {subtitle}
            </CustomText>
          </Pressable>
        )}
      </View>

      {description && (
        <CustomText className={`text-sm mb-2 ${textColorClass}`}>
          {description}
        </CustomText>
      )}

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
        <CustomText
          weight="regular"
          className={`text-base flex-1 ${textColorClass}`}
        >
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
