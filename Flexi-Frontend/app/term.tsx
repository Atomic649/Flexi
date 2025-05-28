import { View, ScrollView, Platform, Dimensions } from "react-native";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import LegalSection from "@/components/LegalSection";
import { FontAwesome } from "@expo/vector-icons";

export default function Term() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Terms of Service content sections using translation keys
  const termsData = [
    {
      title: t("terms.sections.overview.title"),
      content: [
        t("terms.sections.overview.description"),
        "",
        `• ${t("terms.sections.overview.salesTracking")}`,
        `• ${t("terms.sections.overview.adAnalysis")}`,
        `• ${t("terms.sections.overview.reporting")}`,
        `• ${t("terms.sections.overview.notifications")}`,
        `• ${t("terms.sections.overview.recordkeeping")}`,
        `• ${t("terms.sections.overview.taxTools")}`
      ]
    },
    {
      title: t("terms.sections.registration.title"),
      content: [
        t("terms.sections.registration.description"),
        "",
        `• ${t("terms.sections.registration.accurate")}`,
        `• ${t("terms.sections.registration.secure")}`,
        `• ${t("terms.sections.registration.responsible")}`
      ]
    },
    {
      title: t("terms.sections.acceptableUse.title"),
      content: [
        t("terms.sections.acceptableUse.description"),
        "",
        `• ${t("terms.sections.acceptableUse.lawful")}`,
        `• ${t("terms.sections.acceptableUse.interfere")}`,
        `• ${t("terms.sections.acceptableUse.reverseEngineer")}`
      ]
    },
    {
      title: t("terms.sections.dataOwnership.title"),
      content: [
        t("terms.sections.dataOwnership.description"),
        "",
        `• ${t("terms.sections.dataOwnership.operating")}`,
        `• ${t("terms.sections.dataOwnership.insights")}`
      ]
    },
    {
      title: t("terms.sections.thirdParty.title"),
      content: [
        t("terms.sections.thirdParty.description"),
        "",
        t("terms.sections.thirdParty.grantingAccess"),
        "",
        `• ${t("terms.sections.thirdParty.rightToAccess")}`,
        `• ${t("terms.sections.thirdParty.compliance")}`,
        `• ${t("terms.sections.thirdParty.revocation")}`,
        "",
        t("terms.sections.thirdParty.disclaimer")
      ]
    },
    {
      title: t("terms.sections.security.title"),
      content: [
        t("terms.sections.security.description")
      ]
    },
    {
      title: t("terms.sections.termination.title"),
      content: [
        t("terms.sections.termination.description")
      ]
    },
    {
      title: t("terms.sections.disclaimers.title"),
      content: [
        t("terms.sections.disclaimers.description")
      ]
    },
    {
      title: t("terms.sections.governingLaw.title"),
      content: [
        t("terms.sections.governingLaw.description")
      ]
    }
  ];

  return (
    <SafeAreaView 
      className={`h-full ${useBackgroundColorClass()}`}
      style={Platform.OS === "web" ? { paddingTop: 60 } : {}}
    >
      <ScrollView>
        <View 
          style={{
            padding: 20,
            width: Dimensions.get("window").width > 768 ? "80%" : "90%",
            maxWidth: 800,
            alignSelf: "center",
          }}
        >
          <View className="flex-row items-center justify-center mb-6">
            <FontAwesome 
              name="file-text" 
              size={24} 
              color={theme === "dark" ? "#fff" : "#333"} 
              style={{ marginRight: 10 }} 
            />
            <CustomText 
              weight="bold"
              className="text-2xl text-center"
            >
              {t("terms.title")}
            </CustomText>
          </View>
          
          <CustomText 
            className="mb-4 text-center"
            weight="medium"
          >
            {t("terms.effectiveDate")}
          </CustomText>
          
          <CustomText className="mb-6">
            {t("terms.introduction")}
          </CustomText>
          
          {termsData.map((section, index) => (
            <LegalSection 
              key={index}
              title={section.title}
              content={section.content}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
