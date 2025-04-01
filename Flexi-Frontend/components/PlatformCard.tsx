import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTextColorClass } from "@/utils/themeUtils";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {CustomText} from "@/components/CustomText"; // Assuming you have a CustomText component

const PlatformCard = ({
  sale,
  adsCost,
  profit,
  percentAds,
  average,
  icon,
  iconType,
  iconSize,
  otherStyles,
}: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const renderIcon = () => {
    const IconComponent = iconType === "FontAwesome" ? FontAwesome : Ionicons;
    return (
      <IconComponent
        name={icon}
        size={iconSize}
        color={theme === "dark" ? "#27272a" : "#ffffff"}
      />
    );
  };

  // TEXT styles
  const titleStyle = `text-sm ${
    theme === "dark" ? "text-[#c9c9c9]" : "text-[#48453e]"
  } text-center font-normal`;
  const percentadsarv = `text-sm ${
    theme === "dark" ? "text-[#c6c7c7]" : "text-[#7f7765]"
  } text-center font-bold`;

  return (
    <View
      className={`flex flex-col  items-center justify-center ${otherStyles}`}
    >
      {/* Icon */}
      <View className="flex flex-col items-center justify-center mb-1">
        <View
          className={`
            w-12 h-12
            ${theme === "dark" ? "bg-[#8d8c8b]" : "bg-[#48453e]"}
            rounded-full 
            items-center 
            justify-center 
            absolute -top-1        
            right-16
            z-10
          `}
        >
          {renderIcon()}
        </View>
      </View>
      <View className="relative">
        <View
          className={`${
            theme === "dark" ? "bg-[#27272a]" : "bg-white"
          }  items-center
           justify-center 
           m-1 pt-2 w-52 h-36       
             rounded-2xl            
           border
          ${
            theme === "dark" ? "border-zinc-700" : "border-[#61fff2]"
          }                     
            `}
            // m-1 pt-2 w-full h-0 pb-[75%]      
        >
          {/* Sales */}
          <View className="flex-row justify-center w-full  ps-6">
            <Text
              className={`text-lg ${
                theme === "dark" ? "text-[#ffffff]" : "text-[#3c3c3c]"
              } font-bold`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {sale}
            </Text>
            <CustomText className={titleStyle}>{t("dashboard.sale")}</CustomText>
          </View>
          <View className="flex-row justify-around w-full mt-1 px-0 ps-4">
            {/* ADS */}
            <View className="flex-col">
              <CustomText className={titleStyle}>{t("dashboard.ads")}</CustomText>
              <Text
                className={`text-base ${
                  theme === "dark" ? "text-[#dddddd]" : "text-stone-500"
                } font-bold text-center`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {adsCost}
              </Text>
            </View>

            {/* Profit */}
            <View className="flex-col selection:items-center justify-items-center ">
              <CustomText className={titleStyle}>{t("dashboard.profit")}</CustomText>
              <Text
                className={`text-base font-bold text-center ${
                  parseFloat(profit) >= 0
                    ? theme === "dark"
                      ? "text-[#00fad9]"
                      : "text-[#4400ff]"
                    : "text-[#FF006E] "
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {profit}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-around w-full mt-1 mb-1 px-0 ps-4">
            {/* %ADS */}
            <View className="flex-col">
              <CustomText className={titleStyle}>{t("dashboard.roi")}</CustomText>
              <Text
                className={percentadsarv}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {percentAds}
              </Text>
            </View>

            {/* Average */}
            <View className="flex-colum items-center justify-between ">
              <CustomText className={titleStyle}>{t("dashboard.avr")}</CustomText>
              <Text
                className={percentadsarv}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {average}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PlatformCard;
