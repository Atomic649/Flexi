import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
} from "react-native";
import React, { useState, useCallback } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "@/components/CustomAlert";
import { useTranslation } from "react-i18next";
import { CustomText } from "./CustomText";

export default function ProductCard({
  id,
  productname,
  productprice,
  productimage,
  productstock,
  unit,
  producttype,
  onDelete,
}: any) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const { t } = useTranslation();

  // Add alert config state
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

  const handleDelete = useCallback(() => {
    setAlertConfig({
      visible: true,
      title: t("product.deleteAlert.title") || "Delete Product",
      message:
        t("product.deleteAlert.message") ||
        "Are you sure you want to delete this product?",
      buttons: [
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: () => {
            setAlertConfig((prev) => ({ ...prev, visible: false }));
            onDelete(id);
          },
        },
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
          onPress: () =>
            setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
      ],
    });
  }, [t, onDelete, id]);

  return (
    <>
      <View className="p-2">
        <Pressable
          android_ripple={{ color: "#e0f7fa" }}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.85 : 1,
            },
          // Tailwind classes
          {
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            paddingHorizontal: isSmallScreen ? 8 : 16,             
            marginVertical: 8,
          },
        ]}
        onPress={() => {
          router.push(`/editproduct?id=${id}`);
        }}
      >
        <View className="flex flex-row gap-2 sm:gap-3 items-start w-full">
          <View className="flex justify-center items-center flex-row flex-1">
            <View
              className={`${
                isSmallScreen ? "w-[70px] h-[70px]" : "w-[90px] h-[90px]"
              } rounded-lg border border-teal-200 flex justify-center items-center p-0.5`}
            >
              <Image
                source={{ uri: productimage }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>

            <View className="flex justify-center flex-1 ml-2 sm:ml-3 gap-y-1 px-2">
              <CustomText
                className={`font-psemibold ${
                  isSmallScreen ? "text-base" : "text-lg"
                }`}
                style={{ color: "#71717a" }}
                numberOfLines={2}
              >
                {productname}
              </CustomText>
              <Text
                className={`${
                  isSmallScreen ? "text-lg" : "text-xl"
                } text-zinc-500 font-bold`}
                numberOfLines={1}
              >
                {productprice}
              </Text>

              {producttype === "Product" && (
                <Text
                  className="text-sm text-zinc-500 font-pregular"
                  numberOfLines={1}
                >
                  Stock: {productstock ?? 0} {unit ? `${unit}` : ""}
                </Text>
              )}
            </View>
          </View>
          
          {/* Delete Icon */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            style={{
              padding: 8,
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </Pressable>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
