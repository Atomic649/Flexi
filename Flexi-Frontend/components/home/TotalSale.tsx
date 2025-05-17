import React from "react";
import {
  View,
  Text,
  useWindowDimensions,
  Platform,
  Dimensions,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import CircularChart from "@/components/CircularChart";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";

const TotalSale = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  // Dynamic font sizes
  const baseFontSize =
    Platform.OS === "web"
      ? Math.min(width * 0.085, 18)
      : Math.min(width * 0.085, 16); // Base size for mobile, max 20
  const smallFontSize =
    Platform.OS === "web"
      ? Math.min(baseFontSize * 0.8, 18)
      : Math.min(baseFontSize * 0.8, 14); // Max 14
  const largeFontSize =
    Platform.OS === "web"
      ? Math.min(baseFontSize * 1.05, 28)
      : Math.min(baseFontSize * 1.05, 28); // Max 28

  return (
    <View
      style={{
        flex: 0.65,
        paddingTop: 8,
        paddingBottom: Platform.OS === "web" ? 0 : 4,
        paddingHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme === "dark" ? "#27272a" : "#ffffff",
          alignItems: "center",
          width: "100%",
          height: isPortrait ? width * 0.42 : width * 0.15,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme === "dark" ? "#3f3f46" : "#61fff2",
          //   maxWidth: 600,
        }}
      >
        <View
          style={{
            flex: 0.9,
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularChart
            percentage={35}
            size={
              Dimensions.get("window").width > 1080 ? width * 0.086 : undefined
            }
          />
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "hsla(0, 31%, 93%, 0)",
            alignItems: "center",
            paddingStart: 5,
            justifyContent: "center",
            width: isPortrait ? width * 0.4 : width * 0.2,
            height: isPortrait ? width * 0.5 : width * 0.25,
            borderRadius: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: largeFontSize,
                fontWeight: "bold",
                color: theme === "dark" ? "#ffffff" : "#3c3c3c",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              1,999,999
            </Text>
            <CustomText
              style={{
                fontSize: smallFontSize,
                color: theme === "dark" ? "#ababab" : "#48453e",
                textAlign: "center",
                fontWeight: "normal",
              }}
            >
              {t("dashboard.sale")}
            </CustomText>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 8,
              paddingHorizontal: 24,
              gap: "15%",
            }}
          >
            {/* Ads */}
            <View>
              <CustomText
                style={{
                  fontSize: smallFontSize,
                  color: theme === "dark" ? "#ababab" : "#48453e",
                  textAlign: "center",
                  fontWeight: "normal",
                }}
              >
                {t("dashboard.ads")}
              </CustomText>
              <Text
                style={{
                  fontSize: baseFontSize,
                  fontWeight: "bold",
                  color: theme === "dark" ? "#ffb700" : "#ff8c00",
                  textAlign: "center",
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                45,999.99
              </Text>
            </View>

            {/* Profit */}
            <View>
              <CustomText
                style={{
                  fontSize: smallFontSize,
                  color: theme === "dark" ? "#ababab" : "#48453e",
                  textAlign: "center",
                  fontWeight: "normal",
                }}
              >
                {t("dashboard.profit")}
              </CustomText>
              <Text
                style={{
                  fontSize: baseFontSize,
                  fontWeight: "bold",
                  color:
                    parseFloat("-999.99") >= 0
                      ? theme === "dark"
                        ? "#00fad9"
                        : "#4400ff"
                      : "#FF006E",
                  textAlign: "center",
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                -1,999.99
              </Text>
            </View>
          </View>

          {/* ROI and AVR */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 12,
              paddingHorizontal: 2,
              gap: "45%",
            }}
          >
            {/* ROI */}
            <View>
              <CustomText
                style={{
                  fontSize: smallFontSize,
                  color: theme === "dark" ? "#ababab" : "#48453e",
                  textAlign: "center",
                  fontWeight: "normal",
                }}
              >
                {t("dashboard.roi")}
              </CustomText>
              <Text
                style={{
                  fontSize: smallFontSize,
                  fontWeight: "bold",
                  color: theme === "dark" ? "#c6c7c7" : "#7f7765",
                  textAlign: "center",
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                3
              </Text>
            </View>

            <View>
              <CustomText
                style={{
                  fontSize: smallFontSize,
                  color: theme === "dark" ? "#ababab" : "#48453e",
                  textAlign: "center",
                  fontWeight: "normal",
                }}
              >
                {t("dashboard.avr")}
              </CustomText>
              <Text
                style={{
                  fontSize: smallFontSize,
                  fontWeight: "bold",
                  color: theme === "dark" ? "#c6c7c7" : "#7f7765",
                  textAlign: "center",
                }}
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
