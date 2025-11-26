import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CustomText } from "./CustomText";
import { useTheme } from "@/providers/ThemeProvider";

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
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

const formatNumber = (number: number | string) => {
  const num = typeof number === "string" ? parseFloat(number) : number;
  return num.toLocaleString("en-US");
};

export default function ExpenseCard({
  id,
  date,
  expenses,
  type,
  note,
  desc,
  sName,
  image,
  AdsCardColor,
  ExCardColor,
  Opacity,
  NoteColor,
  DescColor,
  onDelete,
  bgExpenseDetail,
  titleColor,
}: any) {
  const [detailVisible, setDetailVisible] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const getExpenseTextColor = (type: string) => {
    switch (type) {
      case "ads":
        return "#ff2a0085";
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

  const handleEdit = () => {
    Alert.alert(
      "Not available",
      "Coming Soon, Please Delete and create new expense",
      []
    );
  };

  return (
    <>
      <View
        className="flex"
        style={{
          width: Platform.OS === "web" ? "100%" : "100%",
          maxWidth: 500,
          minWidth: 350,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (type === "expense") {
              router.push({
                pathname: "/expenseDetailScreen",
                params: {
                  id,
                  date,
                  expenses,
                  note,
                  desc,
                  image,
                  type,
                },
              });
            } else {
              // setDetailVisible(true);
            }
          }}
        >
          <View
            className={`flex flex-col pt-3 pb-4 px-4 pe-16 my-1 rounded-se-md`}
            style={{
              backgroundColor: getCardColor(type),
            }}
          >
            <View className="flex flex-row gap-3 items-center">
              <View className="flex justify-center items-center flex-row flex-1">
                <View className="flex justify-center flex-1 ml-3 ">
                  <Text
                    className="text-sm text-zinc-500 font-normal"
                    numberOfLines={1}
                  >
                    {formatDate(date)}
                  </Text>
                  <CustomText
                    className="text-sm font-normal pt-2"
                    style={{ color: DescColor }}
                    numberOfLines={1}
                  >
                    {type === "ads" ? note : sName || desc}
                  </CustomText>
                  <CustomText
                    className="text-base font-psemibold pt-1"
                    weight="semibold"
                    style={{ color: NoteColor }}
                    numberOfLines={1}
                  >
                    {type === "ads" ? "คาดการณ์ค่าโฆษณา" : note}
                  </CustomText>
                </View>
              </View>
              <View className="flex-colum items-end">
                <Text
                  className="text-xl font-bold justify-end"
                  style={{ color: getExpenseTextColor(type) }}
                  numberOfLines={1}
                >
                  -{formatNumber(expenses)}
                </Text>

                <Ionicons
                  className="text-end mt-2 justify-end"
                  name="document-text-outline"
                  size={16}
                  color={
                    !image
                      ? theme === "dark"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(103, 103, 103, 0.3)"
                      : theme === "dark"
                      ? "white"
                      : "#676767"
                  }
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ExpenseDetail Modal for ads */}
      {detailVisible && (
        <Modal
          visible={detailVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setDetailVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: bgExpenseDetail,
            }}
            activeOpacity={1}
            onPressOut={() => setDetailVisible(false)} // Close modal on tap outside
          >
            <View
              style={{
                flex: 1,
                backgroundColor: getCardColor(type),
                borderRadius: 10,
                width: Platform.OS === "web" ? "50%" : "90%",
                maxHeight: image ? "75%" : "23%",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              {/* image view */}
              {image && (
                <Image
                  source={{ uri: image }}
                  style={{
                    width: "100%",
                    height: "70%",
                  }}
                  resizeMode="cover"
                />
              )}
              <View
                style={{
                  padding: 10,
                  borderRadius: 10,
                  width: Platform.OS === "web" ? "60%" : "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: getExpenseTextColor(type),
                    fontSize: 24,
                    fontWeight: "bold",
                    padding: 10,
                  }}
                  numberOfLines={1}
                >
                  {formatNumber(expenses)}
                </Text>
                <Text
                  style={{
                    color: titleColor,
                    fontSize: 14,
                    fontWeight: "normal",
                  }}
                  numberOfLines={1}
                >
                  {formatDate(date)}
                </Text>

                <Text
                  style={{
                    color: DescColor,
                    fontSize: 14,
                    fontWeight: "normal",
                  }}
                  numberOfLines={1}
                >
                  {type === "ads" ? note : desc}
                </Text>
                <Text
                  style={{
                    color: NoteColor,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                  numberOfLines={1}
                >
                  {type === "ads" ? "คาดการณ์ค่าโฆษณา" : note}
                </Text>
                <Text
                  style={{
                    color: DescColor,
                    fontSize: 16,
                    fontWeight: "normal",
                  }}
                  numberOfLines={1}
                >
                  {type}
                </Text>
                {/* Icon Command */}
                <View className="w-full flex-row  justify-between pt-2 px-6">
                  <TouchableOpacity onPress={handleDelete}>
                    <Ionicons
                      name="trash"
                      size={26}
                      color="#999999"
                      className="p-2"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleEdit}>
                    <Ionicons
                      name="pencil"
                      size={26}
                      color="#999999"
                      className="p-2"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}


