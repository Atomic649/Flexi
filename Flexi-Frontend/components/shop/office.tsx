import {
  View,
  Text,
  ScrollView,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";

import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import DashboardAds from "../home/DashboardAds";
import { CustomText } from "../CustomText";

export default function Office() {
  const { t } = useTranslation();
  useTheme();
  return (
    <SafeAreaView className={`h-full  ${useBackgroundColorClass()}`}>
      <ScrollView
        style={{
          width: Dimensions.get("window").width > 768 ? "40%" : "100%",
          maxWidth: 600,
          alignSelf: "center", // Center the content on larger screens
        }}
      >
        <View className="flex-1 items-center justify-center ">
          <CustomText className="text-sm font-bold text-center py-5">
            {t("shop.title")}
          </CustomText>
          <DashboardAds />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
