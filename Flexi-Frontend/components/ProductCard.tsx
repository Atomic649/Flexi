import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "./CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  id: string | number;
  productname: string;
  productprice: number;
  productstock: number;
  unit: string;
  productimage: string | null;
  onDelete: () => void;
}

export default function ProductCard({
  id,
  productname,
  productprice,
  productstock,
  unit,
  productimage,
  onDelete,
}: ProductCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: isDark ? "#1a1a1a" : "#ffffff" }]} 
    activeOpacity={0.8}
    onPress={() => router.push(`/editproduct?id=${id}`)}>
      <View style={[styles.imageContainer, { backgroundColor: isDark ? "#222" : "#f9f9f9" }]}>
        {productimage ? (
          <Image source={{ uri: productimage }} style={styles.image} />
        ) : (
          <Ionicons name="cube-outline" size={28} color={isDark ? "#333" : "#ddd"} />
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="close" size={14} color="#ff4d4d" />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <CustomText numberOfLines={1} style={styles.name}>{productname}</CustomText>
        <View style={styles.footer}>
          <CustomText style={styles.price}>฿{productprice}</CustomText>
          <CustomText style={styles.stock}>{productstock} {t(`product.unit.${unit}`)}</CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.1)",
    overflow: "hidden",
  },
  imageContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.8)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { padding: 10 },
  name: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 14, fontWeight: "700", color: "#04eccd" },
  stock: { fontSize: 10, opacity: 0.4 },
});