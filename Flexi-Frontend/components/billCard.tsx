import { View, Text, Image, TouchableOpacity, Alert, Platform, Linking } from "react-native";
import React from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";
import { router } from "expo-router";

const formatDate = (dateString: string) => {
  const parsedDate = new Date(dateString);
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();
  
  // Get hours in 12-hour format
  let hours = parsedDate.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Get minutes
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
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
  onDelete,
  getBorderColor,
  unit
}: any) {

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


  return (
    <View className="flex "
     style={{      
            width: Platform.OS === "web" ? "100%" : "100%",
            maxWidth: 500,
            minWidth: 350,
            alignSelf: "center",
          }}>
      
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

                <Text
                  className="text-base  "
                  style={{ color: cNameColor }}
                  numberOfLines={1}
                >
                  {cName} {cLastName}
                </Text>
                <Text
                  className="font-bold text-sm text-zinc-400"
                  numberOfLines={3}
                  style={{ color: "#7e7d7a" }} // Replace "gray" with your desired color
                >
                  {product} {amount} {t(`product.units.${unit.toLowerCase()}`) || unit}
                </Text>
              </View>          
            <View className="pt-2 flex flex-col items-end">
                <Text
                className="text-xl font-bold justify-end"
                style={{ color: PriceColor }}
                numberOfLines={1}
                >
                + {price}
                </Text>
           
        
            </View>
          </View>
        </View>
    
    </View>
  );
}
