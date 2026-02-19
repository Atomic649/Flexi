import React, { useState, useEffect } from "react";
import {
  View,
  Animated,
  Image,
  Text,
  Platform,
  Dimensions,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import CallAPIUser from "@/api/auth_api";
import images from "@/constants/images";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { CustomButton } from "@/components/CustomButton";
import CustomAlert from "@/components/CustomAlert";
import i18n from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserId } from "@/utils/utility";
const Clipboard = require("expo-clipboard");
const { ToastAndroid } = require("react-native");

export default function RoadMap() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null);
  const animatedValue = useState(new Animated.Value(0))[0];
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
  });

  const hideAlert = () =>
    setAlertConfig((prev) => ({
      ...prev,
      visible: false,
    }));

  const showAlert = (title: string, message: string) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: [
        {
          text: t("common.ok"),
          onPress: hideAlert,
        },
      ],
    });
  };

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        // Check cache first
        const cachedData = await AsyncStorage.getItem("registeredUsers");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setRegisteredUsers(parsedData);
          animateCounter(parsedData);
        }

        // Fetch fresh data
        const response = await CallAPIUser.getRegisteredUsersAPI();
        setRegisteredUsers(response);
        animateCounter(response);

        // Update cache
        await AsyncStorage.setItem("registeredUsers", JSON.stringify(response));
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

  // Note: No effect reacting to registeredUsers; animateCounter is invoked within fetchRegisteredUsers

  const animatedNumber = animatedValue.interpolate({
    inputRange: [registeredUsers || 0, registeredUsers || 1],
    outputRange: [registeredUsers || 0, registeredUsers || 1],
  });

  const loadUserProfile = async () => {
    try {
      const id = await getUserId();
      if (!id) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }
      const data = await CallAPIUser.getUserAPI(id);

      setUsername(data.username || "");
    } catch (err: any) {
      console.error("Error loading user profile:", err);
      setError(err?.message || "Failed to load user profile");
    }
  };
  useEffect(() => {
    loadUserProfile();
  }, []);

  const RoadMap = ({
    title,
    description,
    numberUser,
  }: {
    title: string;
    description: string;
    numberUser: number;
  }) => (
    <View className="flex-row items-center mb-6">
      <Ionicons
        name="lock-closed"
        size={26}
        color={theme === "dark" ? "#03dcc7" : "#04ecd5"}
        className="mr-4 mt-1"
      />
      <View className="flex-1">
        <CustomText className="text-lg font-bold mb-1 pt-1">{title}</CustomText>
        <CustomText
          className="text-base"
          style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
        >
          {description}
        </CustomText>
      </View>
      <Text
      className="text-2xl font-bold"
       style={{ color: theme === "dark" ? "#03dcc7" : "#04ecd5" }}>
        {numberUser}
        </Text>
    </View>
  );

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <View
        className="flex-row items-center justify-center m-4"
        style={
          Dimensions.get("window").width > 768
            ? { alignSelf: "center", width: "60%" }
            : {}
        }
      >
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
      <View className="border-b border-gray-300 mt-4 mx-8">
        <RoadMap
          title={"ปลดล๊อค 5 สินค้า"}
          description={"สามารถลงสินค้าได้เพิ่มถึง 5 รายการ"}
          numberUser={100}
        />
        <RoadMap
          title={t("ปลดล๊อค 2 บัญชีธุรกิจ")}
          description={t("สามารถเพิ่มบัญชีธุรกิจได้ถึง 2 บัญชี")}
          numberUser={500}
        />
      </View>
      <View className="border-b border-gray-300 my-4 mx-8 pb-4">
        <Text
          className="text-2xl font-bold items-center justify-center"
          style={{
            color: theme === "dark" ? "#03dcc7" : "#01ecd4",
            textAlign: "center",
            ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
          }}
          onPress={async () => {
            try {
              const textToCopy = username;
              if (
                Platform.OS === "web" &&
                typeof navigator !== "undefined" &&
                navigator.clipboard?.writeText
              ) {
                await navigator.clipboard.writeText(textToCopy);
              } else {
                await Clipboard.setStringAsync(textToCopy);
              }

              if (Platform.OS === "android") {
                ToastAndroid.show(t("roadmap.copiedClipboard"), ToastAndroid.SHORT);
              } else {
                showAlert(
                  t("common.success"),
                  t("roadmap.copiedClipboard")
                );
              }
            } catch (err) {
              console.error("Copy failed:", err);
              showAlert(
                t("common.error"),
                t("roadmap.copyClipboardError")
              );
            }
          }}
        >
          {username}
        </Text>
      </View>

      {/* Vision */}
      <View
        className="flex-col items-center mx-8"
        style={
          Dimensions.get("window").width > 768
            ? { alignSelf: "center", width: "60%" }
            : {}
        }
      >
        <View className="w-full mt-5 items-center justify-center px-5">
          <CustomText className="text-center justify-center text-base text-white">
            {t("roadmap.mission")}
          </CustomText>
        </View>
      </View>

      <View
        className="flex-row items-center justify-center m-6 gap-2 mt-6"
        style={
          Platform.OS === "web" ? { alignSelf: "center", width: "60%" } : {}
        }
      >
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
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}
