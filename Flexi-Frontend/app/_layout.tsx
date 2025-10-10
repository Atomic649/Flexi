// Import your global CSS file
import "../global.css";
import "@/i18n";
import React, { useEffect, useState } from "react";
import { router, Stack } from "expo-router";
import { useFonts } from "expo-font";
import {  
  StatusBar, 
  Platform,
} from "react-native";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import * as NavigationBar from "expo-navigation-bar";
import { AuthProvider } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import CallAPIUser from "@/api/auth_api";
import { BusinessProvider, useBusiness } from "@/providers/BusinessProvider";
import { MarketingProvider } from "@/providers/MarketingProvider";
import i18n from "@/i18n";
import MainTopBar from "@/components/MainTopBar";
import { initReactI18next } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// i18n  initialized for web
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    // Your i18next configuration
    fallbackLng: 'th', 
    resources: {
      en: { translation: require("@/i18n/locales/en/translation.json") },
      th: { translation: require("@/i18n/locales/th/translation.json") },
    },
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  }).then(() => {    
   // console.log("i18n initialized");
  }).catch((error) => {
    console.error("i18n initialization failed:", error);
  });
}

function RootLayoutNav() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { businessAvatar, businessName } = useBusiness();
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRegisteredUsers = async () => {
      setIsLoading(true);
      try {
        // Use the cached function from MainTopBar
        const cachedUsers = await MainTopBar.getCachedRegisteredUsers();
        setRegisteredUsers(cachedUsers);
      } catch (error) {
        console.error("Error loading registered users:", error);
        setRegisteredUsers(0);
      } finally {
        // Add a small delay to ensure UI transitions smoothly
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    loadRegisteredUsers();

    // Set up periodic refresh (every 5 minutes) without showing loading indicator
    const refreshInterval = setInterval(async () => {
      try {
        const response = await CallAPIUser.getRegisteredUsersAPI();
        if (response) {
          setRegisteredUsers(response);
          // Update cache
          await AsyncStorage.setItem("registeredUsers", JSON.stringify(response));
        }
      } catch (error) {
        console.error("Error refreshing registered users:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    async function updateNavigationBar() {
      try {
        const navBarColor = theme === "dark" ? "#18181b" : "#ffffff";

        if (Platform.OS === "android") {
          await NavigationBar.setBackgroundColorAsync(navBarColor);
          // Set button style based on theme
          await NavigationBar.setButtonStyleAsync(
            theme === "dark" ? "light" : "dark"
          );
        } else {
          // console.warn(
          //   "`setBackgroundColorAsync` and `setButtonStyleAsync` are only available on Android"
          // );
          
        }
      } catch (error) {
        console.error("Error setting navigation bar:", error);
      }
    }

    updateNavigationBar();
  }, [theme]);

  return (
    <SafeAreaView
      className={`h-screen ${theme === "dark" ? "bg-zinc-900" : "bg-white"}`} // color of last bottom bar
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme === "dark" ? "#18181b" : "#ffffff"}
        animated={true}
      />

      <Stack>
        {/* landing */}
        <Stack.Screen
          name="landing"
          options={{
            ...HideTopBar(),
            title: t("landing.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            ...MainTopBar.getTopBarConfig(theme, registeredUsers, businessAvatar, businessName, isLoading),
            title: "",
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            ...HideTopBar(),
            title: t("auth.login.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            ...HideTopBar(),
            title: t("tabs.home"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            ...showTopBarAndBackIconRightSetting(theme),
            title: t("profile.Profile"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="business_info"
          options={{
            ...showTopBarAndBackIconRightSetting(theme),
            title: t("settings.businessInfo"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="roadmap"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("roadmap.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="createproduct"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("create.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="editproduct"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("product.detail"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="createads"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("ads.createAd"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="createstore"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("store.createStore"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="editads"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("ads.editAd"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="editstore"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("store.editStore"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        {/* store */}
        <Stack.Screen
          name="store"
          options={{
            ...showTopBarAndBackToSetting(theme),
            title: t("store.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        {/* product */}
        <Stack.Screen
          name="product"
          options={{
            ...showTopBarAndBackToSetting(theme),
            title: t("product.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        {/* CreateBusiness */}
        <Stack.Screen
          name="createBusiness"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("auth.businessRegister.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        {/* createbill */}
        <Stack.Screen
          name="createBill"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("bill.createBill"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        
        {/* Edit Bill */}
        <Stack.Screen
          name="editBill"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("bill.editBill"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        
        {/* ads */}
        <Stack.Screen
          name="ads"
          options={{
            ...showTopBarAndBackToSetting(theme),
            title: t("ads.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        {/* create ads cost */}
      <Stack.Screen
        name="createadscost"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("ads.createAdCost"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
        <Stack.Screen
        name="term"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("terms.title"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
      {/* phase1 */}
      <Stack.Screen
        name="phase1"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("phase1.title"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
      {/* phase2 */}
      <Stack.Screen
        name="phase2"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("phase2.title"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
      {/* print */}
      <Stack.Screen
        name="print"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("print.title"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
      {/* Chat AI */}
      <Stack.Screen
        name="chat_ai"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("chatAI.title"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
      {/* mobileWeb */}
      <Stack.Screen
        name="mobileweb"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("mobileWeb.title"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
      {/* privacy */}
      <Stack.Screen
        name="privacy"
        options={{
          ...showTopBarAndBackIcon(theme),
          title: t("privacy.title"),
          headerTitleStyle: getHeaderTitleStyle(),
        }}
      />
      {/* expense detail */}
      <Stack.Screen
        name="expenseDetailScreen"
        options={{
          headerShown: false, // Hide the header for this screen
        }}
      />
      </Stack>


     

      
    </SafeAreaView>
  );
}

export default function RootLayout() {
  // Load fonts before rendering the app
  const [fontsLoaded, error] = useFonts({
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "IBMPlexSansThai-Regular": require("../assets/fonts/IBMPlexSansThai-Regular.ttf"),
    "IBMPlexSansThai-Medium": require("../assets/fonts/IBMPlexSansThai-Medium.ttf"),
    "IBMPlexSansThai-SemiBold": require("../assets/fonts/IBMPlexSansThai-SemiBold.ttf"),
    "IBMPlexSansThai-Bold": require("../assets/fonts/IBMPlexSansThai-Bold.ttf"),
    "IBMPlexSansThai-Thin": require("../assets/fonts/IBMPlexSansThai-Thin.ttf"),
    "IBMPlexSansThai-ExtraLight": require("../assets/fonts/IBMPlexSansThai-ExtraLight.ttf"),
  });

  if (error) throw error;
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <BusinessProvider>
            <MarketingProvider>
              <RootLayoutNav />
            </MarketingProvider>
          </BusinessProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Reuseable functions for showing Top bar
const showTopBarAndBackIcon = (theme: string) => ({
  headerShown: true,
  headerStyle: {
    backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
    fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Bold" : "Poppins-Regular",
  },
  headerTintColor: theme === "dark" ? "#ffffff" : "#18181b",
  headerLeft: () => (
    // Back button
    <Ionicons
      name="chevron-back"
      size={24}
      color={theme === "dark" ? "#ffffff" : "#18181b"}
      onPress={() => router.back()}
    />
  ),
});

// Reuseable functions for showing Top bar
const showTopBarAndBackToSetting = (theme: string) => ({
  headerShown: true,
  headerStyle: {
    backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
    fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Bold" : "Poppins-Regular",
  },
  headerTintColor: theme === "dark" ? "#ffffff" : "#18181b",
  headerLeft: () => (
    // Back button
    <Ionicons
      name="chevron-back"
      size={24}
      color={theme === "dark" ? "#ffffff" : "#18181b"}
      onPress={() => router.push("/settings")}
    />
  ),
});

const showTopBarAndBackIconRightSetting = (theme: string) => ({
  headerShown: true,
  headerStyle: {
    backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
    fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Bold" : "Poppins-Regular",
  },
  headerTintColor: theme === "dark" ? "#ffffff" : "#18181b",
  headerLeft: () => (
    // Back button
    <Ionicons
      name="chevron-back"
      size={24}
      color={theme === "dark" ? "#ffffff" : "#18181b"}
      onPress={() => router.back()}
    />
  ),

  headerRight: () => (
    // Settings button
    <Ionicons
      name="settings"
      size={24}
      color={theme === "dark" ? "#c9c9c9" : "#48453e"}
      onPress={() => router.push("/settings")}
    />
  ),
});


// Reuseable functions for hiding Top bar
const HideTopBar = () => ({
  headerShown: false,
});


const getHeaderTitleStyle = () => ({
  fontSize: 15,
  fontFamily:
    i18n.language === "th" ? "IBMPlexSansThai-Bold" : "Poppins-Regular",
});
