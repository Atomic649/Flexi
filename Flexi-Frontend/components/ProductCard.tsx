import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
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
      <View className="flex flex-col items-center px-4 my-2">
        <View className="flex flex-row gap-3 items-start">
          <View className="flex justify-center items-center flex-row flex-1">
            <View className="w-[90px] h-[90px] rounded-lg border border-teal-200 flex justify-center items-center p-0.5">
              <Image
                source={{ uri: productimage }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>

            <View className="flex justify-center flex-1 ml-3 gap-y-1">
              <Text
                className="font-psemibold text-lg text-zinc-500"
                numberOfLines={3}
              >
                {productname}
              </Text>
              <Text
                className="text-xl text-zinc-500 font-pregular"
                numberOfLines={1}
              >
                {productprice}
              </Text>

              {/* <Text
                className="text-base text-teal-300 font-pregular text-right px-5"
                numberOfLines={1}
              >
                {productstock}
                 pcs
              </Text> */}
            </View>
          </View>

          <View className="pt-2">
            <TouchableOpacity onPress={() => {
              router.push(`editproduct?id=${id}`);
            }}>
              <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}
