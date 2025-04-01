import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";

export default function shop() {
  const { t } = useTranslation();
  useTheme();
  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView>
        <View className="flex-1 items-center justify-center">
            <CustomText style={{ textAlign: "center" }}>{t("shop.title")}</CustomText>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
