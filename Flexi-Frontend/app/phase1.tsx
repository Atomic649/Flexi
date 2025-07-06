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

export default function Phase1() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const accentColor = theme === "dark" ? "#08f9cd" : "#08f9cd";
  const textPrimaryColor = theme === "dark" ? "#e4e4e4" : "#3a3a32";
  const textSecondaryColor = theme === "dark" ? "#bab9b9" : "#5c5c5c";
  
  // Phase 1 achievements data
  const achievementSections = [
    {
      title: t("phase1.sections.core.title"),
      items: [
        t("phase1.sections.core.item1"),
        t("phase1.sections.core.item2"),
        t("phase1.sections.core.item3")
      ],
      icon: "layers" as "layers"
    },
    {
      title: t("phase1.sections.business.title"),
      items: [
        t("phase1.sections.business.item1"),
        t("phase1.sections.business.item2"),
        t("phase1.sections.business.item3")
      ],
      icon: "business" as "business"
    },
    {
      title: t("phase1.sections.financial.title"),
      items: [
        t("phase1.sections.financial.item1"),
        t("phase1.sections.financial.item2"),
        t("phase1.sections.financial.item3")
      ],
      icon: "cash" as "cash"
    },
    {
      title: t("phase1.sections.technical.title"),
      items: [
        t("phase1.sections.technical.item1"),
        t("phase1.sections.technical.item2"),
        t("phase1.sections.technical.item3"),
        t("phase1.sections.technical.item4"),
        t("phase1.sections.technical.item5")
      ],
      icon: "server" as "server"
    },
    {
      title: t("phase1.sections.user.title"),
      items: [
        t("phase1.sections.user.item1"),
        t("phase1.sections.user.item2"),
        t("phase1.sections.user.item3")
      ],
      icon: "people" as "people"
    },
    {
      title: t("phase1.sections.development.title"),
      items: [
        t("phase1.sections.development.item1"),
        t("phase1.sections.development.item2"),
        t("phase1.sections.development.item3"),
        t("phase1.sections.development.item4")
      ],
      icon: "code-slash" as "code-slash"
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
                name="checkmark-circle" 
                size={28} 
                color={accentColor}
                style={{ marginRight: 10 }} 
              />
              <CustomText 
                weight="bold"
                className="text-2xl text-center"
              >
                {t("phase1.title")}
              </CustomText>
            </View>
          </View>
          
          {/* Subtitle */}
          <CustomText 
            className="mb-6 text-center"
            weight="medium"
            style={{ color: accentColor }}
          >
            {t("phase1.subtitle")}
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
              {t("phase1.introduction")}
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
          
          {/* Achievement sections */}
          {achievementSections.map((section, index) => (
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
              {t("phase1.nextPhase.title")}
            </CustomText>
            <CustomText style={{ color: textSecondaryColor, lineHeight: 22 }}>
              {t("phase1.nextPhase.description")}
            </CustomText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}