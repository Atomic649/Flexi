import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,  
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { isMobileWeb } from "@/utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MobileWebScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#121212" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#2a2a2a";
  const buttonBgColor = isDark ? "#333333" : "#f0f0f0";
  const buttonTextColor = isDark ? "#ffffff" : "#000000";

  const handleAppStoreTap = () => {
    // Placeholder for actual App Store URL when available
    alert(t("mobileWeb.alerts.appStore"));
  };

  const handlePlayStoreTap = () => {
    // Placeholder for actual Play Store URL when available
    alert(t("mobileWeb.alerts.playStore"));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.messageContainer}>
          <CustomText
            weight="bold"
            style={[styles.title, { color: textColor }]}
          >
            {t("mobileWeb.businessName")}
          </CustomText>

          <CustomText style={[styles.message, { color: textColor }]}>
            {t("mobileWeb.notOptimized")}
          </CustomText>

          <CustomText style={[styles.message, { color: textColor }]}>
            {t("mobileWeb.forBestExperience")}
          </CustomText>

          <View style={styles.buttonContainer}>
            {/* App Store Button */}
            <TouchableOpacity
              style={[styles.storeButton, { backgroundColor: buttonBgColor }]}
              onPress={handleAppStoreTap}
            >
              <Ionicons name="logo-apple" size={24} color={buttonTextColor} />
              <View style={styles.buttonTextContainer}>
                <CustomText
                  style={[
                    styles.storeButtonSmallText,
                    { color: buttonTextColor },
                  ]}
                >
                  {t("mobileWeb.appStore.download")}
                </CustomText>
                <CustomText
                  weight="semibold"
                  style={[styles.storeButtonText, { color: buttonTextColor }]}
                >
                  {t("mobileWeb.appStore.title")}
                </CustomText>
                <CustomText
                  style={[styles.comingSoon, { color: buttonTextColor }]}
                >
                  {t("mobileWeb.appStore.comingSoon")}
                </CustomText>
              </View>
            </TouchableOpacity>

            {/* Play Store Button */}
            <TouchableOpacity
              style={[styles.storeButton, { backgroundColor: buttonBgColor }]}
              onPress={handlePlayStoreTap}
            >
              <Ionicons
                name="logo-google-playstore"
                size={24}
                color={buttonTextColor}
              />
              <View style={styles.buttonTextContainer}>
                <CustomText
                  style={[
                    styles.storeButtonSmallText,
                    { color: buttonTextColor },
                  ]}
                >
                  {t("mobileWeb.playStore.download")}
                </CustomText>
                <CustomText
                  weight="semibold"
                  style={[styles.storeButtonText, { color: buttonTextColor }]}
                >
                  {t("mobileWeb.playStore.title")}
                </CustomText>
                <CustomText
                  style={[styles.comingSoon, { color: buttonTextColor }]}
                >
                  {t("mobileWeb.playStore.comingSoon")}
                </CustomText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    //width: 150,
    //height: 150,
    marginBottom: 30,
    width: isMobileWeb() ? Dimensions.get("window").width * 0.25 : 180,
    height: isMobileWeb() ? Dimensions.get("window").width * 0.25 : 180,
  },
  messageContainer: {
    alignItems: "center",
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    width: "100%",
    gap: 15,
  },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    maxWidth: 280,
  },
  buttonTextContainer: {
    marginLeft: 12,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  storeButtonSmallText: {
    fontSize: 12,
  },
  storeButtonText: {
    fontSize: 16,
  },
  comingSoon: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 2,
  },
});
