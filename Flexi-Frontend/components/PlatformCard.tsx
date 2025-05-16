import React from "react";
import {
  View,
  Text,
  useWindowDimensions,
  Platform,
  Dimensions,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText"; // Assuming you have a CustomText component

const PlatformCard = ({
  sale,
  adsCost,
  profit,
  percentAds,
  average,
  icon,
  iconType,
  otherStyles,
}: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { width, height } = useWindowDimensions(); // Get screen dimensions
  const isPortrait = height > width; // Determine orientation
  const cardWidth = Math.min(isPortrait ? width * 0.48 : width * 0.189); // Adjust width based on orientation with a max limit of 290
  const cardHeight =
    cardWidth * (Dimensions.get("window").width > 768 ? 0.6 : 0.7); // Adjust height based on platform

  // Dynamic font sizes based on screen width
  const baseFontSize = Math.min(cardWidth * 0.080, 20); // Base size for mobile, max 20
  const smallFontSize = Math.min(baseFontSize * 0.8, 14); // Max 14
  const largeFontSize = Math.min(baseFontSize * 1.05, 28); // Max 28

  const renderIcon = () => {
    const IconComponent = iconType === "FontAwesome" ? FontAwesome : Ionicons;
    return (
      <IconComponent
        name={icon}
        size={cardWidth * (Platform.OS === "web" ? 0.08 : 0.115)}
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
      className={`relative flex flex-col items-center justify-center ${otherStyles}`}
      style={{
        position: "relative",
        overflow: "visible",
        margin: Platform.OS === "web" ? "0.4%" : "0.1%",
      }} // Ensure stacking context and visibility
    >
      {/* Icon */}
      <View
        className="flex flex-col items-center justify-center mb-1"
        style={{ position: "relative", zIndex: 1 }} // Ensure stacking context for the icon container
      >
        <View
          className={`            
            ${theme === "dark" ? "bg-[#8d8c8b]" : "bg-[#48453e]"}
            rounded-full 
            items-center 
            justify-center          
          `}
          style={{
            width: cardWidth * (Platform.OS === "web" ? 0.19 : 0.23),
            height: cardWidth * (Platform.OS === "web" ? 0.19 : 0.23),
            zIndex: 9999, // Ensure highest stacking order
            position: "absolute", // Explicitly set position
            top: -cardWidth * (Platform.OS === "web" ? 0.01 : 0.01), // Adjust position
            right: cardWidth * (Platform.OS === "web" ? 0.32 : 0.28), // Adjust position
          }}
        >
          {renderIcon()}
        </View>
      </View>
      <View
        style={{
          width: cardWidth,
          height: cardHeight,

          // paddingTop: cardWidth*0.2,
          // paddingBottom: cardWidth*0.2,
          //gap: Platform.OS === "web" ? "4%" : 0,
        }} // Dynamically set width and height
        className={`${
          theme === "dark" ? "bg-[#27272a]" : "bg-white"
        } items-center
             justify-center 
           
               rounded-2xl            
             border
            ${
              theme === "dark" ? "border-zinc-700" : "border-[#61fff2]"
            }                     
              `}
      >
        {/* Sales */}
        <View className="flex-row justify-center w-full ps-6">
          <Text
            className={`font-bold`}
            style={{
              fontSize: largeFontSize,
              color: theme === "dark" ? "#ffffff" : "#3c3c3c",
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {sale}
          </Text>
          <Text className={titleStyle} style={{ fontSize: smallFontSize }}>
            {t("dashboard.sale")}
          </Text>
        </View>

        <View className="flex-row justify-around w-full mt-1 px-0 ps-4 ">
          {/* ADS */}
          <View className="flex-col">
            <CustomText
              className={titleStyle}
              style={{ fontSize: smallFontSize }}
            >
              {t("dashboard.ads")}
            </CustomText>
            <Text
              className={`font-bold text-center`}
              style={{
                fontSize: baseFontSize,
                color: theme === "dark" ? "#dddddd" : "#7f7765",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {adsCost}
            </Text>
          </View>

          {/* Profit */}
          <View className="flex-col selection:items-center justify-items-center ">
            <CustomText
              className={titleStyle}
              style={{ fontSize: smallFontSize }}
            >
              {t("dashboard.profit")}
            </CustomText>
            <Text
              className={`font-bold text-center`}
              style={{
                fontSize: baseFontSize,
                color:
                  parseFloat(profit) >= 0
                    ? theme === "dark"
                      ? "#00fad9"
                      : "#4400ff"
                    : "#FF006E",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {profit}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-around w-full mt-1 mb-1 px-0 ps-4">
          {/*ROI */}
          <View className="flex-col">
            <CustomText
              className={titleStyle}
              style={{ fontSize: smallFontSize }}
            >
              {t("dashboard.roi")}
            </CustomText>
            <Text
              className={`font-bold text-center`}
              style={{
                fontSize: baseFontSize,
                color: theme === "dark" ? "#c6c7c7" : "#7f7765",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {percentAds}
            </Text>
          </View>

          {/* Average */}
          <View className="flex-col items-center justify-between ">
            <CustomText
              className={titleStyle}
              style={{ fontSize: smallFontSize }}
            >
              {t("dashboard.avr")}
            </CustomText>
            <Text
              className={`font-bold text-center`}
              style={{
                fontSize: baseFontSize,
                color: theme === "dark" ? "#c6c7c7" : "#7f7765",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {average}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PlatformCard;
