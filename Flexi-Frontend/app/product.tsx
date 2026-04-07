import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "@/components/ProductCard";
import CallAPIProduct from "@/api/product_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMemberId } from "@/utils/utility";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import CustomAlert from "@/components/CustomAlert";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  image: string | null;
  productType: string;
};

export default function Home() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [] as any[],
  });

  const isDark = theme === "dark";

  const fetchProducts = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIProduct.getProductsAPI(memberId);
        setProducts(response);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleDeleteProduct = (id: number) => {
    setAlertConfig({
      visible: true,
      title: t("product.deleteAlert.title") || "Delete Item",
      message: t("product.deleteAlert.message") || "Are you sure you want to delete this?",
      buttons: [
        { text: t("common.cancel"), style: "cancel", onPress: () => setAlertConfig(p => ({ ...p, visible: false })) },
        { 
          text: t("common.delete"), 
          style: "destructive", 
          onPress: async () => {
            await CallAPIProduct.deleteProductAPI(id);
            setProducts(products.filter(p => p.id !== id));
            setAlertConfig(p => ({ ...p, visible: false }));
          } 
        },
      ],
    });
  };

  const renderListItem = (item: Product, index: number) => (
    <TouchableOpacity
      style={[styles.listRow, { borderBottomColor: isDark ? "#222" : "#f0f0f0" }]}
      activeOpacity={0.7}
      onPress={() => router.push(`/editproduct?id=${item.id}`)}
    >
      {/* Running Number */}
      <View style={styles.indexContainer}>
        <CustomText style={styles.indexText}>
          {(index + 1).toString().padStart(2, '0')}
        </CustomText>
      </View>

      <View style={{ flex: 1 }}>
        <CustomText style={styles.listName}>{item.name}</CustomText>
        <CustomText style={styles.listSubtext}>{item.stock} {t(`product.unit.${item.unit}`)}</CustomText>
      </View>

      <View style={{ alignItems: "flex-end", marginRight: 15 }}>
        <CustomText style={styles.listPrice}>฿{item.price.toLocaleString()}</CustomText>
      </View>

      <TouchableOpacity onPress={() => handleDeleteProduct(item.id)} hitSlop={15}>
        <Ionicons name="trash-outline" size={18} color={isDark ? "#444" : "#ccc"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className={`flex-1 ${useBackgroundColorClass()}`}>
      <View style={styles.container}>
        
        {/* Minimal Header Switcher */}
        <View style={styles.header}>
          <View style={[styles.switcher, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" }]}>
            <TouchableOpacity 
              onPress={() => setViewMode("grid")}
              style={[styles.switchBtn, viewMode === "grid" && styles.switchActive]}
            >
              <Ionicons name="grid" size={14} color={viewMode === "grid" ? "#000" : "#888"} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setViewMode("list")}
              style={[styles.switchBtn, viewMode === "list" && styles.switchActive]}
            >
              <Ionicons name="list" size={14} color={viewMode === "list" ? "#000" : "#888"} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={products}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // Key prop forces re-render when switching layouts
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          columnWrapperStyle={viewMode === "grid" ? { justifyContent: 'space-between' } : null}
          renderItem={({ item, index }) => (
            viewMode === "grid" ? (
              <ProductCard 
                id={item.id}
                productname={item.name} 
                productprice={item.price} 
                productstock={item.stock} 
                productimage={item.image} 
                unit={item.unit}
                onDelete={() => handleDeleteProduct(item.id)}
              />
            ) : renderListItem(item, index)
          )}
          ListEmptyComponent={<CustomText style={styles.emptyText}>{t("common.notfound")}</CustomText>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#04eccd" />}
        />
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.fab} onPress={() => router.push("/createproduct")}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      <CustomAlert {...alertConfig} onClose={() => setAlertConfig(p => ({ ...p, visible: false }))} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, alignSelf: "center", width: "100%", maxWidth: 600 },
  header: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 12, marginBottom: 8 },
  switcher: { flexDirection: "row", borderRadius: 20, padding: 2 },
  switchBtn: { paddingVertical: 5, paddingHorizontal: 15, borderRadius: 18 },
  switchActive: { backgroundColor: "#04eccd" },
  
  // List Styles
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  indexContainer: { width: 30, marginRight: 8 },
  indexText: { fontSize: 11, fontWeight: "700", opacity: 0.3 },
  listName: { fontSize: 15, fontWeight: "500", letterSpacing: -0.3 },
  listSubtext: { fontSize: 12, opacity: 0.4 },
  listPrice: { fontSize: 15, fontWeight: "600", color: "#04eccd" },
  
  emptyText: { textAlign: "center", marginTop: 60, opacity: 0.3 },
  fab: { 
    position: "absolute", 
    bottom: 30, 
    right: 25, 
    backgroundColor: "#04eccd", 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
});