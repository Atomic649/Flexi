import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options); // Change 'en-US' to desired locale
};

export default function BillCard({
  id,
  cName,
  cLastName,
  cPhone,
  cGender,
  cAddress,
  cPostId,
  cProvince,
  product,
  payment,
  amount,
  platform,
  cashStatus,
  price,
  memberId,
  purchaseAt,
  businessAcc,
  image,
  storeId,
  CardColor,
  PriceColor,
  cNameColor,
  ProductNameColor ,
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
    <View className="flex ">
      {/* <Swipeable renderLeftActions={renderRightActions}> */}
        <View
          className={`flex flex-col items-center pt-3 pb-4 px-4 pe-12  my-1 rounded-se-md          
         border-r-4 `}
          style={{
            borderColor: getBorderColor(platform),
            backgroundColor: CardColor,
          }}
        >
          <View className="flex flex-row gap-3 items-start">
            <View className="flex justify-center items-center flex-row flex-1">
              <View className="flex justify-center flex-1 ml-3 gap-y-1">
                <Text
                  className="text-sm text-zinc-500 font-normal"
                  numberOfLines={1}
                >
                  {formatDate(purchaseAt)}
                </Text>

                <Text
                  className="text-lg  font-psemibold"
                  style={{ color: cNameColor }}
                  numberOfLines={1}
                >
                  {cName} {cLastName}
                </Text>
                <Text
                  className="font-bold text-sm text-zinc-400"
                  numberOfLines={3}
                  style={{ color: ProductNameColor }}
                >
                  {product} {amount} {t("common.pcs") }
                </Text>
              </View>
            </View>
            <View className="pt-2">
                <Text
                className="text-xl font-bold justify-end"
                style={{ color: PriceColor }}
                numberOfLines={1}
                >
                + {price}
                </Text>
              {/* <TouchableOpacity
          onPress={() => {
            router.push(`editads?id=${id}`);
          }}
              >
          <Ionicons
            name="options"
            color={color}
            size={22}
          ></Ionicons>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      {/* </Swipeable> */}
    </View>
  );
}
