import React from "react";
import { View, TouchableOpacity, Image, Text, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { CustomText } from "@/components/CustomText";
import { icons, images } from "@/constants";
import i18n from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CallAPIUser from "@/api/auth_api";
import { Ionicons } from "@expo/vector-icons";

// ฟังก์ชันสลับภาษา
const toggleLanguage = () => {
  const newLang = i18n.language === "th" ? "en" : "th";
  AsyncStorage.setItem("language", newLang);
  i18n.changeLanguage(newLang);
};

// Function to get cached registered users or fetch from API
const getCachedRegisteredUsers = async (): Promise<number | null> => {
  try {
    // Try to get from cache first
    const cachedData = await AsyncStorage.getItem("registeredUsers");
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    // If no cache, fetch from API
    const response = await CallAPIUser.getRegisteredUsersAPI();
    if (response) {
      // Store in cache for future use
      await AsyncStorage.setItem("registeredUsers", JSON.stringify(response));
      return response;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching registered users:", error);
    return 0;
  }
};

// Export as a function that returns configuration object
const MainTopBar = {
  getTopBarConfig: (
    theme: string,
    registeredUsers: number | null,
    businessAvatar: string | null,
    businessName: string | null,
    isLoading: boolean = false
  ) => ({
    headerShown: true,
    headerStyle: {
      backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
    },
    headerTintColor: theme === "dark" ? "#ffffff" : "#18181b",
    headerLeft: () => (
      <View
        className="flex-row items-center justify-between gap-4 ml-6"
        style={{ paddingLeft: Platform.OS === "web" ? "10%" : 0 }}
      >
        <TouchableOpacity onPress={() => router.push("/profile")} className="">
          <View className="w-9 h-9 rounded-full overflow-hidden justify-center items-center">
            {isLoading ? (
              <ActivityIndicator size="small" color={theme === "dark" ? "#ffffff" : "#18181b"} />
            ) : (
              <Image
                source={{
                  uri: businessAvatar || images.empty,
                }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
        <View className="min-w-[100] max-w-[150]">
          {isLoading ? (
            <ActivityIndicator size="small" color={theme === "dark" ? "#ffffff" : "#18181b"} />
          ) : (
            <CustomText className="text-base font-bold " numberOfLines={1}>
              {businessName || ""}
            </CustomText>
          )}
        </View>
      </View>
    ),

    headerRight: () => (
      <View
        className="flex-row items-center"
        style={{ paddingRight: Platform.OS === "web" ? "0.5%" : 0 }}
      >
        {/* print report */}
        <TouchableOpacity
          onPress={() => router.push("/print")}
          className="mr-5"
        >
          <Ionicons
            name="print"
            size={22}
            color={theme === "dark" ? "#ffffff" : "#4e4b47"}
          />
        </TouchableOpacity>

        {/* if web (Dimension of screen >786) show log in and register button and language setting */}
        <TouchableOpacity
          onPress={() => 
            // logic to handle sign out
            AsyncStorage.removeItem("isLoggedIn").then(() => {
              router.push("/landing");
            }
          )
          }
          className="mr-5"
          style={{
            display: Platform.OS === "web" ? "flex" : "none",
          }}
        >
          <CustomText           
            style={{
              color: theme === "dark" ? "#a1a1a1" : "#4e4b47",
            }}
            className={`text-base  `}
          >
            {i18n.t("common.signOut")}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="mr-5"
          style={{
            display: Platform.OS === "web" ? "flex" : "none",
          }}
        >
        
        </TouchableOpacity>
        {/* ปุ่มเปลี่ยนภาษา */}
        <TouchableOpacity
          style={{
            display: Platform.OS === "web" ? "flex" : "none",
          }}
          onPress={toggleLanguage}
          className="  rounded-full"
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

        <TouchableOpacity
          onPress={() => router.push("/roadmap")}
          className="mr-5"
        >
          <Image
            source={icons.businessman}
            resizeMode="stretch"
            tintColor={theme === "dark" ? "#ffffff" : "#4e4b47"}
            style={{
              width: 23,
              height: 20,
            }}
          />
          {isLoading ? (
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
              <ActivityIndicator size="small" color={theme === "dark" ? "#18181b" : "#ffffff"} />
            </View>
          ) : (
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
          )}
        </TouchableOpacity>
      </View>
    ),
  }),
  getCachedRegisteredUsers // Export the function to get cached users
};

export default MainTopBar;
