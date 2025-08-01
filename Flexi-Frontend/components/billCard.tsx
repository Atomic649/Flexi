import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from "react-native";
import React from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";
import { router } from "expo-router";
import { CustomText } from "./CustomText";

const formatDate = (dateString: string) => {
  const parsedDate = new Date(dateString);
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  // Get hours in 12-hour format
  let hours = parsedDate.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Get minutes
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

export default function BillCard({
  id,
  cName,
  cLastName,
  product = [], // Expecting array of { product, quantity, unitPrice }
  total,
  purchaseAt,
  CardColor,
  PriceColor,
  cNameColor,
  onDelete,
  getBorderColor,
  unit,
}: any) {

  return (
    <View
      className="flex "
      style={{
        width: Platform.OS === "web" ? "100%" : "100%",
        maxWidth: 500,
        minWidth: 350,
        alignSelf: "center",
      }}
    >
      <View
        className={`flex flex-col items-center pt-3 pb-4 px-4 pe-12  my-1 rounded-se-md          
         border-r-4 `}
        style={{
          borderColor: getBorderColor,
          backgroundColor: CardColor,
        }}
      >
        <View className="flex flex-row items-between w-full">
          <View className="flex  flex-1 ml-3 gap-y-1">
            <Text
              className="text-sm text-zinc-500 font-normal"
              numberOfLines={1}
            >
              {formatDate(purchaseAt)}
            </Text>
            <View className="flex-row gap-2">
              <CustomText
                className="text-base  "
                weight="semibold"
                style={{ color: cNameColor }}
                numberOfLines={1}
              >
                {cName}
              </CustomText>
              <CustomText
                className="text-base  "
                weight="semibold"
                style={{ color: cNameColor }}
                numberOfLines={1}
              >
                {cLastName}
              </CustomText>
            </View>
            {/* Render all products */}
            <View className="flex-col gap-y-1 ">
              {Array.isArray(product) && product.length > 0 ? (
                product.map((item: any, idx: number) => (
                  <View key={idx} className="flex-row gap-x-2 items-center">
                    <CustomText
                      className="font-bold text-sm text-zinc-400 pt-1"
                      numberOfLines={1}
                      style={{ color: "#7e7d7a" }}
                    >
                      {item.product}
                    </CustomText>
                  
                    <CustomText
                      className="font-bold text-sm text-zinc-400 pt-1"
                      numberOfLines={1}
                      style={{ color: "#7e7d7a" }}
                    >
                      {item.quantity}
                    </CustomText>
                    {item.unit && (
                      <CustomText
                        className="font-bold text-sm text-zinc-400 pt-1"
                        numberOfLines={1}
                        style={{ color: "#7e7d7a" }}
                      >
                        {t(`product.unit.${item.unit}`) || item.unit}
                      </CustomText>
                    )}
                  </View>
                ))
              ) : (
                <CustomText className="font-bold text-sm text-zinc-400" style={{ color: "#7e7d7a" }}>
                  -
                </CustomText>
              )}
            </View>
          </View>
          <View className="pt-2 flex flex-col items-end">
            <Text
              className="text-xl font-bold justify-end"
              style={{ color: PriceColor }}
              numberOfLines={1}
            >
              + {total}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
