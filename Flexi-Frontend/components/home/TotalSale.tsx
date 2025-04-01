import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import CircularChart from "@/components/CircularChart";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText"; // Assuming you have a CustomText component

const TotalSale = () => {
  const { theme } = useTheme();
  const { t } = useTranslation(); // กำหนดตัวแปรใช้งานภาษา
  const titleStyle = `text-sm ${
    theme === "dark" ? "text-[#ababab]" : "text-[#48453e]"
  } text-center font-normal`;
  const percentadsarv = `text-sm ${
    theme === "dark" ? "text-[#c6c7c7]" : "text-[#7f7765]"
  } text-center font-bold`;
  return (
    <View className="flex flex-col pt-2 pb-2 px-2 items-center justify-center">
      <View
        className={`flex-row ${
          theme === "dark" ? "bg-zinc-800" : "bg-white"
        } items-center w-full h-48 rounded-2xl border ${
          theme === "dark" ? "border-zinc-700" : "border-[#61fff2]"
        }`}
      >
        <View className="flex-1 bg-transparent items-center justify-center">
          {/* Center the circular percentage chart */}
          <View className="items-center justify-center">
            <CircularChart percentage={35} />
          </View>
        </View>

        {/* Total Sale */}
        <View className="bg-transparent items-center ps-6 justify-center w-52 h-60 rounded-2xl">
          <View className="flex-row justify-center w-full">
            <Text
              className={`text-xl font-bold ${
                theme === "dark" ? "text-[#ffffff]" : "text-[#3c3c3c]"
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              1,999,999
            </Text>

            <CustomText className={titleStyle}>
              {t("dashboard.sale")}
            </CustomText>
          </View>
          {/* row Ads and Profit */}
          <View className="flex-row justify-around  mt-2 px-6 ps-3">
            {/* ADS */}
            <View className="flex-colum ">
              <CustomText className={titleStyle}>
                {t("dashboard.ads")}
              </CustomText>
              <Text
                className={`text-lg ${
                  theme === "dark" ? "text-[#ffb700] " : "text-orange-400 "
                } font-bold text-center`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                45,999.99
              </Text>
            </View>

            {/* Profit */}
            <View className="flex-colum items-center justify-between w-full">
              <CustomText className={titleStyle}>
                {t("dashboard.profit")}
              </CustomText>
              <Text
                className={`text-lg font-bold ${
                  parseFloat("-999.99") >= 0
                    ? theme === "dark"
                      ? "text-teal-400"
                      : "text-teal-500"
                    : "text-[#FF006E]"
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                -1,999.99
              </Text>
            </View>
          </View>

          <View className="flex-row justify-around mt-3 px-0 ps-4">
            {/* %ADS */}
            <View className="flex-colum">
              <CustomText className={titleStyle}>
                {t("dashboard.roi")}
              </CustomText>
              <Text
                className={percentadsarv}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                3
              </Text>
            </View>

            {/* Average */}
            <View className="flex-colum items-center justify-between w-full">
              <CustomText className={titleStyle}>
                {t("dashboard.avr")}
              </CustomText>
              <Text
                className={percentadsarv}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                590
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TotalSale;
