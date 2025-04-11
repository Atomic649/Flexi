import React from "react";
import { router, Tabs } from "expo-router";
import { icons, images } from "@/constants";
import {
  View,
  Image,
  Platform,  
  TouchableOpacity,
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
          />
        )}
      </View>
    </View>
  );
};

interface ToolbarProps {
  visible: boolean;
  onClose: () => void;
}

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
 

  // Define colors based on theme
  const tabBarBackgroundColor = theme === "dark" ? "#18181b" : "#ffffff"; // C2 - Main Tab Bar BG Color
  const tabBarBorderColor = theme === "dark" ? "#232533" : "#e0e0e0";
  const tabBarActiveTintColor = theme === "dark" ? "#03dcc7" : "#04ecd5"; // choose icon
  const tabBarInactiveTintColor = theme === "dark" ? "#a1a1a1" : "#4e4b47"; // icon

  return (
    // -------- Major Tap --------

    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tabBarActiveTintColor,
          tabBarInactiveTintColor: tabBarInactiveTintColor,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily:
              i18n.language === "th"
                ? "NotoSansThai-Regular"
                : "Poppins-Regular",
            marginTop: 5,
          },

          tabBarStyle: {
            backgroundColor: tabBarBackgroundColor,
            borderTopWidth: 0,
            borderTopColor: tabBarBorderColor,
            height: Platform.OS === "ios" ? 90 : 90,
            paddingTop: 5,
            paddingBottom: Platform.OS === "ios" ? 30 : 30,
            ...Platform.select({
              ios: {
                height: 60,
                paddingBottom: 0,
                safeAreaInsets: { bottom: 35 },
              },
              android: {
                height: 110,
                paddingBottom: 0,
                safeAreaInsets: { bottom: 35 },
              },
            }),
          },
        }}
      >
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
              <TouchableOpacity onPress={() => router.push("settings")}>
                <TabIcon
                  icon={images.logo}
                  color={color}
                  focused={focused}
                  size="large" // กำหนดให้เป็นขนาดใหญ่
                  isImage={true} // กำหนดว่าเป็น image
                />
              </TouchableOpacity>
            ),
            tabBarLabel: () => null, // ซ่อน label สำหรับปุ่มตรงกลาง
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
     
    </>
  );
}

