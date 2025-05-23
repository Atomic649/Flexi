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
  
  // Terms of Service content sections
  const termsData = [
    {
      title: "1. Overview of Services",
      content: [
        "Flexi Business Hub is a cloud-based platform that automates the collection and analysis of business data including:",
        "",
        "• Sales and expenses tracking",
        "• Advertising spend analysis (Facebook, TikTok, Shopee, LINE)",
        "• Profit/loss reporting (daily, monthly, yearly)",
        "• Notifications for inefficient ad spend",
        "• Digital recordkeeping for financial data",
        "• Tools to assist with tax submission and optimization"
      ]
    },
    {
      title: "2. Account Registration",
      content: [
        "You must create an account to access the service. You agree to:",
        "",
        "• Provide accurate and complete information",
        "• Keep your login credentials secure",
        "• Be responsible for all activity under your account"
      ]
    },
    {
      title: "3. Acceptable Use",
      content: [
        "You may not:",
        "",
        "• Violate applicable laws or regulations",
        "• Interfere with the service or others' use of it",
        "• Reverse engineer or attempt unauthorized access to our systems"
      ]
    },
    {
      title: "4. Your Data and Ownership",
      content: [
        "You retain all rights to the data you provide or generate through our platform. You grant us a limited license to use this data only for the purposes of:",
        "",
        "• Operating and improving the service",
        "• Providing insights and analysis to you"
      ]
    },
    {
      title: "5. Third-Party Integrations",
      content: [
        "Our platform connects to third-party platforms (Facebook, TikTok, Shopee, LINE) via their official APIs, and only with your explicit authorization.",
        "",
        "By granting access:",
        "",
        "• You confirm that you have the right to access and share that data",
        "• You agree to comply with the respective platform's terms",
        "• You understand you can revoke access at any time, though this may limit features",
        "",
        "We are not responsible for data accuracy or availability from third-party platforms."
      ]
    },
    {
      title: "6. Data Security and Storage",
      content: [
        "We implement security measures to protect your data. However, no system is foolproof. We encourage you to maintain your own backups."
      ]
    },
    {
      title: "7. Termination and Suspension",
      content: [
        "We reserve the right to suspend or terminate accounts that violate these Terms. You may terminate your account at any time by contacting support."
      ]
    },
    {
      title: "8. Disclaimers and Limitations of Liability",
      content: [
        "Flexi Business Hub is provided \"as is.\" To the fullest extent permitted by law, we disclaim all warranties and are not liable for indirect or consequential damages, including data loss or lost profits."
      ]
    },
    {
      title: "9. Governing Law",
      content: [
        "These Terms are governed by the laws of the Kingdom of Thailand. Any disputes shall be resolved in Thai courts."
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
              {t("Terms of Service")}
            </CustomText>
          </View>
          
          <CustomText 
            className="mb-4 text-center"
            weight="medium"
          >
            Effective Date: May 23, 2025
          </CustomText>
          
          <CustomText className="mb-6">
            Welcome to Flexi Business Hub! These Terms of Service ("Terms") govern your access to and use of our software-as-a-service (SaaS) platform and related services. By using our services, you agree to be bound by these Terms.
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
