import { View, Text, ScrollView, Platform } from "react-native";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";

export default function ORM() {
  const { t } = useTranslation();
  useTheme();
  return (
    <SafeAreaView className={`h-full  ${useBackgroundColorClass()}`}
     style={Platform.OS === "web" ? { paddingTop: 60 } : {}}>
      <ScrollView>
        <View className="flex-1 items-center justify-center pt-20"          
        >
            <CustomText style={{ textAlign: "center" }}>{t("shop.tap.orm")}</CustomText>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
