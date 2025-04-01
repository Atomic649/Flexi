import React, { useState, useEffect } from "react";
import { View, Animated, Image, SafeAreaView ,Text} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import CallAPIUser from "@/api/user_api";
import images from "@/constants/images";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import i18n from "@/i18n";

export default function RoadMap() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null);
  const animatedValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const response = await CallAPIUser.getRegisteredUsersAPI();
        setRegisteredUsers(response);
        animateCounter(response);
      } catch (error) {
        console.error("Error fetching registered users:", error);
      }
    };

    fetchRegisteredUsers();
    const interval = setInterval(fetchRegisteredUsers, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const animateCounter = (toValue: number) => {
    Animated.timing(animatedValue, {
      toValue,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (registeredUsers !== null) {
      animateCounter(registeredUsers);
    }
  }, [registeredUsers]);

  const animatedNumber = animatedValue.interpolate({
    inputRange: [registeredUsers || 0, registeredUsers || 1],
    outputRange: [registeredUsers || 0, registeredUsers || 1],
  });

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <View className="flex-row items-center justify-center m-4">
        <Image
          source={images.logo}
          style={{ width: 100, height: 100, marginBottom: 20 }}
        />
        {registeredUsers !== null && (
          <Animated.Text
            className="text-6xl text-center text-bold mt-8 mb-4 px-6"
            style={{ color: theme === "dark" ? "#03dcc7" : "#04ecd5" }}
          >
            {animatedNumber}
          </Animated.Text>
        )}
      </View>
      <View className="flex-col h-1/3 gap-4 px-2">
        {/* mission 1 */}
        <View className="flex-row items-center justify-between mx-2 px-8">
          <View className="flex-col items-start justify-center">
            <CustomText className="text-center text-lg font-bold text-white">
              5 {t("roadmap.products")}
            </CustomText>
            <CustomText className="text-center text-base text-white">
              100 {t("roadmap.users")}
            </CustomText>
          </View>
          {/* lock icon */}
          <Ionicons
            name="lock-closed"
            size={24}
            color={theme === "dark" ? "#03dcc7" : "#04ecd5"}
          />
        </View>
        {/* mission 2 */}
        <View className="flex-row items-center justify-between mx-2 px-8">
          <View className="flex-col items-start justify-center">
            <CustomText className="text-center text-lg font-bold text-white">
              2 {t("roadmap.business")}
            </CustomText>
            <CustomText className="text-center text-base text-white">
              500 {t("roadmap.users")}
            </CustomText>
          </View>
          {/* lock icon */}
          <Ionicons
            name="lock-closed"
            size={24}
            color={theme === "dark" ? "#03dcc7" : "#04ecd5"}
          />
        </View>
        {/* mission 3 */}
        <View className="flex-row items-center justify-between mx-2 px-8">
          <View className="flex-col items-start justify-center">
            <CustomText className="text-center text-lg font-bold text-white">
              5 {t("roadmap.store")}
            </CustomText>
            <CustomText className="text-center text-base text-white">
              1000 {t("roadmap.users")}
            </CustomText>
          </View>
          {/* lock icon */}
          <Ionicons
            name="lock-closed"
            size={24}
            color={theme === "dark" ? "#03dcc7" : "#04ecd5"}
          />
        </View>
        {/* mission 4 */}
        <View className="flex-row items-center justify-between mx-2 px-8">
          <View className="flex-col items-start justify-center">
            <CustomText
              className="text-center text-lg  text-white"
              style={{ fontWeight: "bold" }}
            >
              5 {t("roadmap.ads")}
            </CustomText>
            <CustomText className="text-center text-base text-white">
              2000 {t("roadmap.users")}
            </CustomText>
          </View>
          {/* lock icon */}
          <Ionicons
            name="lock-closed"
            size={24}
            color={theme === "dark" ? "#03dcc7" : "#04ecd5"}
          />
        </View>
      </View>

      {/* Vision */}
      <View className="flex-col items-center mt-8">
        <View
          className=" w-full  py-5 m-2 items-center justify-center"
          style={{ 
            backgroundColor: theme === "dark" ? "#242422" : "#f0f0f0",
            borderWidth: 1,
            borderColor: theme === "dark" ? "#03dcc7" : "#04ecd5",
            borderRadius: 10,
          }}
        >
          <Text className="text-center justify-center text-lg font-bold"
            style={{ color: theme === "dark" ? "#08ffe6" : "#04ecd5",
              fontFamily: i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
              fontSize: 18,
              fontWeight: "bold" as "bold",
             }}>
            {t("roadmap.vision")}
          </Text>
        </View>
        <View className="w-full mt-5 items-center justify-center px-5">
          <CustomText className="text-center justify-center text-base text-white">
            {t("roadmap.mission")}
          </CustomText>
        </View>
      </View>

      <View className="flex-row items-center justify-around mt-6 ">
        <CustomButton
          title={t("common.joinTeam")}
          handlePress={() => {}}
          containerStyles="px-8 mt-2"
          textStyles="!text-white"
        />

        <CustomButton
          title={t("common.advertise")}
          handlePress={() => {}}
          containerStyles="px-8 mt-2"
          textStyles="!text-white"
        />
      </View>
    </SafeAreaView>
  );
}
