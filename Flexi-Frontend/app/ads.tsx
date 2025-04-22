import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CallAPIPlatform from "@/api/platform_api";
import { useTranslation } from "react-i18next";
import AdsCard from "@/components/adsCard";
import { getMemberId } from "@/utils/utility";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomText } from "@/components/CustomText";

type Platform = {
  id: number;
  platform: string;
  accName: string;
  accId: string;
  businessAcc: number;
  memberId: string;
};

export default function ads() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    const fetchPlatform = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIPlatform.getPlatformsAPI(memberId);
          setPlatforms(response);
        }
      } catch (error) {
        console.error("Error fetching platform:", error);
      }
    };

    fetchPlatform();
  }, []);

  const onRefresh = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIPlatform.getPlatformsAPI(memberId);
        setPlatforms(response);
      }
    } catch (error) {
      console.error("Error fetching platform:", error);
    }
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      "Delete Ad Connection",
      "Are you sure you want to delete this ad Connection?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await CallAPIPlatform.deletePlatformAPI(id);
              setPlatforms(platforms.filter((platform) => platform.id !== id));
            } catch (error) {
              console.error("Error deleting platform:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
        <FlatList
          data={platforms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AdsCard
              id={item.id}
              platform={item.platform}
              accName={item.accName}
              accId={item.accId}
              color={theme === "dark" ? "#616161" : "#aeadac"}
              cardColor={theme === "dark" ? "#1b1b1b" : "#f2f2f2"}
              onDelete={handleDelete}
            />
          )}
          ListHeaderComponent={() => (
            <View className="flex px-4 my-6 space-y-6 items-center">
              {/* <Text
                className={`text-xl my-6 font-bold ${
                  theme === "dark" ? "text-white" : "text-[#5d5a54]"
                }`}
              >
                {t("ads.title")}
              </Text> */}
              <CustomText
                className={`text-sm font-normal ${
                  theme === "dark" ? "text-white" : "text-[#5d5a54]"
                }`}
              >
                {t("ads.limit")}
              </CustomText>
              <TouchableOpacity onPress={() => router.push("roadmap")}>
                <Text className={`mt-1 text-base font-bold text-[#FF006E]`}>
                  {t("ads.help")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <CustomText className="pt-10 text-center text-white">{t("common.notfound")}</CustomText>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {/* Setting Limit Ads Connection Acc "4" */}
        {platforms.length < 4 && (
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 65,
              right: 30,
              backgroundColor: "#04eccd",
              borderRadius: 50,
              padding: 15,
              elevation: 5,
            }}
            onPress={() => {
              router.push("/createads");
            }}
          >
            <Ionicons
              name="add"
              size={24}
              color={theme === "dark" ? "#ffffff" : "#444541"}
            />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
