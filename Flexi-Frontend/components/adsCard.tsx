import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CustomAlert from "@/components/CustomAlert";
import { SwipeableRow, SwipeAction } from "./swipe/SwipeableRow";

export default function AdsCard({
  id,
  platform,
  accName,
  accId,
  productName,
  color,
  cardColor,
  onDelete,
}: any) {
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

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
    setAlertConfig({
      visible: true,
      title: "Delete",
      message: "Are you sure you want to delete this ad connection?",
      buttons: [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            onDelete(id);
          },
        },
      ],
    });
  };

  // Define swipe actions for the ads card
  const rightActions: SwipeAction[] = [
    {
      id: "delete",
      icon: "trash",     
      backgroundColor: "#ff2a00",
      textColor: "#FFFFFF",      
      onPress: handleDelete,
    },
  ];

  return (
    <View className="flex px-10 items-center">
      <SwipeableRow
        rightActions={rightActions}
        threshold={60}
        actionWidth={80}
        actionHeight="90%"
        actionBorderRadius={6}
      >
        <View
          className={`flex flex-col items-center pt-2 pb-4 px-4  my-1  rounded-se-md 
                bg-[#918b8b0d]
                border-s-8 `}
          style={{
            width: Platform.OS === "web" ? 500 : 350,
            borderColor: getBorderColor(platform),
            backgroundColor: cardColor,
          }}
        >
        <View
          className="flex flex-row "
          style={{
            width: Platform.OS === "web" ? 500 : 350,
            height: Platform.OS === "web" ? 100 : 80,
            justifyContent: "space-between",
            padding: 15,
          }}
        >
          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text className="font-bold text-sm text-zinc-500" numberOfLines={3}>
              {platform}
            </Text>
            <View className="flex-row justify-start gap-1 items-center">
            <Text
              className="text-lg text-zinc-500 font-psemibold"
              numberOfLines={1}
            >
              {accName}
            </Text>
            {productName ? (
              <Ionicons name="link" size={16} color="#0ed093" className="ml-1 mt-1"/>
            ) : null}
            {productName ? (
              <Text
                className="text-sm text-zinc-500 font-pregular"
                numberOfLines={1}
              >
                {productName}
              </Text>
            ) : null}
            </View>
            <Text
              className="text-base text-zinc-500 font-pregular"
              numberOfLines={1}
            >
              {accId}
            </Text>
          </View>
          <View className="pt-2 flex-col gap-2">
            <TouchableOpacity
              onPress={() => {
                router.push(`/editads?id=${id}`);
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
      </SwipeableRow>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
