import { View, Text, Image, TouchableOpacity, Alert, useWindowDimensions } from "react-native";
import React from "react";
import { icons } from "@/constants";
import { router } from "expo-router";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from "@expo/vector-icons";

export default function ProductCard({
  id,
  productname,
  productprice,
  productimage,
  productstock,
  onDelete,
}: any) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const isWebLarge = width > 768;
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
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
      className="bg-[#ff2a00] justify-center items-center w-20 rounded-lg"
    >
      <Ionicons name="trash" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View className="flex-1 flex-col items-center px-2 sm:px-4 my-2">
        <View className="flex flex-row gap-2 sm:gap-3 items-start w-full">
          <View className="flex justify-center items-center flex-row flex-1">
            <View className={`${isSmallScreen ? 'w-[70px] h-[70px]' : 'w-[90px] h-[90px]'} rounded-lg border border-teal-200 flex justify-center items-center p-0.5`}>
              <Image
                source={{ uri: productimage }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>

            <View className="flex justify-center flex-1 ml-2 sm:ml-3 gap-y-1">
              <Text
                className={`font-psemibold ${isSmallScreen ? 'text-base' : 'text-lg'} text-zinc-500`}
                numberOfLines={2}
              >
                {productname}
              </Text>
              <Text
                className={`${isSmallScreen ? 'text-lg' : 'text-xl'} text-zinc-500 font-pregular`}
                numberOfLines={1}
              >
                {productprice}
              </Text>

              {productstock !== undefined && (
                <Text
                  className="text-sm text-zinc-500 font-pregular"
                  numberOfLines={1}
                >
                  Stock: {productstock} pcs
                </Text>
              )}
            </View>
          </View>

          <View className="p-2 ">
            <TouchableOpacity 
              className="p-1"
              onPress={() => {
                router.push(`/editproduct?id=${id}`);
              }}
            >
              <Ionicons
                name="create-outline"
                size={24}
                color="#7c7d7d"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}
