import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { getMemberId } from "@/utils/utility";
import CallAPIReport from "@/api/report_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DailyCard from "../DailyCard";
import { CustomText } from "../CustomText";
import i18n from "@/i18n";
import { isMobile } from "@/utils/responsive";

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
};

const Daily = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyCardProps[]>([]);

  // Call API to get daily data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIReport.getDailyReportsAPI(memberId);
          setDailyReport(response);
        } else {
          console.log("Member ID is null");
        }
      } catch (error) {
        console.error("Error fetching reports", error);
      }
    };
    fetchReport();
  }, []);

  // Refetch data when refreshing
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIReport.getDailyReportsAPI(memberId);
        setDailyReport(response);
      } else {
        console.error("Member ID is null");
      }
    } catch (error) {
      console.error("Error fetching reports", error);
    }
    setRefreshing(false);
  };
  // Adjust front size and color of Title Table
  const textStyle = {
    fontSize: 13,
    color: isMobile() ? theme === "dark" ? "#27272a" : "#4b5563": theme === "dark" ? "#b4b4b5" : "#4b5563",
    fontWeight: "900" as "900", // or any other acceptable value
    fontFamily:
      i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
  };

  const tableColor = theme === "dark" ? "#29292a00" : "#fcfcfc00";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        className={`h-full ${useBackgroundColorClass()}`}
        style={{
          width: Dimensions.get("window").width > 768  ? "60%" : "100%",
          maxWidth: 800,
          alignSelf: "center",
         // paddingTop: Platform.OS === "web" ? "1.5%":0
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
          <View
            className="flex flex-row m-3 items-start justify-evenly w-full pl-5 "
            style={{
              marginHorizontal: 10,
            }}
          >
            <View className="flex flex-col items-start  w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.date")}
              </Text>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.amount")}
              </Text>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={3}>
                {t("income.table.sales")}
              </Text>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.adCost")}
              </Text>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.profit")}
              </Text>
            </View>
            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.percentAd")}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          data={dailyReport}
          keyExtractor={(item) => item.date.toString()}
          renderItem={({ item }) => (
            <DailyCard
              date={item.date}
              amount={item.amount}
              sale={formatNumberDisplay(item.sale)}
              adsCost={formatNumberDisplay(item.adsCost)}
              profit={formatNumberDisplay(item.profit)}
              percentageAds={item.percentageAds}
              ROI={item.ROI}
              tableColor={tableColor}
              broaderColor={
                theme === "dark" ? "border-teal-900" : "border-gray-100"
              }
            />
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Daily;
