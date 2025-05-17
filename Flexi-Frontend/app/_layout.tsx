// Import your global CSS file
import "../global.css";
import "@/i18n";
import React, { useEffect, useState } from "react";
import { router, Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  SafeAreaView,
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
import i18n from "@/i18n";
import mainTopBar from "@/components/MainTopBar";
import { initReactI18next } from 'react-i18next';

// i18n  initialized for web
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    // Your i18next configuration
    fallbackLng: 'en', 
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


  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const response = await CallAPIUser.getRegisteredUsersAPI();
        if (response && typeof response === 'object' && 'message' in response) {
          const userCount = parseInt(response.message);
          if (!isNaN(userCount)) {
            setRegisteredUsers(userCount);
          } else {
            setRegisteredUsers(parseInt(response.message));
          }
        } else {
          setRegisteredUsers(response);
        }
      } catch (error) {
        console.error("Error fetching registered users:", error);
        setRegisteredUsers(0);
      }
    };
    fetchRegisteredUsers();
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
        <Stack.Screen
          name="(tabs)"
          options={{
            ...mainTopBar(theme, registeredUsers, businessAvatar, businessName),
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
            ...showTopBarAndBackIcon(theme),
            title: t("profile.Profile"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        <Stack.Screen
          name="business_info"
          options={{
            ...showTopBarAndBackIcon(theme),
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
            ...showTopBarAndBackIcon(theme),
            title: t("store.title"),
            headerTitleStyle: getHeaderTitleStyle(),
          }}
        />
        {/* product */}
        <Stack.Screen
          name="product"
          options={{
            ...showTopBarAndBackIcon(theme),
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
        {/* ads */}
        <Stack.Screen
          name="ads"
          options={{
            ...showTopBarAndBackIcon(theme),
            title: t("ads.title"),
            headerTitleStyle: getHeaderTitleStyle(),
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
    "NotoSansThai-Thin": require("../assets/fonts/NotoSansThai-Thin.ttf"),
    "NotoSansThai-ExtraLight": require("../assets/fonts/NotoSansThai-ExtraLight.ttf"),
    "NotoSansThai-Light": require("../assets/fonts/NotoSansThai-Light.ttf"),
    "NotoSansThai-Regular": require("../assets/fonts/NotoSansThai-Regular.ttf"),
    "NotoSansThai-Medium": require("../assets/fonts/NotoSansThai-Medium.ttf"),
    "NotoSansThai-SemiBold": require("../assets/fonts/NotoSansThai-SemiBold.ttf"),
    "NotoSansThai-Bold": require("../assets/fonts/NotoSansThai-Bold.ttf"),
    "NotoSansThai-ExtraBold": require("../assets/fonts/NotoSansThai-ExtraBold.ttf"),
    "NotoSansThai-Black": require("../assets/fonts/NotoSansThai-Black.ttf"),
  });

  if (error) throw error;
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <BusinessProvider>
          <RootLayoutNav />
        </BusinessProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Reuseable functions for showing Top bar
const showTopBarAndBackIcon = (theme: string) => ({
  headerShown: true,
  headerStyle: {
    backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
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

// Reuseable functions for hiding Top bar
const HideTopBar = () => ({
  headerShown: false,
});


const getHeaderTitleStyle = () => ({
  fontSize: 15,
  fontFamily:
    i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
});
