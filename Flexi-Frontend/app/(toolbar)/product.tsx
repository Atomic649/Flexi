import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "@/components/ProductCard";
import CallAPIProduct from "@/api/product_api";
import { IMAGE_URL } from "@/utils/config";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMemberId } from "@/utils/utility";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";

type Product = {
  id: number;
  name: string;
  description: string;
  barcode: string;
  image: string | null;
  stock: number;
  price: number;
  categoryId: number;
  statusId: number;
  memberId: string;
  createAt: string;
  updateAt: string;
};

export default function Home() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const textColorClass = useTextColorClass();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIProduct.getProductsAPI(memberId);
          setProducts(response);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const onRefresh = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIProduct.getProductsAPI(memberId);
        setProducts(response);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setRefreshing(false);
  };

  const getImageUri = (image: string | null) => {
    if (!image) return null;
    return image.startsWith("file://") ? image : IMAGE_URL + image;
    
  };

  const handleDeleteProduct = async (id: number) => {
    Alert.alert("Delete", "Are you sure you want to delete this product?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await CallAPIProduct.deleteProductAPI(id);
            setProducts(products.filter((product) => product.id !== id));
          } catch (error) {
            console.error("Error deleting product:", error);
          }
        },
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              productname={item.name}
              productprice={item.price}
              productstock={item.stock}
              id={item.id}
              productimage={getImageUri(item.image)}
              onDelete={() => handleDeleteProduct(item.id)}
            />
          )}
          ListHeaderComponent={() => (
            <View className="my-6 px-4 ">
              <View className="flex flex-col  mb-5 items-center">
                <CustomText
                  className={`text-sm font-normal ${
                    theme === "dark" ? "text-white" : "text-[#5d5a54]"
                  }`}
                >
                  {t("product.limit")}
                </CustomText>
                <TouchableOpacity onPress={() => router.push("roadmap")}>
                  <Text className={`mt-1 text-base font-bold text-[#FF006E]`}>
                    {t("product.help")}
                  </Text>
                </TouchableOpacity>
              </View>

              <CustomText className={`text-xl font-semibold ${textColorClass}`}>
                {t("product.Products")}
              </CustomText>
            </View>
          )}
          ListEmptyComponent={() => (
            <CustomText className="pt-10 text-center text-white">{t("common.notfound")}</CustomText>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {/* Setting Limit Product "3" */}
        {products.length < 3 && (
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 65,
              right: 30,
              backgroundColor: "#04eccd",
              borderRadius: 50,
              padding: 15,
              elevation: 5,
            }}
            onPress={() => {
              router.push("createproduct");
            }}
          >
            <Ionicons
              name="add"
              size={24}
              color={theme === "dark" ? "#444541" : "#444541"}
            />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
