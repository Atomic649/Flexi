import React from "react";
import { View, TouchableOpacity, Image, Text, Platform } from "react-native";
import { router } from "expo-router";
import { CustomText } from "@/components/CustomText";
import { icons, images } from "@/constants";


const mainTopBar = (
  theme: string,
  registeredUsers: number | null,
  businessAvatar: string | null,
  businessName: string | null,  
) => ({
  headerShown: true,
  headerStyle: {
    backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
  },
  headerTintColor: theme === "dark" ? "#ffffff" : "#18181b",
  headerLeft: () => (
    <View
      className="flex-row items-center justify-between gap-4 ml-6  "
      style={{ paddingLeft: Platform.OS === "web" ? "10%" : 0 }}
    >
      <TouchableOpacity onPress={() => router.push("/profile")} className="">
        <View className="w-9 h-9 rounded-full overflow-hidden">
          <Image
            source={{
              uri: businessAvatar || images.empty,
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      <CustomText className="text-base font-bold text-zinc-500 ">
        {businessName || ""}
      </CustomText>
    </View>
  ),

  headerRight: () => (
    <View
      className="flex-row items-center"
      style={{ paddingRight: Platform.OS === "web" ? "0.5%" : 0 }}
    >
      <TouchableOpacity onPress={() => router.push("/roadmap")} className="mr-5">
        <Image
          source={icons.businessman}
          resizeMode="stretch"
          tintColor={theme === "dark" ? "#ffffff" : "#4e4b47"}
          style={{
            width: 23,
            height: 20,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: -6,
            right: -13,
            height: 18,
            width: 18,
            borderRadius: 10,
            backgroundColor: "#07e5c0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            className={`text-xs font-bold ${
              theme === "dark" ? "text-[#18181b]" : "text-white"
            }`}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {registeredUsers && registeredUsers > 1000
              ? `${(registeredUsers / 1000).toFixed(1)}k`
              : registeredUsers || 0}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  ),
});

export default mainTopBar;