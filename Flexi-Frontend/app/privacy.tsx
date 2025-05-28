import { View, ScrollView, Platform, Dimensions } from "react-native";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import LegalSection from "@/components/LegalSection";
import { FontAwesome } from "@expo/vector-icons";

export default function Privacy() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Privacy Policy content sections using translation keys
  const privacyData = [
    {
      title: t("privacy.sections.infoCollect.title"),
      content: [
        t("privacy.sections.infoCollect.description"),
        "",
        `• ${t("privacy.sections.infoCollect.personalInfo")}`,
        `• ${t("privacy.sections.infoCollect.businessData")}`,
        `• ${t("privacy.sections.infoCollect.technicalData")}`,
        `• ${t("privacy.sections.infoCollect.cookies")}`,
        `• ${t("privacy.sections.infoCollect.thirdPartyData")}`
      ]
    },
    {
      title: t("privacy.sections.dataUse.title"),
      content: [
        t("privacy.sections.dataUse.description"),
        "",
        `• ${t("privacy.sections.dataUse.operate")}`,
        `• ${t("privacy.sections.dataUse.insights")}`,
        `• ${t("privacy.sections.dataUse.notify")}`,
        `• ${t("privacy.sections.dataUse.assist")}`,
        `• ${t("privacy.sections.dataUse.respond")}`
      ]
    },
    {
      title: t("privacy.sections.thirdPartyAccess.title"),
      content: [
        t("privacy.sections.thirdPartyAccess.description"),
        "",
        `• ${t("privacy.sections.thirdPartyAccess.adMetrics")}`,
        `• ${t("privacy.sections.thirdPartyAccess.salesData")}`,
        `• ${t("privacy.sections.thirdPartyAccess.targeting")}`,
        "",
        t("privacy.sections.thirdPartyAccess.revoke")
      ]
    },
    {
      title: t("privacy.sections.dataSharing.title"),
      content: [
        t("privacy.sections.dataSharing.description"),
        "",
        `• ${t("privacy.sections.dataSharing.analytics")}`,
        `• ${t("privacy.sections.dataSharing.providers")}`,
        `• ${t("privacy.sections.dataSharing.legal")}`
      ]
    },
    {
      title: t("privacy.sections.retention.title"),
      content: [
        t("privacy.sections.retention.description"),
        "",
        `• ${t("privacy.sections.retention.active")}`,
        `• ${t("privacy.sections.retention.legal")}`
      ]
    },
    {
      title: t("privacy.sections.rights.title"),
      content: [
        t("privacy.sections.rights.description"),
        "",
        `• ${t("privacy.sections.rights.access")}`,
        `• ${t("privacy.sections.rights.correction")}`,
        `• ${t("privacy.sections.rights.withdraw")}`,
        `• ${t("privacy.sections.rights.complaint")}`,
        "",
        t("privacy.sections.rights.contact")
      ]
    },
    {
      title: t("privacy.sections.children.title"),
      content: [
        t("privacy.sections.children.description")
      ]
    },
    {
      title: t("privacy.sections.security.title"),
      content: [
        t("privacy.sections.security.description")
      ]
    },
    {
      title: t("privacy.sections.changes.title"),
      content: [
        t("privacy.sections.changes.description")
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
              name="lock" 
              size={24} 
              color={theme === "dark" ? "#fff" : "#333"} 
              style={{ marginRight: 10 }} 
            />
            <CustomText 
              weight="bold"
              className="text-2xl text-center"
            >
              {t("privacy.title")}
            </CustomText>
          </View>
          
          <CustomText 
            className="mb-4 text-center"
            weight="medium"
          >
            {t("privacy.effectiveDate")}
          </CustomText>
          
          <CustomText className="mb-6">
            {t("privacy.introduction")}
          </CustomText>
          
          {privacyData.map((section, index) => (
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
