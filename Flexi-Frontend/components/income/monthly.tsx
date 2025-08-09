import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
  DeviceEventEmitter,
} from "react-native";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
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
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useMarketing } from "@/providers/MarketingProvider";

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

const monthly = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyCardProps[]>([]);
  const responsiveStyles = getResponsiveStyles(); // Get responsive styles based on screen size
  const deviceType = getDeviceType();
  const { marketingPreference } = useMarketing();

  // Generate months starting from oldest month in database or fallback to 12 months ago
  const generateMonths = (backendData: MonthlyCardProps[] = [], months: number = 12) => {
    let startDate: Date;
    
    if (backendData.length > 0) {
      // Find the oldest month from backend data
      const oldestMonth = backendData
        .map(item => new Date(item.month + '-01')) // Convert YYYY-MM to Date
        .sort((a, b) => a.getTime() - b.getTime())[0]; // Sort ascending and get first
      
      startDate = new Date(oldestMonth);
    } else {
      // Fallback: start from 12 months ago if no backend data
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - (months - 1));
    }
    
    const monthsList = [];
    const currentDate = new Date();
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Generate months from oldest to current
    const iterDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (iterDate <= endDate) {
      const year = iterDate.getFullYear();
      const month = (iterDate.getMonth() + 1).toString().padStart(2, '0');
      monthsList.push(`${year}-${month}`);
      iterDate.setMonth(iterDate.getMonth() + 1);
    }
    
    // Reverse to show newest first (current month at top)
    return monthsList.reverse();
  };

  // Merge backend data with generated months
  const mergeDataWithMonths = (backendData: MonthlyCardProps[], generatedMonths: string[]) => {
    const dataMap = new Map(backendData.map(item => [item.month, item]));
    
    return generatedMonths.map(month => {
      const existingData = dataMap.get(month);
      return existingData || {
        month,
        amount: 0,
        sale: 0,
        adsCost: 0,
        expenses: 0,
        profit: 0,
        percentageAds: 0,
        ROI: 0,
      };
    });
  };

  // Call API to get monthly data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIReport.getMonthlyReportsAPI(memberId);
          // Generate months starting from oldest in database and merge with backend data
          const generatedMonths = generateMonths(response || []);
          const mergedData = mergeDataWithMonths(response || [], generatedMonths);
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
    fetchReport();
  }, [marketingPreference]); // Add marketingPreference to dependency array

  // Refetch data when refreshing
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIReport.getMonthlyReportsAPI(memberId);
        // Generate months starting from oldest in database and merge with backend data
        const generatedMonths = generateMonths(response || []);
        const mergedData = mergeDataWithMonths(response || [], generatedMonths);
        setMonthlyReport(mergedData);
      } else {
        console.error("Member ID is null");
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
    setRefreshing(false);
  };

  // Get appropriate icon size based on device type
  const getIconSize = () => {
    if (deviceType === "mobile") return 12;
    if (deviceType === "tablet") return 14;
    return 16;
  };

  // Adjust font size and color of Title Table with responsive styling
  const textStyle = {
    fontSize: responsiveStyles.smallFontSize,
    color: isMobile()
      ? theme === "dark"
        ? "#27272a"
        : "#4b5563"
      : theme === "dark"
      ? "#b4b4b5"
      : "#4b5563",
   // fontWeight: "900" as "900",
    fontFamily:
      i18n.language === "th" ? "IBMPlexSansThai-Regular" : "Poppins-Regular",
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        className={`h-full ${useBackgroundColorClass()}`}
        style={{
          width: Dimensions.get("window").width > 768 ? "60%" : "100%",
          maxWidth: 800,
          alignSelf: "center",
        }}
      >
        <View
          className={`flex flex-col items-end `}
          style={{
            backgroundColor:
              Platform.OS === "web"
                ? "transparent"
                : theme === "dark"
                ? "#adacac"
                : "#d0cfcb",
            borderBottomWidth: 1,
            borderColor: theme === "dark" ? "#27272a" : "#e5e7eb",
          }}
        >
          <View className="flex flex-row m-3 items-start justify-evenly w-full pl-5 ">
            <View
              className="flex flex-col items-start"
              style={{ width: marketingPreference === "organic" ? "18%" : "15%" }}
            >
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.month")}
              </Text>
            </View>

            <View
              className="flex flex-col items-center"
              style={{ width: marketingPreference === "organic" ? "15%" : "12%" }}
            >
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.amount")}
              </Text>
            </View>

            <View
              className="flex flex-col items-center"
              style={{ width: marketingPreference === "organic" ? "18%" : "15%" }}
            >
              <Text style={textStyle} numberOfLines={3}>
                {t("income.table.sales")}
              </Text>
            </View>

            {marketingPreference !== "organic" && (
              <View
                className="flex items-center justify-center"
                style={{
                  width: "15%",
                  flexDirection: isMobile() ? "column" : "row",
                }}
              >
                <Text style={textStyle} numberOfLines={1}>
                  {t("income.table.adCost")}
                </Text>
                {/* Information sign */}
                <Ionicons
                  name="information-circle-outline"
                  size={getIconSize()}
                  color={
                    isMobile()
                      ? theme === "dark"
                        ? "#27272a"
                        : "#4b5563"
                      : theme === "dark"
                      ? "#b4b4b5"
                      : "#4b5563"
                  }
                  style={isMobile() ? {} : { marginLeft: 5 }}
                  onPress={() => {
                    // Show tooltip or alert with more information
                    alert(t("income.table.adCostInfo"));
                  }}
                />
              </View>
            )}

            <View
              className="flex items-center justify-center"
              style={{
                width: marketingPreference === "organic" ? "18%" : "15%",
                flexDirection: isMobile() ? "column" : "row",
              }}
            >
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.expense")}
              </Text>
              {/* Information sign */}
              <Ionicons
                name="information-circle-outline"
                size={getIconSize()}
                color={
                  isMobile()
                    ? theme === "dark"
                      ? "#27272a"
                      : "#4b5563"
                    : theme === "dark"
                    ? "#b4b4b5"
                    : "#4b5563"
                }
                style={isMobile() ? {} : { marginLeft: 5 }}
                onPress={() => {
                  // Show tooltip or alert with more information
                  alert(t("income.table.expenseInfo"));
                }}
              />
            </View>

            <View
              className="flex items-center justify-center"
              style={{
                width: marketingPreference === "organic" ? "18%" : "15%",
                flexDirection: isMobile() ? "column" : "row",
              }}
            >
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.profit")}
              </Text>
              {/* Information sign */}
              <Ionicons
                name="information-circle-outline"
                size={getIconSize()}
                color={
                  isMobile()
                    ? theme === "dark"
                      ? "#27272a"
                      : "#4b5563"
                    : theme === "dark"
                    ? "#b4b4b5"
                    : "#4b5563"
                }
                style={isMobile() ? {} : { marginLeft: 5 }}
                onPress={() => {
                  // Show tooltip or alert with more information
                  alert(t("income.table.profitInfo"));
                }}
              />
            </View>
                {marketingPreference !== "organic" && (

            <View
              className="flex flex-col items-center"
              style={{ width: marketingPreference === "organic" ? "13%" : "13%" }}
            >
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.percentAd")}
              </Text>
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
              amount={item.amount}
              sale={item.sale}
              adsCost={item.adsCost}
              expenses={item.expenses}
              profit={item.profit}
              percentageAds={item.percentageAds}
              ROI={item.ROI}
              tableColor={theme === "dark" ? "bg-gray-800" : "bg-white"}
              broaderColor={
                theme === "dark" ? "border-teal-900" : "border-gray-300"
              }
              responsiveStyles={responsiveStyles}
              marketingPreference={marketingPreference}
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default monthly;
