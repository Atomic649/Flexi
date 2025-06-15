import {
  View,
  Text,
  ScrollView,
  Platform,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/providers/ThemeProvider";

import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import DashboardAds from "../home/DashboardAds";
import { CustomText } from "../CustomText";
import CallAPIB2B from "@/api/B2B_api";

export default function Office() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [officeData, setOfficeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfficeData = async () => {
      try {
        setLoading(true);
        const response = await CallAPIB2B.getB2BOfficeDataAPI();
        setOfficeData(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching office data:", err);
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? (err as Error).message
            : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeData();
  }, []);

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView
        style={{
          width: Dimensions.get("window").width > 768 ? "100%" : "100%",
          alignSelf: "center", // Center the content on larger screens
        }}
      >
        <View className="flex-1 items-center justify-center">
          {/* <CustomText className="text-sm font-bold text-center py-5">
         {t("shop.title")}
          </CustomText> */}

          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme === "dark" ? "#ffffff" : "#0000ff"}
              style={{ marginTop: 20 }}
            />
          ) : error ? (
            <CustomText className="text-red-500 text-center mt-4">
              {error}
            </CustomText>
          ) : (
            <DashboardAds officeData={officeData} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
