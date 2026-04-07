import React from "react";
import { ScrollView, Pressable, Switch, Platform, Dimensions } from "react-native";
import { View } from "@/components/Themed";
import { CustomText } from "@/components/CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useBillSettings } from "@/providers/BillSettingsProvider";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { Ionicons } from "@expo/vector-icons";

const getSwitchPlatformColors = (theme: string, value: boolean) => ({
  trackColor: {
    false: theme === "dark" ? "#4B5563" : "#D1D5DB",
    true: theme === "dark" ? "#04ecc1" : "#04ecc1",
  },
  thumbColor: value
    ? theme === "dark" ? "#ffffff" : "#ffffff"
    : theme === "dark" ? "#71717a" : "#75726a",
});

const toggleScaleStyle = { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] };

export default function AppearanceSettings() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { billCardMode, setBillCardMode } = useBillSettings();
  const bgClass = useBackgroundColorClass();
  const textColorClass = useTextColorClass();

  const isProjectMode = billCardMode === "project";

  const handleToggle = async () => {
    await setBillCardMode(isProjectMode ? "products" : "project");
  };

  return (
    <View className={`h-full ${bgClass}`} style={Platform.OS === "web" ? { paddingTop: 60 } : {}}>
      <ScrollView>
        <View
          className="px-4 pt-3 pb-5"
          style={Dimensions.get("window").width > 768 ? { alignSelf: "center", width: "60%" } : {}}
        >
          {/* Bill Card Display */}
          <View className="my-4">
            <CustomText weight="medium" className={`text-lg mb-2 ${textColorClass}`}>
              {t("documentSettings.billCard.title")}
            </CustomText>
            <CustomText className={`text-sm mb-3 ${textColorClass}`} style={{ opacity: 0.6 }}>
              {t("documentSettings.billCard.description")}
            </CustomText>

            <View
              className={`rounded-xl overflow-hidden border ${
                theme === "dark" ? "border-zinc-500" : "border-zinc-200"
              }`}
            >
              {/* Products mode option */}
              <Pressable
                className={`flex-row items-center justify-between p-4 ${
                  theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                }`}
                onPress={() => setBillCardMode("products")}
                android_ripple={{ color: "rgba(104, 104, 104, 0.3)" }}
              >
                <View className="flex-row items-center !bg-transparent flex-1 gap-3">
                  <Ionicons
                    name="cube-outline"
                    size={22}
                    color={!isProjectMode ? "#04ecc1" : theme === "dark" ? "#d9d2d2" : "#75726a"}
                  />
                  <View className="!bg-transparent flex-1">
                    <CustomText weight="regular" className={`text-base ${textColorClass}`}>
                      {t("documentSettings.billCard.modeProducts")}
                    </CustomText>
                    <CustomText
                      className="text-sm"
                      style={{ color: theme === "dark" ? "#71717a" : "#9ca3af" }}
                    >
                      {t("documentSettings.billCard.modeProductsDesc")}
                    </CustomText>
                  </View>
                </View>
                {!isProjectMode && (
                  <Ionicons name="checkmark-circle" size={20} color="#04ecc1" />
                )}
              </Pressable>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: theme === "dark" ? "#71717a" : "#D1D5DB" }} />

              {/* Project mode option */}
              <Pressable
                className={`flex-row items-center justify-between p-4 ${
                  theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                }`}
                onPress={() => setBillCardMode("project")}
                android_ripple={{ color: "rgba(104, 104, 104, 0.3)" }}
              >
                <View className="flex-row items-center !bg-transparent flex-1 gap-3">
                  <Ionicons
                    name="folder-outline"
                    size={22}
                    color={isProjectMode ? "#04ecc1" : theme === "dark" ? "#d9d2d2" : "#75726a"}
                  />
                  <View className="!bg-transparent flex-1">
                    <CustomText weight="regular" className={`text-base ${textColorClass}`}>
                      {t("documentSettings.billCard.modeProject")}
                    </CustomText>
                    <CustomText
                      className="text-sm"
                      style={{ color: theme === "dark" ? "#71717a" : "#9ca3af" }}
                    >
                      {t("documentSettings.billCard.modeProjectDesc")}
                    </CustomText>
                  </View>
                </View>
                {isProjectMode && (
                  <Ionicons name="checkmark-circle" size={20} color="#04ecc1" />
                )}
              </Pressable>
            </View>

            {/* Quick toggle */}
            <View
              className={`mt-4 rounded-xl overflow-hidden border ${
                theme === "dark" ? "border-zinc-500" : "border-zinc-200"
              }`}
            >
              <Pressable
                className={`flex-row items-center justify-between p-4 ${
                  theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                }`}
                onPress={handleToggle}
              >
                <View className="flex-row items-center !bg-transparent">
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={24}
                    color={theme === "dark" ? "#d9d2d2" : "#75726a"}
                    style={{ marginRight: 16 }}
                  />
                  <CustomText weight="regular" className={`text-base ${textColorClass}`}>
                    {isProjectMode
                      ? t("documentSettings.billCard.modeProject")
                      : t("documentSettings.billCard.modeProducts")}
                  </CustomText>
                </View>
                <Switch
                  value={isProjectMode}
                  onValueChange={handleToggle}
                  {...getSwitchPlatformColors(theme, isProjectMode)}
                  style={toggleScaleStyle}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
