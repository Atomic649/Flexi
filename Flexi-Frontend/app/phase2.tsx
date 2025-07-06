import { View, ScrollView, Platform, Dimensions, Image } from "react-native";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { images } from "@/constants";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";

export default function Phase2() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const accentColor = theme === "dark" ? "#08f9cd" : "#08f9cd";
  const textPrimaryColor = theme === "dark" ? "#e4e4e4" : "#3a3a32";
  const textSecondaryColor = theme === "dark" ? "#bab9b9" : "#5c5c5c";
  
  // Phase 2 initiatives data
  const initiativeSections = [
    {
      title: t("phase2.sections.integrations.title") || "Platform Integrations",
      items: [
        t("phase2.sections.integrations.item1") || "Facebook API: Full integration with Facebook marketing and business APIs for analytics and automation",
        t("phase2.sections.integrations.item2") || "TikTok Integration: Connecting with TikTok For Business to synchronize marketing campaigns and tracking",
        t("phase2.sections.integrations.item3") || "Shopee Integration: Store connection, product catalog sync, and order management",
        t("phase2.sections.integrations.item4") || "LINE Integration: Customer communication and marketing channel integration"
      ],
      icon: "globe" as "globe"
    },
    {
      title: t("phase2.sections.team.title") || "Team Expansion",
      items: [
        t("phase2.sections.team.item1") || "Development Team Scaling: Growing beyond solo development to a small focused team",
        t("phase2.sections.team.item2") || "CFO Advisory Partnership: Establishing relationships with financial experts",
        t("phase2.sections.team.item3") || "Marketing Team Formation: Starting small-scale marketing initiatives"
      ],
      icon: "people" as "people"
    },
    {
      title: t("phase2.sections.financial.title") || "Financial Management",
      items: [
        t("phase2.sections.financial.item1") || "Enhanced CFO Dashboard: Financial analytics and reporting designed for CFO use",
        t("phase2.sections.financial.item2") || "Multi-business Financial Tracking: Supporting businesses with multiple revenue streams",
        t("phase2.sections.financial.item3") || "Financial Planning Tools: Cash flow projections and budget management"
      ],
      icon: "cash" as "cash"
    },
    {
      title: t("phase2.sections.market.title") || "Market Reach",
      items: [
        t("phase2.sections.market.item1") || "Business Outreach: Testing with 50 businesses across diverse sectors",
        t("phase2.sections.market.item2") || "User Feedback Loop: Implementing structured feedback collection and response system",
        t("phase2.sections.market.item3") || "Early Adopter Program: Special onboarding for first 100 businesses"
      ],
      icon: "expand" as "expand"
    },
    {
      title: t("phase2.sections.technical.title") || "Technical Scaling",
      items: [
        t("phase2.sections.technical.item1") || "Infrastructure Enhancement: Preparing systems for increased load and users",
        t("phase2.sections.technical.item2") || "API Performance Optimization: Ensuring smooth operation with multiple platform integrations",
        t("phase2.sections.technical.item3") || "Security Framework Upgrade: Advanced protection for expanded data processing",
        t("phase2.sections.technical.item4") || "Database Scaling: Optimizing for multi-business support"
      ],
      icon: "server" as "server"
    },
    {
      title: t("phase2.sections.marketing.title") || "Marketing Initiatives",
      items: [
        t("phase2.sections.marketing.item1") || "Brand Positioning: Establishing Flexi Business Hub as the go-to solution for small businesses",
        t("phase2.sections.marketing.item2") || "Content Strategy: Educational content about business financial management",
        t("phase2.sections.marketing.item3") || "Community Building: Creating forums and events for business owners",
        t("phase2.sections.marketing.item4") || "Digital Marketing: Targeted campaigns to reach potential business users"
      ],
      icon: "megaphone" as "megaphone"
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
            maxWidth: 900,
            alignSelf: "center",
          }}
        >
          {/* Header with back button */}
          <View className="flex-row items-center mb-6">
            <CustomButton
              title=""
              handlePress={() => router.back()}
              containerStyles="p-2 mr-4"
              textStyles=""
              icon={<Ionicons name="arrow-back" size={24} color={textPrimaryColor} />}
            />
            <View className="flex-1 flex-row items-center justify-center">
              <Ionicons 
                name="time" 
                size={28} 
                color={accentColor}
                style={{ marginRight: 10 }} 
              />
              <CustomText 
                weight="bold"
                className="text-2xl text-center"
              >
                {t("roadmap.phase2.title")}
              </CustomText>
            </View>
          </View>
          
          {/* Subtitle */}
          <CustomText 
            className="mb-6 text-center"
            weight="medium"
            style={{ color: accentColor }}
          >
            {t("phase2.subtitle") || "In Progress - July 2025"}
          </CustomText>
          
          {/* Introduction */}
          <View 
            style={{
              backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              padding: 20,
              borderRadius: 12,
              marginBottom: 24
            }}
          >
            <CustomText className="mb-4">
              {t("phase2.introduction") || "Phase 2 is all about expanding the Flexi Business Hub platform through key integrations and partnerships. We're building connections with major platforms, scaling our team, and implementing advanced financial management features for multi-business support. Our target is to reach and test with 50 businesses during this phase."}
            </CustomText>
          </View>
          
          {/* Logo display */}
          <View className="items-center mb-8">
            <Image
              source={images.logo}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
          
          {/* Integration platforms */}
          <View className="flex-row flex-wrap justify-center mb-10">
            {['Facebook', 'TikTok', 'Shopee', 'LINE'].map((platform, index) => (
              <View 
                key={index}
                style={{
                  backgroundColor: theme === "dark" ? "rgba(8, 249, 205, 0.1)" : "rgba(8, 249, 205, 0.1)",
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 12,
                  margin: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="globe-outline" size={24} color={accentColor} style={{marginBottom: 6}} />
                <CustomText style={{color: textPrimaryColor}}>{platform}</CustomText>
              </View>
            ))}
          </View>
          
          {/* Initiative sections */}
          {initiativeSections.map((section, index) => (
            <View 
              key={index} 
              style={{
                marginBottom: 28,
                borderLeftWidth: 3,
                borderLeftColor: accentColor,
                paddingLeft: 16,
              }}
            >
              <View className="flex-row items-center mb-3">
                <View 
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme === "dark" ? "rgba(8, 249, 205, 0.1)" : "rgba(8, 249, 205, 0.1)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12
                  }}
                >
                  <Ionicons name={section.icon} size={20} color={accentColor} />
                </View>
                <CustomText 
                  weight="bold"
                  style={{ fontSize: 18, color: textPrimaryColor }}
                >
                  {section.title}
                </CustomText>
              </View>
              
              <View style={{ paddingLeft: 52 }}>
                {section.items.map((item, idx) => (
                  <View key={idx} className="flex-row mb-2">
                    <CustomText 
                      style={{
                        color: textSecondaryColor,
                        lineHeight: 22
                      }}
                    >
                      • {item}
                    </CustomText>
                  </View>
                ))}
              </View>
            </View>
          ))}
          
          {/* Business Targets */}
          <View 
            style={{
              backgroundColor: theme === "dark" ? "rgba(8, 249, 205, 0.06)" : "rgba(8, 249, 205, 0.06)",
              padding: 20,
              borderRadius: 12,
              marginTop: 16,
              marginBottom: 40
            }}
          >
            <CustomText weight="bold" className="mb-2" style={{ color: textPrimaryColor }}>
              {t("phase2.targets.title") || "Business Growth Targets"}
            </CustomText>
            
            <View className="flex-row justify-between mt-4">
              <View style={{alignItems: 'center', flex: 1}}>
                <CustomText weight="bold" style={{fontSize: 24, color: accentColor}}>
                  50
                </CustomText>
                <CustomText style={{color: textSecondaryColor}}>
                  {t("phase2.targets.businesses") || "Test Businesses"}
                </CustomText>
              </View>
              
              <View style={{alignItems: 'center', flex: 1}}>
                <CustomText weight="bold" style={{fontSize: 24, color: accentColor}}>
                  4
                </CustomText>
                <CustomText style={{color: textSecondaryColor}}>
                  {t("phase2.targets.integrations") || "Integrations"}
                </CustomText>
              </View>
              
              <View style={{alignItems: 'center', flex: 1}}>
                <CustomText weight="bold" style={{fontSize: 24, color: accentColor}}>
                  3+
                </CustomText>
                <CustomText style={{color: textSecondaryColor}}>
                  {t("phase2.targets.team") || "Team Members"}
                </CustomText>
              </View>
            </View>
          </View>

          {/* Next Phase Preview */}
          <View 
            style={{
              backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              padding: 20,
              borderRadius: 12,
              marginTop: 16,
              marginBottom: 40
            }}
          >
            <CustomText weight="bold" className="mb-2" style={{ color: textPrimaryColor }}>
              {t("phase2.nextPhase.title") || "Looking Ahead to Phase 3: Revenue Generation"}
            </CustomText>
            <CustomText style={{ color: textSecondaryColor, lineHeight: 22 }}>
              {t("phase2.nextPhase.description") || "Upon completion of Phase 2, we'll transition into Phase 3 where we'll launch our advertising platform, create revenue streams from store connections, and expand our development and marketing teams to support up to 500 businesses."}
            </CustomText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}