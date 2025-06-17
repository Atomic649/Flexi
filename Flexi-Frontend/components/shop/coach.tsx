import {
  View, 
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/providers/ThemeProvider";

import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import CallAPIB2B from "@/api/B2B_api";
import B2BAds from "../B2BAds";

export default function Coach() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [coachData, setCoachData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      const response = await CallAPIB2B.getB2BCoachDataAPI();
      setCoachData(response);
      console.log("🚀 Coach Data Fetched:", response);
      setError(null);
    } catch (err) {
      console.error("Error fetching coach data:", err);
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? (err as Error).message
          : "Failed to load data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCoachData();
  }, []);

  useEffect(() => {
    fetchCoachData();
  }, []);

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}
     >
      <ScrollView
        style={{
          width: Dimensions.get("window").width > 768 ? "100%" : "100%",
          alignSelf: "center", // Center the content on larger screens
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme === "dark" ? "#ffffff" : "#0000ff"]}
            tintColor={theme === "dark" ? "#ffffff" : "#0000ff"}
          />
        }
      >
        <View className="flex-1 items-center justify-center ">
          {loading && !refreshing ? (
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
            <B2BAds officeData={coachData} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
