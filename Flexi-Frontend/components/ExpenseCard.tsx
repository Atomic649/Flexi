import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import icons from "@/constants/icons";

const formatDate = (date: string) => {
  return date.replace("T", "   ").replace(/:\d{2}\.\d{3}Z$/, "");
}

export default function ExpenseCard({
  id,
  date,
  expenses,
  type,
  note,
  desc,
  AdsCardColor,
  ExCardColor,
  Opacity,
  NoteColor,
  DescColor,
  onDelete,
}: any) {
  
  const getExpenseTextColor = (type: string) => {
    switch (type) {
      case "ads":
        return "#ffab02";
      case "expense":
        return "#ff2a00";
      default:
        return "#61fff2"; // Default color
    }
  };


  const getCardColor = (type: string) => {
    switch (type) {
      case "ads":
        return AdsCardColor;
      case "expense":
        return ExCardColor;
      default:
        return "#61fff2"; // Default color
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete", "Are you sure you want to delete this report?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(id),
      },
    ]);
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
    <View className="flex " key={id}> {/* Move key prop to the parent View */}
      {/* <Swipeable
      //  renderRightActions={renderRightActions}
       > */}
        <View
          className={`flex flex-col items-center pt-3 pb-4 px-4 pe-16  my-1 rounded-se-md          
        `}
          style={{            
            backgroundColor: getCardColor(type),
          }}
        >
          <View className="flex flex-row gap-3 items-start">
            <View className="flex justify-center items-center flex-row flex-1">
              <View className="flex justify-center flex-1 ml-3 gap-y-1">
                <Text
                  className="text-sm text-zinc-500 font-normal"
                  numberOfLines={1}
                >
                  {formatDate(date)}
                  {/* {date}   */}
                </Text>

                <Text
                  className="text-sm  font-normal"
                  style={{ color: DescColor }}
                  numberOfLines={1}
                >
                  {desc}
                </Text>
                <Text
                  className="text-base  font-psemibold"
                  style={{ color: NoteColor }}
                  numberOfLines={1}
                >
                  {note}
                </Text>
              </View>
            </View>
            <View className="pt-2 flex-row items-center ">
                <Text
                className="text-xl font-bold justify-end"
                style={{ color: getExpenseTextColor(type) }}
                numberOfLines={1}
                >
                -{expenses}
                </Text>
                {type === "expense" && (
                <Image
                  className="absolute top-1 left-14 opacity-20"
                  resizeMode="contain"
                  source={icons.paid}
                  style={{ width: 50, height: 50, marginLeft: -10, opacity: Opacity }}
                />
                )}
            </View>
          </View>
        </View>
      {/* </Swipeable> */}
    </View>
  );
}
