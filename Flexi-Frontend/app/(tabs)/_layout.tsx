import React from "react";
import { router, Slot, Tabs } from "expo-router";
import { icons, images } from "@/constants";
import {
  View,
  Image,
  Platform,  
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";

// ปรับปรุง interface ของ TabIcon
interface TabIconProps {
  icon: any;
  color: string;
  focused: boolean;
  size?: "normal" | "large"; // เพิ่ม prop สำหรับกำหนดขนาด
  isImage?: boolean; // เพิ่ม prop สำหรับกำหนดว่าเป็น image หรือไม่
}

// ปรับปรุง TabIcon component
const TabIcon = ({
  icon,
  color,
  size = "normal",
  isImage = false,
}: TabIconProps) => {
  return (
    <View
      className={`
      flex items-center justify-center 
      ${size === "large" ? "mt-1" : ""}  // ขยับไอคอนขึ้นถ้าเป็นขนาดใหญ่
    `}
    >
      <View
        className={`
        flex items-center justify-center
        ${
          size === "large" ? "bg-[#ffffff00] p-3 rounded-full  " : ""
        }  // เพิ่มพื้นหลังถ้าเป็นขนาดใหญ่
      `}
      >
        {isImage ? (
          <Image
            source={icon}
            resizeMode="contain"
            style={{
              width: size === "large" ? 52 : 40,
              height: size === "large" ? 52 : 40,
            }}
          />
        ) : (
          <Image
            source={icon}
            resizeMode="contain"
            // Color Icon of Middle Tab
            tintColor={size === "large" ? "#ffffff" : color}
            className={size === "large" ? "w-9 h-9  " : "w-9 h-7"}
            style={{            
              width: Platform.OS === "web" ?  18:28,
              height: Platform.OS === "web" ?  18:28,
            }}
          />
        )}
      </View>
    </View>
  );
};


// Mock window object for non-web environments
if (Platform.OS !== "web" && typeof global.window === "undefined") {
  global.window = {} as Window & typeof globalThis; // Mock window object
}

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  // Define colors based on theme
  const tabBarBackgroundColor = theme === "dark" ? "#18181b" : "#ffffff";
  const tabBarBorderColor = theme === "dark" ? "#232533" : "#e0e0e0";
  const tabBarActiveTintColor = theme === "dark" ? "#03dcc7" : "#04ecd5";
  const tabBarInactiveTintColor = theme === "dark" ? "#a1a1a1" : "#4e4b47";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: Dimensions.get("window").width > 768  ? 16 : 12,
          fontFamily:
            i18n.language === "th"
              ? "NotoSansThai-Regular"
              : "Poppins-Regular",
          marginTop: 5,
        },
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          borderTopWidth: Dimensions.get("window").width > 768  ? 0 : 1,
          borderBottomWidth: Dimensions.get("window").width > 768  ? 1 : 0,
          borderColor: tabBarBorderColor,
          height: Platform.OS === "web" ? 60 : 90,
          paddingTop: Platform.OS === "web" ? 0 : 5,
          paddingBottom: Platform.OS === "web" ? 0 : 30,
          position: Platform.OS === "web" ? "absolute" : "relative",
          top: Platform.OS === "web" ? 0 : undefined,
          zIndex: Platform.OS === "web" ? 5 : undefined,
          ...Platform.select({
            ios: { height: 60, paddingBottom: 0, safeAreaInsets: { bottom: 35 } },
            android: { height: 110, paddingBottom: 0, safeAreaInsets: { bottom: 35 } },
            web: { safeAreaInsets: { top: 0 } },
          }),
        },
      }}
    >
      {/* Ensure all children are of type Screen */}
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: t("tabs.income"),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.income} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={images.logo}
              color={color}
              focused={focused}
              size="large"
              isImage={true}
            />
          ),
          tabBarLabel: () => null, // Hide label for the middle button
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: t("tabs.expense"),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.expense} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t("tabs.shop"),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.shop} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

