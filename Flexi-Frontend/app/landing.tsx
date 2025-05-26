import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { images, icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Globe,
  LineChart,
  ShieldCheck,
} from "@/components/ui/lucide-react";

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const windowWidth = Dimensions.get("window").width;
  const isDesktop = windowWidth > 768;

  // Business features based on terms.tsx
  const features = [
    {
      icon: "chart-line",
      title: t("features.salesTracking.title") || "Sales Tracking",
      description:
        t("features.salesTracking.description") ||
        "Monitor your sales performance across multiple platforms in real-time",
    },
    {
      icon: "ad",
      title: t("features.adAnalysis.title") || "Ad Analysis",
      description:
        t("features.adAnalysis.description") ||
        "Track ad performance and optimize your marketing spend efficiently",
    },
    {
      icon: "file-invoice",
      title: t("features.reporting.title") || "Smart Reporting",
      description:
        t("features.reporting.description") ||
        "Generate comprehensive reports to make data-driven business decisions",
    },
    {
      icon: "bell",
      title: t("features.notifications.title") || "Smart Notifications",
      description:
        t("features.notifications.description") ||
        "Stay informed with timely alerts about your business metrics",
    },
    {
      icon: "book",
      title: t("features.recordkeeping.title") || "Record Keeping",
      description:
        t("features.recordkeeping.description") ||
        "Manage your business documentation effortlessly in one place",
    },
    {
      icon: "calculator",
      title: t("features.taxTools.title") || "Tax Tools",
      description:
        t("features.taxTools.description") ||
        "Simplify tax preparation with automated financial tracking",
    },
  ];

  // Auto-rotate features on desktop view
  useEffect(() => {
    if (isDesktop) {
      const interval = setInterval(() => {
        setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isDesktop, features.length]);

  // ฟังก์ชันสลับภาษา
  const toggleLanguage = () => {
    const newLang = i18n.language === "th" ? "en" : "th";
    AsyncStorage.setItem("language", newLang);
    i18n.changeLanguage(newLang);
  };

  // Handle contact form submission
  const turquoiseColor = "#4edac0";
  const bgColor = theme === "dark" ? "#121212" : "#ffffff";
  const accentColor = theme === "dark" ? "#08f9cd" : "#08f9cd";
  const textPrimaryColor = theme === "dark" ? "#e4e4e4" : "#3a3a32";
  const textSecondaryColor = theme === "dark" ? "#bab9b9" : "#5c5c5c";
  const cardBgColor = theme === "dark" ? "#1e1e1e" : "#f8fafc";

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        style={{
          backgroundColor: bgColor,
          flexDirection: "column",
        }}
      >
        {/* --------------Mobile -------------- */}
        {/* Floating header with language switcher */}
        {!isDesktop && (
          <TouchableOpacity
          onPress={toggleLanguage}
          className="absolute top-4 right-4 z-10 bg-gray-700 p-2 rounded-full"
        >
          <View className="flex-row items-center gap-2 !bg-transparent px-2">
            <Image
              source={i18n.language === "th" ? icons.flagen : icons.flagth}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
            <CustomText className="!text-white text-sm">
              {i18n.language === "th" ? "EN" : "ไทย"}
            </CustomText>
          </View>
        </TouchableOpacity>        
        )}
        {!isDesktop && (
           <View
           className="flex justify-start items-center px-8"
           style={{
             flex: 1,
             height:
               Dimensions.get("window").width > 768
                 ? Dimensions.get("window").height
                 : "auto",
             width: Dimensions.get("window").width > 768 ? "80%" : "100%",
             maxWidth: 800,
             paddingTop: Dimensions.get("window").height * 0.16,
             alignSelf: "center",
           }}
         >
           {/* Logo */}
           <Image
             source={images.logo}
             style={{ width: 150, height: 150 }}
             resizeMode="contain"
           />
 
           {/* Slogan */}
           <View className="relative mt-5">
             <CustomText
               weight="bold"
               className="text-2xl text-center text-white leading-10"
             >
               {t("Minimize Your Task")}
               {"\n"}
               {t("Maximize Your Profit")}{" "}
             </CustomText>
           </View>
 
           {/* คำอธิบาย */}
           <CustomText
             weight="regular"
             className="text-md mt-7 text-center text-white"
           >
             {t("landing.description")}
           </CustomText>
 
           {/* ปุ่มไปหน้า Login */}
           <CustomButton
             title={t("landing.button")}
             handlePress={() => {
               router.push("/login");
             }}
             containerStyles="w-full mt-7"
             textStyles="!text-white"
           />
         </View>
          
        )}




        {/* --------------WEBSITE LANDING PAGE-------------- */}
        {/* Floating header with language switcher */}
        {isDesktop && (
        <View
          className="w-full flex-row justify-between items-center px-4 py-3 absolute z-10"
          style={{
            backgroundColor: isDesktop ? "rgba(0,0,0,0.5)" : "transparent",
            backdropFilter: isDesktop ? "blur(10px)" : "none",
            top: 0,
          }}
        >
          <Image
            source={images.logo}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />

          {/* Desktop Navigation */}
          
            <View className="flex-row items-center gap-8">
              <TouchableOpacity onPress={() => router.push("/register")}>
                <CustomText
                  className=" text-base font-medium"
                  style={{ color: accentColor }}
                >
                  {t("auth.login.registerButton")}
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleLanguage}
                className="bg-gray-800/50 p-2 rounded-full"
              >
                <View className="flex-row items-center gap-2 !bg-transparent px-2">
                  <Image
                    source={
                      i18n.language === "th" ? icons.flagen : icons.flagth
                    }
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <CustomText className="!text-white text-sm">
                    {i18n.language === "th" ? "EN" : "ไทย"}
                  </CustomText>
                </View>
              </TouchableOpacity>
            </View>
         

        
        </View> )}
               
        {/* Hero Section with gradient overlay */}
        {isDesktop && (
        <View
          className="w-full"
          style={{
            height: isDesktop
              ? Dimensions.get("window").height * 0.8
              : Dimensions.get("window").height * 0.7,
            position: "relative",
          }}
        >
          {/* Background image with overlay */}
          <ImageBackground
            source={images.bg} // Replace with a suitable hero image
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  width: isDesktop ? "60%" : "90%",
                  maxWidth: 800,
                  alignItems: "center",
                  marginTop: isDesktop ? 80 : 40,
                }}
              >
                {/* Logo - bigger for desktop */}
                <Image
                  source={images.logo}
                  style={{
                    width: isDesktop ? 180 : 120,
                    height: isDesktop ? 180 : 120,
                  }}
                  resizeMode="contain"
                />

                {/* Main slogan - with animated gradient text */}
                <View className="mt-6 mb-4">
                  <CustomText
                    weight="bold"
                    className="text-center"
                    style={{
                      fontSize: isDesktop ? 42 : 28,
                      color: "#ffffff",
                      textShadowColor: "rgba(0, 0, 0, 0.75)",
                      textShadowOffset: { width: -1, height: 1 },
                      textShadowRadius: 10,
                    }}
                  >
                    {t("Minimize Your Task")}
                    {"\n"}
                    {t("Maximize Your Profit")}{" "}
                  </CustomText>
                </View>

                {/* Tagline */}
                <CustomText
                  //weight="medium"
                  className="text-center mb-8"
                  style={{
                    fontSize: isDesktop ? 18 : 16,
                    color: "#e2e8f0",
                    maxWidth: 600,
                  }}
                >
                  {t(
                    "The all-in-one business management solution for modern entrepreneurs and growing businesses"
                  )}
                </CustomText>

                {/* Call to action buttons */}
                <View className="flex-row gap-4 mt-2">
                  <CustomButton
                    title={t("landing.button") || "Get Started"}
                    handlePress={() => {
                      router.push("/login");
                    }}
                    containerStyles={`py-3 px-6 ${
                      isDesktop ? "min-w-[360px]" : ""
                    }`}
                    textStyles="!text-white font-bold text-base"
                  />
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
        )}
        {/* Features Section */}
        {isDesktop && (
        <View
          className="py-16 px-6"
          style={{
            backgroundColor: theme === "dark" ? "#121212" : "#fff",
          }}
        >
          <View style={{ maxWidth: 1280, marginHorizontal: "auto" }}>
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <View
                style={{ width: isDesktop ? "48%" : "100%", marginBottom: 20 }}
              >
                <Card className="rounded-2xl h-full" bgColor={cardBgColor}>
                  <CardContent className="p-6">
                    <View style={{ marginBottom: 16 }}>
                      <LineChart color={turquoiseColor} size={32} />
                    </View>
                    <CustomText
                      weight="bold"
                      style={{
                        fontSize: 20,
                        marginBottom: 12,
                        color: textPrimaryColor,
                      }}
                    >
                      Smart Financial Dashboard
                    </CustomText>
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        lineHeight: 22,
                      }}
                    >
                      Visualize daily, monthly, and yearly profit & loss with
                      intuitive charts and summaries.
                    </CustomText>
                  </CardContent>
                </Card>
              </View>

              <View
                style={{ width: isDesktop ? "48%" : "100%", marginBottom: 20 }}
              >
                <Card className="rounded-2xl h-full" bgColor={cardBgColor}>
                  <CardContent className="p-6">
                    <View style={{ marginBottom: 16 }}>
                      <CheckCircle color={turquoiseColor} size={32} />
                    </View>
                    <CustomText
                      weight="bold"
                      style={{
                        fontSize: 20,
                        marginBottom: 12,
                        color: textPrimaryColor,
                      }}
                    >
                      Ad Overspend Alerts
                    </CustomText>
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        lineHeight: 22,
                      }}
                    >
                      Get notified when your ads aren't performing or when
                      budgets exceed expectations.
                    </CustomText>
                  </CardContent>
                </Card>
              </View>

              <View
                style={{ width: isDesktop ? "48%" : "100%", marginBottom: 20 }}
              >
                <Card className="rounded-2xl h-full" bgColor={cardBgColor}>
                  <CardContent className="p-6">
                    <View style={{ marginBottom: 16 }}>
                      <ShieldCheck color={turquoiseColor} size={32} />
                    </View>
                    <CustomText
                      weight="bold"
                      style={{
                        fontSize: 20,
                        marginBottom: 12,
                        color: textPrimaryColor,
                      }}
                    >
                      Secure & Compliant
                    </CustomText>
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        lineHeight: 22,
                      }}
                    >
                      We comply with Thai privacy laws and only access
                      third-party data with your consent.
                    </CustomText>
                  </CardContent>
                </Card>
              </View>

              <View
                style={{ width: isDesktop ? "48%" : "100%", marginBottom: 20 }}
              >
                <Card className="rounded-2xl h-full" bgColor={cardBgColor}>
                  <CardContent className="p-6">
                    <View style={{ marginBottom: 16 }}>
                      <Globe color={turquoiseColor} size={32} />
                    </View>
                    <CustomText
                      weight="bold"
                      style={{
                        fontSize: 20,
                        marginBottom: 12,
                        color: textPrimaryColor,
                      }}
                    >
                      Built for Southeast Asia
                    </CustomText>
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        lineHeight: 22,
                      }}
                    >
                      Supports multiple platforms common in the region with
                      local compliance in mind.
                    </CustomText>
                  </CardContent>
                </Card>
              </View>
            </View>
          </View>
        </View>)}
        {/* How It Works section - only for desktop */}
        {isDesktop && (
          <View
            className="w-full pt- pb-16 px-4"
            style={{
              backgroundColor: theme === "dark" ? "#121212" : "#fff",
            }}
          >
            <View
              style={{ width: "100%", maxWidth: 1200, alignSelf: "center" }}
            >
              <CustomText
                weight="bold"
                className="text-center mb-2"
                style={{
                  fontSize: 32,
                  color: textPrimaryColor,
                }}
              >
                {t("howto.title") || "How Flexi Works"}
              </CustomText>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  marginTop: 20,
                }}
              >
                <View style={{ width: "48%", padding: 10 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {" "}
                    {/* how to 1. */}
                    <CustomText
                      weight="medium"
                      style={{
                        fontSize: 18,
                        color: textPrimaryColor,
                        marginBottom: 16,
                      }}
                    >
                      1.{" "}
                    </CustomText>
                    <Image
                      source={images.logo}
                      style={{ width: 35, height: 35, marginTop: -20 }}
                      resizeMode="contain"
                    />
                    <CustomText
                      weight="medium"
                      style={{
                        fontSize: 18,
                        color: textPrimaryColor,
                        marginBottom: 16,
                      }}
                    >
                      {t(t("howto.content1"))}
                    </CustomText>
                  </View>
                  <CustomText
                    style={{
                      fontSize: 16,
                      color: textSecondaryColor,
                      marginBottom: 24,
                      lineHeight: 24,
                    }}
                  >
                    {t(
                      "Getting started with Flexi is simple. Register your account and connect your business platforms."
                    )}
                  </CustomText>

                  {/* How to 2 */}
                  <CustomText
                    weight="medium"
                    style={{
                      fontSize: 18,
                      color: textPrimaryColor,
                      marginBottom: 16,
                    }}
                  >
                    {t("howto.content2")}
                  </CustomText>

                  <CustomText
                    style={{
                      fontSize: 16,
                      color: textSecondaryColor,
                      marginBottom: 24,
                      lineHeight: 24,
                    }}
                  >
                    {t(
                      "Flexi will Integrate your e-commerce platforms, payment systems, and marketing tools. Our system automatically synchronizes your data across all channels."
                    )}
                  </CustomText>

                  <CustomText
                    weight="medium"
                    style={{
                      fontSize: 18,
                      color: textPrimaryColor,
                      marginBottom: 16,
                    }}
                  >
                    {t("howto.content3")}
                  </CustomText>
                  <CustomText
                    style={{
                      fontSize: 16,
                      color: textSecondaryColor,
                      marginBottom: 24,
                      lineHeight: 24,
                    }}
                  >
                    {t(
                      "Monitor your business performance through comprehensive dashboards and detailed analytics.Make informed decisions by tracking key metrics, receiving intelligent insights, and utilizing our reporting tools."
                    )}
                  </CustomText>
                </View>

                <View
                  style={{
                    width: "48%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={images.start || images.logo}
                    style={{
                      width: "100%",
                      height: 300,
                      borderRadius: 12,
                      marginBottom: 20,
                    }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          </View>
        )}{" "}
        {/* Expense Section*/}
        {isDesktop && (
          <View
            className="w-full py-16 px-4"
            style={{
              backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
            }}
          >
            <View
              style={{ width: "100%", maxWidth: 1200, alignSelf: "center" }}
            >
              <CustomText
                weight="bold"
                className="text-center mb-2"
                style={{
                  fontSize: 32,
                  color: textPrimaryColor,
                }}
              >
                {t("expense.titles") || "Expense Management Made Easy"}
              </CustomText>

              <CustomText
                className="text-center mb-10"
                style={{
                  fontSize: 18,
                  color: textSecondaryColor,
                  maxWidth: 700,
                  alignSelf: "center",
                  lineHeight: 26,
                }}
              >
                {t("expense.subtitle") ||
                  "Gain full visibility and control over your business expenses with our intuitive tools and automated solutions"}
              </CustomText>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 40,
                }}
              >
                <View
                  style={{
                    width: "80%",
                    height: 2,
                    backgroundColor:
                      theme === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      width: "80%",
                      height: "100%",
                      backgroundColor: turquoiseColor,
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 24,
                }}
              >
                {/* Feature 1: Auto-detect expenses */}
                <View
                  style={{
                    width: Math.min(350, (windowWidth - 72) / 3),
                    backgroundColor: cardBgColor,
                    borderRadius: 16,
                    padding: 28,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    borderLeftWidth: 3,
                    borderLeftColor: turquoiseColor,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(78, 218, 192, 0.1)"
                          : "rgba(78, 218, 192, 0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={28}
                      color={turquoiseColor}
                    />
                  </View>

                  <CustomText
                    weight="bold"
                    style={{
                      fontSize: 20,
                      color: textPrimaryColor,
                      marginBottom: 14,
                    }}
                  >
                    {t("expense.feature1.title") || "Intelligent PDF Detection"}
                  </CustomText>

                  <CustomText
                    style={{
                      fontSize: 16,
                      color: textSecondaryColor,
                      lineHeight: 24,
                      marginBottom: 20,
                    }}
                  >
                    {t("expense.feature1.description") ||
                      "Upload your bank statements and let our AI automatically detect and categorize transactions, saving you hours of manual data entry."}
                  </CustomText>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={turquoiseColor}
                      style={{ marginRight: 8 }}
                    />
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        fontSize: 14,
                      }}
                    >
                      {t("expense.feature1.benefit1") ||
                        "Support for major Thai banks"}
                    </CustomText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={turquoiseColor}
                      style={{ marginRight: 8 }}
                    />
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        fontSize: 14,
                      }}
                    >
                      {t("expense.feature1.benefit2") ||
                        "99% detection accuracy"}
                    </CustomText>
                  </View>
                </View>

                {/* Feature 2: Expense Categories */}
                <View
                  style={{
                    width: Math.min(350, (windowWidth - 72) / 3),
                    backgroundColor: cardBgColor,
                    borderRadius: 16,
                    padding: 28,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    borderLeftWidth: 3,
                    borderLeftColor: turquoiseColor,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(78, 218, 192, 0.1)"
                          : "rgba(78, 218, 192, 0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Ionicons
                      name="pie-chart-outline"
                      size={28}
                      color={turquoiseColor}
                    />
                  </View>

                  <CustomText
                    weight="bold"
                    style={{
                      fontSize: 20,
                      color: textPrimaryColor,
                      marginBottom: 14,
                    }}
                  >
                    {t("expense.feature2.title") || "Smart Categorization"}
                  </CustomText>

                  <CustomText
                    style={{
                      fontSize: 16,
                      color: textSecondaryColor,
                      lineHeight: 24,
                      marginBottom: 20,
                    }}
                  >
                    {t("expense.feature2.description") ||
                      "Automatically organize expenses into business categories to streamline financial reporting and quickly identify spending patterns."}
                  </CustomText>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={turquoiseColor}
                      style={{ marginRight: 8 }}
                    />
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        fontSize: 14,
                      }}
                    >
                      {t("expense.feature2.benefit1") ||
                        "Custom category creation"}
                    </CustomText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={turquoiseColor}
                      style={{ marginRight: 8 }}
                    />
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        fontSize: 14,
                      }}
                    >
                      {t("expense.feature2.benefit2") ||
                        "Tax-ready expense reports"}
                    </CustomText>
                  </View>
                </View>

                {/* Feature 3: Analytics */}
                <View
                  style={{
                    width: Math.min(350, (windowWidth - 72) / 3),
                    backgroundColor: cardBgColor,
                    borderRadius: 16,
                    padding: 28,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    borderLeftWidth: 3,
                    borderLeftColor: turquoiseColor,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(78, 218, 192, 0.1)"
                          : "rgba(78, 218, 192, 0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Ionicons
                      name="trending-up"
                      size={28}
                      color={turquoiseColor}
                    />
                  </View>

                  <CustomText
                    weight="bold"
                    style={{
                      fontSize: 20,
                      color: textPrimaryColor,
                      marginBottom: 14,
                    }}
                  >
                    {t("expense.feature3.title") || "Powerful Analytics"}
                  </CustomText>

                  <CustomText
                    style={{
                      fontSize: 16,
                      color: textSecondaryColor,
                      lineHeight: 24,
                      marginBottom: 20,
                    }}
                  >
                    {t("expense.feature3.description") ||
                      "Visualize spending trends, monitor budget adherence, and receive actionable insights to optimize your business expenditures."}
                  </CustomText>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={turquoiseColor}
                      style={{ marginRight: 8 }}
                    />
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        fontSize: 14,
                      }}
                    >
                      {t("expense.feature3.benefit1") ||
                        "Year-over-year comparisons"}
                    </CustomText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={turquoiseColor}
                      style={{ marginRight: 8 }}
                    />
                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        fontSize: 14,
                      }}
                    >
                      {t("expense.feature3.benefit2") ||
                        "Spending anomaly detection"}
                    </CustomText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        {/* Road Map Section */}
        {isDesktop && (
        <View
          className="w-full py-16 px-4"
          style={{
            backgroundColor: theme === "dark" ? "#121212" : "#ffffff",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1200,
              alignSelf: "center",
            }}
          >
            <CustomText
              weight="bold"
              className="text-center mb-4"
              style={{
                fontSize: isDesktop ? 32 : 28,
                color: textPrimaryColor,
              }}
            >
              {t("roadmap.title") || "Our Growth Roadmap"}
            </CustomText>

            <CustomText
              className="text-center mb-12"
              style={{
                fontSize: 16,
                color: textSecondaryColor,
                maxWidth: 700,
                alignSelf: "center",
                lineHeight: 24,
              }}
            >
              {t(
                "roadmap.subtitle",
                "Join us on our journey as we build the future of business management in Southeast Asia"
              )}
            </CustomText>

            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                justifyContent: "space-between",
                alignItems: "stretch",
              }}
            >
              {/* Left side: Roadmap timeline */}
              <View
                style={{
                  width: isDesktop ? "45%" : "100%",
                  marginBottom: isDesktop ? 0 : 40,
                }}
              >
                <View
                  style={{
                    marginBottom: 40,
                    position: "relative",
                  }}
                >
                  {/* Vertical timeline line */}
                  {isDesktop && (
                    <View
                      style={{
                        position: "absolute",
                        left: 19.5,
                        top: 40,
                        bottom: -160,
                        width: 1,
                        backgroundColor: turquoiseColor,
                      }}
                    />
                  )}

                  {/* Phase 1 - Completed */}
                  <View style={{ marginBottom: 30, flexDirection: "row" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: turquoiseColor,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Ionicons name="checkmark" size={24} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <CustomText
                          weight="bold"
                          style={{ fontSize: 18, color: textPrimaryColor }}
                        >
                          {t("roadmap.phase1.title") || "Phase 1: Foundation"}
                        </CustomText>
                        <CustomText
                          style={{
                            fontSize: 14,
                            color: turquoiseColor,
                            fontWeight: "500",
                          }}
                        >
                          {t("roadmap.completed") || "Completed"}
                        </CustomText>
                      </View>
                      <CustomText
                        style={{
                          color: textSecondaryColor,
                          lineHeight: 22,
                          marginBottom: 8,
                        }}
                      >
                        {t(
                          "roadmap.phase1.description",
                          "Core platform development, first 5 product categories, and 100+ active users milestone"
                        )}
                      </CustomText>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <Ionicons
                          name="people"
                          size={14}
                          color={textSecondaryColor}
                          style={{ marginRight: 6 }}
                        />
                        <CustomText
                          style={{ fontSize: 14, color: textSecondaryColor }}
                        >
                          100 {t("roadmap.users") || "Users"}
                        </CustomText>
                      </View>
                    </View>
                  </View>

                  {/* Phase 2 - In Progress */}
                  <View style={{ marginBottom: 30, flexDirection: "row" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: accentColor,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Ionicons name="time" size={24} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <CustomText
                          weight="bold"
                          style={{ fontSize: 18, color: textPrimaryColor }}
                        >
                          {t("roadmap.phase2.title") ||
                            "Phase 2: Market Expansion"}
                        </CustomText>
                        <CustomText
                          style={{
                            fontSize: 14,
                            color: accentColor,
                            fontWeight: "500",
                          }}
                        >
                          {t("roadmap.inProgress") || "In Progress"}
                        </CustomText>
                      </View>
                      <CustomText
                        style={{
                          color: textSecondaryColor,
                          lineHeight: 22,
                          marginBottom: 8,
                        }}
                      >
                        {t(
                          "roadmap.phase2.description",
                          "Multi-business support, expanded platform integrations, and reaching 500 active users"
                        )}
                      </CustomText>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginRight: 16,
                          }}
                        >
                          <Ionicons
                            name="business"
                            size={14}
                            color={textSecondaryColor}
                            style={{ marginRight: 6 }}
                          />
                          <CustomText
                            style={{ fontSize: 14, color: textSecondaryColor }}
                          >
                            2 {t("roadmap.business") || "Businesses"}
                          </CustomText>
                        </View>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="people"
                            size={14}
                            color={textSecondaryColor}
                            style={{ marginRight: 6 }}
                          />
                          <CustomText
                            style={{ fontSize: 14, color: textSecondaryColor }}
                          >
                            500 {t("roadmap.users") || "Users"}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Phase 3 - Upcoming */}
                  <View style={{ marginBottom: 30, flexDirection: "row" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme === "dark" ? "#333" : "#e5e7eb",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={theme === "dark" ? "#666" : "#9ca3af"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <CustomText
                          weight="bold"
                          style={{ fontSize: 18, color: textPrimaryColor }}
                        >
                          {t("roadmap.phase3.title") ||
                            "Phase 3: Ecosystem Growth"}
                        </CustomText>
                        <CustomText
                          style={{
                            fontSize: 14,
                            color: theme === "dark" ? "#666" : "#9ca3af",
                            fontWeight: "500",
                          }}
                        >
                          {t("roadmap.upcoming") || "Q3 2025"}
                        </CustomText>
                      </View>
                      <CustomText
                        style={{
                          color: textSecondaryColor,
                          lineHeight: 22,
                          marginBottom: 8,
                        }}
                      >
                        {t(
                          "roadmap.phase3.description",
                          "Multi-store management, advanced inventory systems, expanded payment options"
                        )}
                      </CustomText>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginRight: 16,
                          }}
                        >
                          <Ionicons
                            name="storefront"
                            size={14}
                            color={textSecondaryColor}
                            style={{ marginRight: 6 }}
                          />
                          <CustomText
                            style={{ fontSize: 14, color: textSecondaryColor }}
                          >
                            5 {t("roadmap.store") || "Stores"}
                          </CustomText>
                        </View>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="people"
                            size={14}
                            color={textSecondaryColor}
                            style={{ marginRight: 6 }}
                          />
                          <CustomText
                            style={{ fontSize: 14, color: textSecondaryColor }}
                          >
                            1,000 {t("roadmap.users") || "Users"}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Phase 4 - Future */}
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme === "dark" ? "#333" : "#e5e7eb",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={theme === "dark" ? "#666" : "#9ca3af"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <CustomText
                          weight="bold"
                          style={{ fontSize: 18, color: textPrimaryColor }}
                        >
                          {t("roadmap.phase4.title") ||
                            "Phase 4: Regional Leadership"}
                        </CustomText>
                        <CustomText
                          style={{
                            fontSize: 14,
                            color: theme === "dark" ? "#666" : "#9ca3af",
                            fontWeight: "500",
                          }}
                        >
                          {t("roadmap.future") || "Q1 2026"}
                        </CustomText>
                      </View>
                      <CustomText
                        style={{
                          color: textSecondaryColor,
                          lineHeight: 22,
                          marginBottom: 8,
                        }}
                      >
                        {t(
                          "roadmap.phase4.description",
                          "Advanced marketing suite, AI-powered analytics, cross-border payment solutions"
                        )}
                      </CustomText>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginRight: 16,
                          }}
                        >
                          <Ionicons
                            name="megaphone"
                            size={14}
                            color={textSecondaryColor}
                            style={{ marginRight: 6 }}
                          />
                          <CustomText
                            style={{ fontSize: 14, color: textSecondaryColor }}
                          >
                            5 {t("roadmap.ads") || "Ad Platforms"}
                          </CustomText>
                        </View>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="people"
                            size={14}
                            color={textSecondaryColor}
                            style={{ marginRight: 6 }}
                          />
                          <CustomText
                            style={{ fontSize: 14, color: textSecondaryColor }}
                          >
                            2,000+ {t("roadmap.users") || "Users"}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Right side: Big Number User Display */}
              <View
                style={{
                  width: isDesktop ? "50%" : "100%",
                  backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                  borderRadius: 16,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: isDesktop ? "row" : "column",
                    justifyContent: "center",
                    gap: 16,
                    marginTop: 40,
                  }}
                >
                  {/* Big Number User Display */}
                  <View
                    className="flex-row items-center justify-center mb-10"
                    style={{
                      width: "100%",
                      alignItems: "center",
                      marginBottom: 40,
                    }}
                  >
                    <View
                      style={{
                        // backgroundColor:
                        //   theme === "dark" ? "#1e1e1e" : "#f3f4f6",
                        borderRadius: 16,
                        padding: 24,
                        alignItems: "center",
                        borderColor: turquoiseColor,
                        width: isDesktop ? "60%" : "90%",
                      }}
                    >
                      {/* <CustomText
                        className="text-center mb-4"
                        style={{
                          fontSize: 18,
                          color: textSecondaryColor,
                        }}
                      >
                        {t("roadmap.userCounter") || "Registered Users"}
                      </CustomText> */}

                      <CustomText
                        weight="bold"
                        className="text-center"
                        style={{
                          fontSize: 72,
                          color: turquoiseColor,
                          marginBottom: 8,
                        }}
                      >
                        567
                      </CustomText>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="trending-up"
                          size={18}
                          color={accentColor}
                          style={{ marginRight: 8 }}
                        />
                        <CustomText
                          style={{
                            fontSize: 16,
                            color: accentColor,
                          }}
                        >
                          {t("roadmap.growthRate") || "Growing by 23% monthly"}
                        </CustomText>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>)}
        {/* Vision of Business Section - Desktop only */}
        {isDesktop && (
          <View
            className="w-full py-16 px-4"
            style={{
              backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
            }}
          >
            <View
              style={{ width: "100%", maxWidth: 1200, alignSelf: "center" }}
            >
              <CustomText
                weight="bold"
                className="text-center mb-2"
                style={{
                  fontSize: 32,
                  color: textPrimaryColor,
                }}
              >
                {t("vision.title") || "Our Business Vision"}
              </CustomText>

              <CustomText
                className="text-center mb-10"
                style={{
                  fontSize: 16,
                  color: textSecondaryColor,
                  maxWidth: 700,
                  alignSelf: "center",
                }}
              >
                {t(
                  "vision.subtitle",
                  "Building innovative solutions for modern business challenges"
                )}
              </CustomText>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 20,
                }}
              >
                {[1, 2, 3].map((item) => (
                  <View
                    key={item}
                    style={{
                      width: Math.min(350, (windowWidth - 60) / 3),
                      padding: 24,
                      backgroundColor: cardBgColor,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme === "dark" ? "#333" : "#e5e7eb",
                    }}
                  >
                    <View style={{ marginBottom: 16 }}>
                      <Ionicons
                        name={
                          item === 1
                            ? "analytics-outline"
                            : item === 2
                            ? "globe-outline"
                            : "shield-checkmark-outline"
                        }
                        size={32}
                        color={turquoiseColor}
                      />
                    </View>

                    <CustomText
                      weight="bold"
                      style={{
                        color: textPrimaryColor,
                        fontSize: 18,
                        marginBottom: 12,
                      }}
                    >
                      {t(
                        `vision.title${item}`,
                        item === 1
                          ? "Data-Driven Growth"
                          : item === 2
                          ? "Global Reach, Local Touch"
                          : "Business Integrity"
                      )}
                    </CustomText>

                    <CustomText
                      style={{
                        color: textSecondaryColor,
                        fontSize: 14,
                        marginBottom: 16,
                        lineHeight: 22,
                      }}
                    >
                      {t(
                        `vision.description${item}`,
                        item === 1
                          ? "Empowering businesses with actionable insights to make informed decisions and achieve sustainable growth."
                          : item === 2
                          ? "Adapting global best practices while understanding regional market nuances in Southeast Asia."
                          : "Building trust through transparent business practices and reliable system performance."
                      )}
                    </CustomText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        {/* Footer */}
        {isDesktop && (
        <View
          className="w-full py-16 px-4"
          style={{
            backgroundColor: theme === "dark" ? "#252527" : "#b3fdee",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1200,
              alignSelf: "center",
            }}
          >
            {/* Main Footer Content */}
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                justifyContent: "space-between",
                marginBottom: 48,
              }}
            >
              {/* Brand Column */}
              <View
                style={{
                  width: isDesktop ? "28%" : "100%",
                  marginBottom: isDesktop ? 0 : 40,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Image
                    source={images.logo}
                    style={{ width: 40, height: 40, marginRight: 12 }}
                    resizeMode="contain"
                  />
                  <CustomText
                    weight="semibold"
                    style={{ color: textSecondaryColor, fontSize: 18 }}
                  >
                    FLEXI BUSINESS HUB
                  </CustomText>
                </View>

                <CustomText
                  style={{
                    color: textSecondaryColor,
                    marginBottom: 24,
                    lineHeight: 24,
                  }}
                >
                  The all-in-one business management solution for modern
                  entrepreneurs and growing businesses
                </CustomText>
              </View>

              {/* Contact Info */}
              <View
                style={{
                  width: isDesktop ? "28%" : "100%",
                }}
              >
                <CustomText
                  weight="bold"
                  style={{
                    color: textSecondaryColor,
                    marginBottom: 20,
                    fontSize: 16,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {t("footer.contact.title") || "Contact Us"}
                </CustomText>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="location"
                      size={16}
                      color={textSecondaryColor}
                    />
                  </View>
                  <View>
                    <CustomText
                      style={{ color: textSecondaryColor, lineHeight: 22 }}
                    >
                      {t("footer.contact.address") ||
                        "101 Business Tower, Sukhumvit Road, Bangkok 10110, Thailand"}
                    </CustomText>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="mail"
                      size={16}
                      color={textSecondaryColor}
                    />
                  </View>
                  <View>
                    <CustomText style={{ color: textSecondaryColor }}>
                      {t("footer.contact.email") || "support@flexibusiness.com"}
                    </CustomText>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="call"
                      size={16}
                      color={textSecondaryColor}
                    />
                  </View>
                  <View>
                    <CustomText style={{ color: textSecondaryColor }}>
                      {t("footer.contact.phone") || "+66 2 123 4567"}
                    </CustomText>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Bar */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "rgba(148, 163, 184, 0.2)",
                paddingTop: 24,
                flexDirection: isDesktop ? "row" : "column-reverse",
                justifyContent: "space-between",
                alignItems: isDesktop ? "center" : "center",
              }}
            >
              <CustomText
                style={{
                  color: textSecondaryColor,
                  fontSize: 14,
                  marginTop: isDesktop ? 0 : 24,
                  textAlign: isDesktop ? "left" : "center",
                }}
              >
                © {new Date().getFullYear()}{" "}
                {t("copyright") || "All rights reserved."}
              </CustomText>

              <View
                style={{
                  flexDirection: "row",
                  gap: 24,
                  marginBottom: isDesktop ? 0 : 8,
                }}
              >
                <TouchableOpacity onPress={() => router.push("/term")}>
                  <CustomText
                    style={{
                      fontSize: 14,
                      color: textSecondaryColor,
                    }}
                  >
                    {t("footer.terms") || "Terms of Service"}
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/privacy")}>
                  <CustomText
                    style={{
                      fontSize: 14,
                      color: textSecondaryColor,
                    }}
                  >
                    {t("footer.privacy") || "Privacy Policy"}
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>)}
        
      </ScrollView>
    </SafeAreaView>
  );
}
