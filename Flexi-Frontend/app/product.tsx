import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "@/components/ProductCard";
import CallAPIProduct from "@/api/product_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMemberId } from "@/utils/utility";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import CustomAlert from "@/components/CustomAlert";

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
  unit: string;
  productType: string; // Assuming productType is a string, adjust if it's an enum
};

export default function Home() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleDeleteProduct = async (id: number) => {
    setAlertConfig({
      visible: true,
      title: t("product.deleteAlert.title") || "Delete",
      message: t("product.deleteAlert.message") || "Are you sure you want to delete this product?",
      buttons: [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await CallAPIProduct.deleteProductAPI(id);
              setProducts(products.filter((product) => product.id !== id));
              setAlertConfig((prev) => ({ ...prev, visible: false }));
            } catch (error) {
              console.error("Error deleting product:", error);
              setAlertConfig({
                visible: true,
                title: t("product.deleteAlert.error") || "Error",
                message: String(error),
                buttons: [
                  {
                    text: t("common.ok") || "OK",
                    onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
                  },
                ],
              });
            }
          },
        },
      ],
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        className={`h-full ${useBackgroundColorClass()}`}
        style={{
          flex: 1,
          paddingHorizontal: 16,
          alignItems: "center", // Center horizontally
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: Dimensions.get("window").width > 768 ? "50%" : "100%",
            alignSelf: "center", // Ensure centering
          }}
        >
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ProductCard
                productname={item.name}
                productprice={item.price}
                productstock={item.stock}
                unit={item.unit}
                producttype={item.productType}
                id={item.id}
                productimage={item.image}
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
                  <TouchableOpacity onPress={() => router.push("/roadmap")}>
                    <Text className={`mt-1 text-base font-bold text-[#FF006E]`}>
                      {t("product.help")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* <CustomText className={`text-xl font-semibold ${textColorClass}`}>
                {t("product.Products")}
              </CustomText> */}
              </View>
            )}
            ListEmptyComponent={() => (
              <CustomText className="pt-10 text-center text-white">
                {t("common.notfound")}
              </CustomText>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>

        {/* Footer */}
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
              router.push("/createproduct");
            }}
          >
            <Ionicons
              name="add"
              size={24}
              color={theme === "dark" ? "#444541" : "#444541"}
            />
          </TouchableOpacity>
        )}

        {/* Add CustomAlert component */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
