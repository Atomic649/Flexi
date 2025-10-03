import React, { useState, useEffect } from "react";
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
import {CustomButton} from "@/components/CustomButton";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import Animated from "react-native-reanimated";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIUser from "@/api/auth_api";
import { removeToken } from "@/utils/utility";
import { useTextColorClass, useBackgroundColorClass } from "@/utils/themeUtils";
import { useMarketing } from "@/providers/MarketingProvider";
import {
  loginWithFacebook,
  logoutFromFacebook,
  isFacebookAuthenticated,
} from "@/utils/socialAuth/facebookAuth";

// Utility function to get switch colors
const getSwitchPlatformColors = (theme: string, value: boolean) => ({
  trackColor: {
    false: theme === "dark" ? "#4B5563" : "#D1D5DB",
    true: theme === "dark" ? "#04ecc1" : "#04ecc1",
  },
  thumbColor: value
    ? theme === "dark"
      ? "#ffffff"
      : "#ffffff"
    : theme === "dark"
      ? "#71717a"
      : "#75726a",
});

// Utility constant for toggle scaling
const toggleScaleStyle = { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] };

export default function Setting() {
  const { marketingPreference, setMarketingPreference } = useMarketing();
  const [Facebook, setFacebook] = useState(false); // Default to false
  const [Tiktok, setTiktok] = useState(false); // Default to false
  const [Shopee, setShopee] = useState(false); // Default to false
  const [Line, setLine] = useState(false); // Default to false
  const { t, i18n } = useTranslation(); // กำหนดตัวแปรใช้งานภาษา
  const { theme, toggleTheme } = useTheme(); // กำหนดตัวแปรใช้งานธีม
  const [isProcessingFacebook, setIsProcessingFacebook] = useState(false);

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

  // Check Facebook authentication status on component mount
  useEffect(() => {
    const checkFacebookAuth = async () => {
      const isAuthenticated = await isFacebookAuthenticated();
      setFacebook(isAuthenticated);
    };

    checkFacebookAuth();
  }, []);

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

  // ---------- ฟังก์ชัน security ------------
  const showSecurityOptions = () => {
    if (!alertConfig.visible) {
      setAlertConfig({
        visible: true,
        title: t("settings.security.title"),
        message: t("settings.security.message"),
        buttons: [
          {
            text: t("settings.security.changePassword"),
            onPress: () => {
              // Navigate to change password screen
              router.replace("/change_password");
            },
          },
          {
            text: t("settings.security.deleteAccount"),
            onPress: () => {
              // Navigate to enable 2FA screen
             // router.push("/delete_account");
              router.replace("/delete_account");
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
    }}

  //---------- ฟังก์ชันเปลี่ยนการตลาด------------

  const toggleMarketing = async () => {
    const newValue = marketingPreference === "ads" ? "organic" : "ads";
    
    try {
      await setMarketingPreference(newValue);
      console.log("Marketing preference changed to:", newValue);
      
      // The DeviceEventEmitter.emit is now handled inside the provider
    } catch (error) {
      console.error("Error saving marketing preference:", error);
      // Optionally show an error message to the user
    }
  };

  //---------Platform Toggle Handlers---------

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

  // Handle Facebook authentication
  const handleFacebookToggle = async () => {
    // Prevent multiple rapid clicks
    if (isProcessingFacebook) return;
    
    try {
      setIsProcessingFacebook(true);
      //console.log('🔄 Facebook toggle pressed, current state:', Facebook);
      
      if (Facebook) {
        // Logging out from Facebook        
        const success = await logoutFromFacebook();
       // console.log('🔄 Facebook logout result:', success);
        
        if (success) {
          setFacebook(false);          
          setAlertConfig({
            visible: true,
            title: t("common.success"),
            message: t("settings.socialMedia.disconnected", {
              platform: "Facebook",
            }),
            buttons: [
              {
                text: t("common.ok"),
                onPress: () =>
                  setAlertConfig((prev) => ({ ...prev, visible: false })),
              },
            ],
          });
        }
      } else {
        // Logging in with Facebook
        const result = await loginWithFacebook();
       // console.log('🔄 Facebook login result:', JSON.stringify(result, null, 2));

        if (result.success) {
          setFacebook(true);         
          setAlertConfig({
            visible: true,
            title: t("common.success"),
            message: t("settings.socialMedia.connected", {
              platform: "Facebook",
            }),
            buttons: [
              {
                text: t("common.ok"),
                onPress: () =>
                  setAlertConfig((prev) => ({ ...prev, visible: false })),
              },
            ],
          });
        } else {
         // console.log('🔄 Facebook login failed:', result.error);
          setAlertConfig({
            visible: true,
            title: t("common.error"),
            message:
              result.error ||
              t("settings.socialMedia.connectionFailed", { platform: "Facebook" }),
            buttons: [
              {
                text: t("common.ok"),
                onPress: () =>
                  setAlertConfig((prev) => ({ ...prev, visible: false })),
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error('🔄 Facebook auth error:', error);
      setAlertConfig({
        visible: true,
        title: t("common.error"),
        message: t("settings.socialMedia.connectionFailed", {
          platform: "Facebook",
        }),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
     // console.log('🔄 Facebook authentication process completed');
      setIsProcessingFacebook(false);
    }
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
            Dimensions.get("window").width > 768
              ? { alignSelf: "center", width: "60%" }
              : {}
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
                    color={theme === "dark" ? "#d9d2d2" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base"
                  weight="regular">
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
                  <CustomText className="text-base" weight="regular">
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
                  <CustomText className="text-base" weight="regular">
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
                  <CustomText className="text-base" weight="regular">
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
                    name={marketingPreference === "ads" ? "money" : "leaf"}
                    size={24}
                    color={theme === "dark" ? "#d9d2d2" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base"
                  weight="regular">
                    {marketingPreference === "ads"
                      ? t("settings.marketing.ads")
                      : t("settings.marketing.organic")}
                  </CustomText>
                </View>
                <Switch
                  value={marketingPreference === "ads"}
                  onValueChange={() => toggleMarketing()}
                  {...getSwitchPlatformColors(theme, marketingPreference === "ads")}
                  style={toggleScaleStyle}
                />
              </Pressable>
            </View>
          </Section>

          {/* Privacy */}
          <Section title={t("settings.privacy.title")}>
            <View>
              {/* <SectionItem icon="lock" text={t("settings.privacy.settings")} />
              <Divider /> */}
              <SectionItem
                icon="shield"
                text={t("settings.privacy.security")}
                onPress={showSecurityOptions}
              />
              <Divider />
              <SectionItem
                icon="lock"
                text={t("settings.privacy.policy")}
                onPress={() => router.push("/privacy")}
              />
              <Divider />
              <SectionItem
                icon="file-text"
                text={t("settings.privacy.terms")}
                onPress={() => router.push("/term")}
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
                    color={theme === "dark" ? "#d9d2d2" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText className="text-base"
                  weight="regular">
                    {theme === "dark"
                      ? t("settings.appearance.dark")
                      : t("settings.appearance.light")}
                  </CustomText>
                </View>
                <Switch
                  value={theme === "dark"}
                  onValueChange={toggleTheme}
                  {...getSwitchPlatformColors(theme, theme === "dark")}
                  style={toggleScaleStyle}
                />
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
          {title}
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
        backgroundColor: theme === "dark" ? "#71717a" : "#D1D5DB",
      }}
    />
  );
};
