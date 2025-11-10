import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { getResponsiveStyles } from "@/utils/responsive";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { CustomText} from "./CustomText";

const formatDate = (dateString: string) => {
  const month = new Date(dateString);
  const monthIndex = month.getMonth(); // 0-11
  
  // Get current language
  const currentLang = i18n.language || 'th';
  
  // Define month names for each supported language
  const monthNames = {
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    th: [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
  };
  
  // Return translated month name based on current language
  return monthNames[currentLang as keyof typeof monthNames][monthIndex] || month.toLocaleString("default", { month: "long" });
};

// Helper function to determine if a profit value is positive
const isPositiveProfit = (profit: string | number): boolean => {
  if (typeof profit === 'number') return profit >= 0;
  
  // If it's a string, handle potential suffixes like 'K'
  const profitStr = String(profit).trim();
  
  // Check if it starts with a negative sign
  if (profitStr.startsWith('-')) return false;
  
  // If it starts with a number or positive sign, it's positive
  return true;
};

export default function MonthlyCard({
  month,
  amount,
  sale,
  adsCost,
  profit,
  percentageAds,
  expenses,
  ROI,
  tableColor,
  responsiveStyles,
  marketingPreference = "ads", // Default to "ads" if not provided
  onPress, // Add onPress prop
}: any) {
  // Use provided responsive styles or get default ones
  const styles = responsiveStyles || getResponsiveStyles();
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity onPress={onPress} className="flex ">
      <View className={`flex flex-col items-end `} style={{ 
        backgroundColor: tableColor,
        borderBottomWidth: 1,
        borderColor: "rgba(124, 113, 113, 0.126)",         
        borderStyle: "solid",
        marginTop: 5,
       }}>
        <View className="flex flex-row m-2 items-start justify-evenly w-full pl-5 ">
          <View 
            style={{ width: marketingPreference === "organic" ? "18%" : "15%" }} 
            className="flex flex-col items-start"
          >
            <CustomText
              className="text-zinc-500 font-base "
              style={{ fontSize: styles.smallFontSize*1.05 }}
              numberOfLines={1}
            >
              {formatDate(month)}
            </CustomText>
          </View>
          
          <View 
            style={{ width: marketingPreference === "organic" ? "15%" : "12%" }} 
            className="flex flex-col items-center"
          >
            <Text
              className="text-zinc-500 font-normal justify-center"
              style={{ fontSize: styles.smallFontSize }}
              numberOfLines={1}
            >
              {amount}
            </Text>
          </View>

          <View 
            style={{ width: marketingPreference === "organic" ? "18%" : "15%" }} 
            className="flex flex-col items-center"
          >
            <Text
              className="font-normal text-zinc-500 items-end justify-end"
              style={{ fontSize: styles.smallFontSize }}
              numberOfLines={1}
            >
              {sale}
            </Text>
          </View>
        
          {marketingPreference !== "organic" && (
            <View 
              style={{ width: "15%" }} 
              className="flex flex-col items-center"
            >
              <Text
                className="text-zinc-500 font-normal justify-end"
                style={{ fontSize: styles.smallFontSize }}
                numberOfLines={1}
              >
                {adsCost}
              </Text>
            </View>
          )}

          <View 
            style={{ width: marketingPreference === "organic" ? "18%" : "15%" }} 
            className="flex flex-col items-center"
          >
            <Text
              className="text-zinc-500 font-normal justify-end"
              style={{ fontSize: styles.smallFontSize }}
              numberOfLines={1}
            >
              {expenses}
            </Text>
          </View>

          <View 
            style={{ width: marketingPreference === "organic" ? "18%" : "15%" }} 
            className="flex flex-col items-center"
          >
            <Text
              className={`font-bold justify-end ${isPositiveProfit(profit) ? 'text-teal-500' : 'text-[#FF006E]'}`}
              style={{ fontSize: styles.bodyFontSize }}
              numberOfLines={1}
            >
              {profit}
            </Text>
          </View>
              {marketingPreference !== "organic" && (
          <View 
            style={{ width: "13%" }} 
            className="flex flex-col items-center"
          >
            <Text
              className={`font-normal justify-end text-zinc-500`}
              style={{ fontSize: styles.smallFontSize }}
              numberOfLines={1}
            >
              {percentageAds}%
            </Text>
          </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
