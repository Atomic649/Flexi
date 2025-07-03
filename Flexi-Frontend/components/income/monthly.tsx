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

  // Call API to get monthly data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIReport.getMonthlyReportsAPI(memberId);
          setMonthlyReport(response);
        } else {
          console.log("Member ID is null");
        }
      } catch (error) {
        console.error("Error fetching reports", error);
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
        setMonthlyReport(response);
      } else {
        console.error("Member ID is null");
      }
    } catch (error) {
      console.error("Error fetching reports", error);
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
    fontSize: responsiveStyles.bodyFontSize,
    color: isMobile()
      ? theme === "dark"
        ? "#27272a"
        : "#4b5563"
      : theme === "dark"
      ? "#b4b4b5"
      : "#4b5563",
    fontWeight: "900" as "900",
    fontFamily:
      i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
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

            <View
              className="flex flex-col items-center"
              style={{ width: marketingPreference === "organic" ? "13%" : "13%" }}
            >
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.percentAd")}
              </Text>
            </View>
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
