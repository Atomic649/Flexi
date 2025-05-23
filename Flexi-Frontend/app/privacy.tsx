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
  
  // Privacy Policy content sections
  const privacyData = [
    {
      title: "1. Information We Collect",
      content: [
        "We collect the following types of data:",
        "",
        "• Personal Information: Name, email address, login credentials",
        "• Business Data: Sales, expenses, ad costs, financial documents",
        "• Technical Data: IP address, browser type, device information",
        "• Cookies: Used for analytics, functionality, and security",
        "• Third-Party Data: Data from Facebook, TikTok, Shopee, LINE (after your consent)"
      ]
    },
    {
      title: "2. How We Use Your Data",
      content: [
        "We use your data to:",
        "",
        "• Operate and improve our platform",
        "• Provide financial and performance insights",
        "• Notify you of abnormal spending or performance trends",
        "• Assist with tax preparation and compliance",
        "• Respond to inquiries and provide customer support"
      ]
    },
    {
      title: "3. Third-Party Data Access",
      content: [
        "We access data from third-party platforms only after you grant permission via secure OAuth APIs. This includes:",
        "",
        "• Advertising performance metrics",
        "• Sales/order data",
        "• Regional targeting information (non-personal)",
        "",
        "You may revoke this access through the third-party platform at any time."
      ]
    },
    {
      title: "4. Data Sharing and Disclosure",
      content: [
        "We do not sell your personal data. We may share:",
        "",
        "• Non-personal geographic data for analytics",
        "• Information with trusted service providers under strict confidentiality",
        "• Data when required by law or to protect rights and safety"
      ]
    },
    {
      title: "5. Data Retention",
      content: [
        "We retain your data:",
        "",
        "• As long as your account is active",
        "• As needed to comply with legal obligations or resolve disputes"
      ]
    },
    {
      title: "6. Your Rights",
      content: [
        "You have the right to:",
        "",
        "• Access your personal data",
        "• Request correction or deletion",
        "• Withdraw consent to data processing",
        "• File a complaint with a regulatory authority",
        "",
        "To exercise your rights, contact us at: support@flexibusinesshub.com"
      ]
    },
    {
      title: "7. Children's Privacy",
      content: [
        "Our services are not intended for individuals under 18. We do not knowingly collect data from minors."
      ]
    },
    {
      title: "8. Security Measures",
      content: [
        "We use encryption, access controls, and regular audits to protect your data. While we strive to secure your information, no system is completely secure."
      ]
    },
    {
      title: "9. Changes to This Policy",
      content: [
        "We may update this policy periodically. If changes are significant, we'll notify you by email or through the platform."
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
              {t("Privacy Policy")}
            </CustomText>
          </View>
          
          <CustomText 
            className="mb-4 text-center"
            weight="medium"
          >
            Effective Date: May 23, 2025
          </CustomText>
          
          <CustomText className="mb-6">
            At Flexi Business Hub, your privacy is important to us. This Privacy Policy explains what data we collect, how we use it, and your rights.
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
