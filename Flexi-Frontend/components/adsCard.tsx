import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AdsCard({
  id,
  platform,
  accName,
  accId,
  color,
  cardColor,
  onDelete,
}: any) {
  const getBorderColor = (platform: string) => {
    switch (platform) {
      case "Facebook":
        return "#3c22ff";
      case "Tiktok":
        return "#424040";
      case "Line":
        return "#56ff56"; // Lemon green
      case "Shopee":
        return "#ff4000"; // Orange red
      default:
        return "#61fff2"; // Default color
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this ad connection?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(id),
        },
      ]
    );
  };

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={handleDelete}
      className="bg-[#ff2a00] justify-center items-center w-20 m-1 rounded-lg"
    >
      <Ionicons name="trash" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View className="flex px-10">
      <Swipeable renderRightActions={renderRightActions}>
        <View
          className={`flex flex-col items-center pt-2 pb-4 px-4  my-1  rounded-se-md 
         bg-[#918b8b0d]
         border-s-8 `}
          style={{ borderColor: getBorderColor(platform), backgroundColor: cardColor }}
        >
          <View className="flex flex-row gap-3 items-start">
            <View className="flex justify-center items-center flex-row flex-1">
              <View className="flex justify-center flex-1 ml-3 gap-y-1">
                <Text
                  className="font-bold text-sm text-zinc-500"
                  numberOfLines={3}
                >
                  {platform}
                </Text>
                <Text
                  className="text-lg text-zinc-500 font-psemibold"
                  numberOfLines={1}
                >
                  {accName}
                </Text>
                <Text
                  className="text-base text-zinc-500 font-pregular"
                  numberOfLines={1}
                >
                  {accId}
                </Text>
              </View>
            </View>
            <View className="pt-2">
              <TouchableOpacity
                onPress={() => {
                  router.push(`editads?id=${id}`);
                }}
              >
                <Ionicons
                  name="settings-sharp"
                  color={color}
                  size={22}
                ></Ionicons>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Swipeable>
    </View>
  );
}
