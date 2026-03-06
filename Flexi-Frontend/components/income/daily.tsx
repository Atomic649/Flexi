import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { getMemberId } from "@/utils/utility";
import CallAPIReport from "@/api/report_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import DailyCard from "../DailyCard";
import { CustomText } from "../CustomText";
import { isDesktop } from "@/utils/responsive";
import { useMarketing } from "@/providers/MarketingProvider";
import { getResponsiveStyles } from "@/utils/responsive";

// Function to format numbers for display, handling the large values properly
const formatNumberDisplay = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};

type DailyCardProps = {
  date: string;
  amount: number;
  sale: number;
  adsCost: number;
  profit: number;
  percentageAds: number;
  ROI: number;
  expenses: number;
};

type DailyProps = {
  refreshSignal?: number;
};

const Daily = ({ refreshSignal = 0 }: DailyProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { marketingPreference } = useMarketing();
  const router = useRouter();

  // Theme classes - must be called at component level
  const backgroundColorClass = useBackgroundColorClass();
  const textColorClass = useTextColorClass();

  const [refreshing, setRefreshing] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyCardProps[]>([]);

  const fetchReport = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIReport.getDailyReportsAPI(memberId);
        // Generate dates and merge with backend data
        const generatedDates = generateDates(30); // Show last 30 days
        const mergedData = mergeDataWithDates(Array.isArray(response) ? response : [], generatedDates);
        setDailyReport(mergedData);
      } else {
        console.log("Member ID is null");
        // Even without member ID, show dates with zero values
        const generatedDates = generateDates(30);
        const emptyData = mergeDataWithDates([], generatedDates);
        setDailyReport(emptyData);
      }
    } catch (error) {
      console.error("Error fetching reports", error);
      // On error, still show dates with zero values
      const generatedDates = generateDates(30);
      const emptyData = mergeDataWithDates([], generatedDates);
      setDailyReport(emptyData);
    }
  };

  // Generate dates starting from today going backwards
  const generateDates = (days: number = 30) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }
    return dates;
  };

  // Merge backend data with generated dates
  const mergeDataWithDates = (
    backendData: DailyCardProps[],
    generatedDates: string[]
  ) => {
    const dataMap = new Map(backendData.map((item) => [item.date, item]));

    return generatedDates.map((date) => {
      const existingData = dataMap.get(date);
      return (
        existingData || {
          date,
          amount: 0,
          sale: 0,
          adsCost: 0,
          profit: 0,
          percentageAds: 0,
          ROI: 0,
          expenses: 0,
        }
      );
    });
  };

  // Call API to get daily data
  useEffect(() => {
    fetchReport();
  }, [marketingPreference]); // Add marketingPreference to dependency array

  useEffect(() => {
    fetchReport();
  }, [refreshSignal]);

  // Refetch data when refreshing
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchReport();
    } catch {
      // fetchReport handles errors
    }
    setRefreshing(false);
  };

  const handleItemPress = (item: DailyCardProps) => {
    // Navigate to the detail screen with the selected item data
    router.push({
      pathname: "/dailyDetail",
      params: {
        date: item.date,
        selectedItem: JSON.stringify(item),
      },
    });
  };



  const tableColor = theme === "dark" ? "#29292a00" : "#fcfcfc00";

  return (
    <GestureHandlerRootView style={{ flex: 1, }}>
      <View
        className={`h-full ${backgroundColorClass}`}
        style={{
          width: isDesktop() ? "80%" : "100%",
          maxWidth: 1200,
          alignSelf: "center",
        }}
      >
        <View
          className={`flex flex-col items-end `}
          style={{
            backgroundColor: theme === "dark" ? "#1f1f1f" : "#f3f3f3",
            borderBottomWidth: 1,
            borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <View
            className="flex flex-row items-start justify-evenly w-full pl-5 "
            style={{
              paddingHorizontal: 10,
            }}
          >
            <View className="flex flex-col items-start  w-1/6">
              <CustomText
                style={{ fontSize: getResponsiveStyles().smallFontSize }}
                numberOfLines={1}
              >
                {t("income.table.date")}
              </CustomText>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <CustomText
                style={{ fontSize: getResponsiveStyles().smallFontSize }}
                numberOfLines={1}
              >
                {t("income.table.amount")}
              </CustomText>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <CustomText
                style={{ fontSize: getResponsiveStyles().smallFontSize }}
                numberOfLines={3}
              >
                {t("income.table.sales")}
              </CustomText>
            </View>

            {marketingPreference !== "organic" && (
              <View className="flex flex-col items-center w-1/6">
                <CustomText
                  style={{ fontSize: getResponsiveStyles().smallFontSize }}
                  numberOfLines={1}
                >
                  {t("income.table.adCost")}
                </CustomText>
              </View>
            )}
            
            {marketingPreference !== "organic" && (
            <View className="flex flex-col items-center w-1/6">
              <CustomText
                style={{ fontSize: getResponsiveStyles().smallFontSize }}
                numberOfLines={1}
              >
                + / -
              </CustomText>
            </View>
            )}
            {marketingPreference !== "organic" && (
              <View className="flex flex-col items-center w-1/6">
                <CustomText
                  style={{ fontSize: getResponsiveStyles().smallFontSize }}
                  numberOfLines={1}
                >
                  {t("income.table.percentAd")}
                </CustomText>
              </View>
            )}
          </View>
        </View>

        <FlatList
          data={dailyReport}
          keyExtractor={(item) => item.date.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
            >
              <DailyCard
                date={item.date}
                amount={formatNumberDisplay(item.amount)}
                sale={formatNumberDisplay(item.sale)}
                adsCost={formatNumberDisplay(item.adsCost)}
                profit={formatNumberDisplay(item.profit)}
                percentageAds={item.percentageAds}
                ROI={item.ROI}
                tableColor={tableColor}
                broaderColor={
                  theme === "dark" ? "border-teal-900" : "border-gray-100"
                }
                marketingPreference={marketingPreference}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <CustomText className="pt-10 text-center text-white">
              {t("common.notfound")}
            </CustomText>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default Daily;
