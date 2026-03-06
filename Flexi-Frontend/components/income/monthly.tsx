import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
} from "react-native";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { getMemberId } from "@/utils/utility";
import CallAPIReport from "@/api/report_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MonthlyCard from "../MonthlyCard";
import { CustomText } from "../CustomText";
import i18n from "@/i18n";
import {
  isMobile,
  getResponsiveStyles,
  getDeviceType,
  isDesktop,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useMarketing } from "@/providers/MarketingProvider";
import { useRouter } from "expo-router";

// Function to format numbers for display, handling the large values properly
const formatNumberDisplay = (num: number) => {
  const absolute = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absolute >= 1000000) {
    return `${sign}${(absolute / 1000000).toFixed(1)}M`;
  }

  if (absolute >= 1000) {
    return `${sign}${(absolute / 1000).toFixed(1)}K`;
  }

  return num.toString();
};

type MonthlyCardProps = {
  month: string;
  amount: number;
  sale: number;
  adsCost: number;
  expenses: number;
  profit: number;
  percentageAds: number;
  ROI: number;
};

type MonthlyProps = {
  refreshSignal?: number;
};

const monthly = ({ refreshSignal = 0 }: MonthlyProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyCardProps[]>([]);
  const responsiveStyles = getResponsiveStyles(); // Get responsive styles based on screen size
  const deviceType = getDeviceType();
  const { marketingPreference } = useMarketing();

  const fetchReport = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIReport.getMonthlyReportsAPI(memberId);
        // Generate months starting from oldest in database and merge with backend data
        const safeResponse = Array.isArray(response) ? response : [];
        const generatedMonths = generateMonths(safeResponse);
        const mergedData = mergeDataWithMonths(safeResponse, generatedMonths);
        setMonthlyReport(mergedData);
      } else {
        console.log("Member ID is null");
        // Even without member ID, show months with zero values (fallback to 12 months)
        const generatedMonths = generateMonths([]);
        const emptyData = mergeDataWithMonths([], generatedMonths);
        setMonthlyReport(emptyData);
      }
    } catch (error) {
      console.error("Error fetching reports", error);
      // On error, still show months with zero values (fallback to 12 months)
      const generatedMonths = generateMonths([]);
      const emptyData = mergeDataWithMonths([], generatedMonths);
      setMonthlyReport(emptyData);
    }
  };

  // Generate months starting from oldest month in database or fallback to 12 months ago
  const generateMonths = (
    backendData: MonthlyCardProps[] = [],
    months: number = 12
  ) => {
    let startDate: Date;

    if (backendData.length > 0) {
      // Find the oldest month from backend data
      const oldestMonth = backendData
        .map((item) => new Date(item.month + "-01")) // Convert YYYY-MM to Date
        .sort((a, b) => a.getTime() - b.getTime())[0]; // Sort ascending and get first

      startDate = new Date(oldestMonth);
    } else {
      // Fallback: start from 12 months ago if no backend data
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - (months - 1));
    }

    const monthsList = [];
    const currentDate = new Date();
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Generate months from oldest to current
    const iterDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (iterDate <= endDate) {
      const year = iterDate.getFullYear();
      const month = (iterDate.getMonth() + 1).toString().padStart(2, "0");
      monthsList.push(`${year}-${month}`);
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    // Reverse to show newest first (current month at top)
    return monthsList.reverse();
  };

  // Merge backend data with generated months
  const mergeDataWithMonths = (
    backendData: MonthlyCardProps[],
    generatedMonths: string[]
  ) => {
    const dataMap = new Map(backendData.map((item) => [item.month, item]));

    return generatedMonths.map((month) => {
      const existingData = dataMap.get(month);
      return (
        existingData || {
          month,
          amount: 0,
          sale: 0,
          adsCost: 0,
          expenses: 0,
          profit: 0,
          percentageAds: 0,
          ROI: 0,
        }
      );
    });
  };

  // Call API to get monthly data
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

  // Get appropriate icon size based on device type
  const getIconSize = () => {
    if (deviceType === "mobile") return 12;
    if (deviceType === "tablet") return 14;
    return 16;
  };

  // Handle MonthlyCard press to navigate to detail screen
  const handleItemPress = (item: MonthlyCardProps) => {
    router.push({
      pathname: "/MonthlyDetail",
      params: {
        month: item.month,
        selectedItem: JSON.stringify(item),
      },
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        className={`h-full ${useBackgroundColorClass()}`}
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
            <View
              className="flex flex-col items-start"
              style={{
                width: marketingPreference === "organic" ? "18%" : "15%",
              }}
            >
              <CustomText
                style={{ fontSize: responsiveStyles.smallFontSize }}
                numberOfLines={1}
              >
                {t("income.table.month")}
              </CustomText>
            </View>

            <View
              className="flex flex-col items-center"
              style={{
                width: marketingPreference === "organic" ? "15%" : "12%",
              }}
            >
              <CustomText
                style={{ fontSize: responsiveStyles.smallFontSize }}
                numberOfLines={1}
              >
                {t("income.table.amount")}
              </CustomText>
            </View>

            <View
              className="flex flex-col items-center"
              style={{
                width: marketingPreference === "organic" ? "18%" : "15%",
              }}
            >
              <CustomText
                style={{ fontSize: responsiveStyles.smallFontSize }}
                numberOfLines={3}
              >
                {t("income.table.sales")}
              </CustomText>
            </View>

            {marketingPreference !== "organic" && (
              <View
                className="flex items-center justify-center"
                style={{
                  width: "15%",
                  flexDirection: isMobile() ? "column" : "row",
                }}
              >
                <CustomText
                  style={{ fontSize: responsiveStyles.smallFontSize }}
                  numberOfLines={1}
                >
                  {t("income.table.adCost")}
                </CustomText>
              </View>
            )}

            <View
              className="flex items-center justify-center"
              style={{
                width: marketingPreference === "organic" ? "18%" : "15%",
                flexDirection: isMobile() ? "column" : "row",
              }}
            >
              <CustomText
                style={{ fontSize: responsiveStyles.smallFontSize }}
                numberOfLines={1}
              >
                {t("income.table.expense")}
              </CustomText>
            </View>

            <View
              className="flex items-center justify-center"
              style={{
                width: marketingPreference === "organic" ? "18%" : "15%",
                flexDirection: isMobile() ? "column" : "row",
              }}
            >
              <CustomText
                style={{ fontSize: responsiveStyles.smallFontSize }}
                numberOfLines={1}
              >
                {t("income.table.profit")}
              </CustomText>
            </View>
            {marketingPreference !== "organic" && (
              <View
                className="flex flex-col items-center"
                style={{
                  width: marketingPreference === "organic" ? "13%" : "13%",
                }}
              >
                <CustomText
                  style={{ fontSize: responsiveStyles.smallFontSize }}
                  numberOfLines={1}
                >
                  {t("income.table.percentAd")}
                </CustomText>
              </View>
            )}
          </View>
        </View>

        <FlatList
          data={monthlyReport}
          keyExtractor={(item) => item.month.toString()}
          renderItem={({ item }) => (
            <MonthlyCard
              month={item.month}
              amount={formatNumberDisplay(item.amount)}
              sale={formatNumberDisplay(item.sale)}
              adsCost={formatNumberDisplay(item.adsCost)}
              expenses={formatNumberDisplay(item.expenses)}
              profit={formatNumberDisplay(item.profit)}
              percentageAds={item.percentageAds}
              ROI={item.ROI}
              tableColor={theme === "dark" ? "bg-gray-800" : "bg-white"}
              broaderColor={
                theme === "dark" ? "border-teal-900" : "border-gray-300"
              }
              responsiveStyles={responsiveStyles}
              marketingPreference={marketingPreference}
              onPress={() => handleItemPress(item)}
            />
          )}
          ListEmptyComponent={() => (
            <CustomText
              className="pt-10 text-center text-white"
              style={{ fontSize: responsiveStyles.bodyFontSize }}
            >
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

export default monthly;
