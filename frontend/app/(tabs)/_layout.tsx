// rnf
import React from "react"
// import Octicons from "@expo/vector-icons/Octicons"
import { Tabs } from "expo-router"
import { icons } from "@/constants"
import { View, Image, Text } from "react-native"

// function TabBarIcon(props: {
//   name: React.ComponentProps<typeof Octicons>["name"]
//   color: string
// }) {
//   return <Octicons size={24} style={{ marginBottom: 5 }} {...props} />
// }

// สร้าง component TabIcon สำหรับแสดง icon แต่ละ tab
const TabIcon = ({ icon, color }: any) => {
  return (
    <View className="flex items-center justify-center gap-4">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-8"
      />
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFA001",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 }, // ขนาดตัวอักษรของ Tab
        tabBarStyle: {
          backgroundColor: "#161622",
          borderTopWidth: 1,
          borderTopColor: "#232533",
          height: 70,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.home}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.profile}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.plus}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookmark"
        options={{
          title: "Bookmark",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.bookmark}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.setting}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  )
}
