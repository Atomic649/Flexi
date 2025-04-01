import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
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

type MonthlyCardProps = {
  month: string;
  amount: number;
  sale: number;
  adsCost: number;
  profit: number;
  percentageAds: number;
  ROI: number;
};

const monthly = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyCardProps[]>([]);

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
  }, []);

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

  // Adjust font size and color of Title Table
  const textStyle = {
    fontSize: 13,
    color: theme === "dark" ? "#e5e7eb" : "#4b5563",
    fontWeight: "700" as "700", // or any other acceptable value
    fontFamily: i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
        <View
          className={`flex flex-col items-end `}
          style={{
            backgroundColor: theme === "dark" ? "#adacac" : "#d0cfcb",
          }}
        >
          <View className="flex flex-row m-2 items-start justify-evenly w-full pl-5 px-5">
            <View className="flex flex-col items-start w-1/5">
              <Text style={textStyle} numberOfLines={1}>
              {t("income.table.month")}
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
          data={monthlyReport}
          keyExtractor={(item) => item.month.toString()}
          renderItem={({ item }) => (
            <MonthlyCard
              month={item.month}
              amount={item.amount}
              sale={item.sale}
              adsCost={item.adsCost}
              profit={item.profit}
              percentageAds={item.percentageAds}
              ROI={item.ROI}
              tableColor={theme === "dark" ? "bg-gray-800" : "bg-white"}
              broaderColor={
                theme === "dark" ? "border-teal-900" : "border-gray-300"
              }
            />
          )}
          ListEmptyComponent={() => (
            <CustomText className="pt-10 text-center text-white">{t("common.notfound")}</CustomText>
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
