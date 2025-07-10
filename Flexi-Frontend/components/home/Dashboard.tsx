import { useState, useEffect } from "react";
import {
  ScrollView,
  Dimensions,
  SafeAreaView,
  View,
  TouchableOpacity,
  Modal,
  Platform,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { isDesktop, isMobile } from "@/utils/responsive";
import { getMemberId } from "@/utils/utility";
import CallAPIProduct from "@/api/product_api";
import CallAPIStore from "@/api/store_api";
import { format } from "date-fns";
import Dropdown2 from "@/components/Dropdown2";
import Expense from "../../app/(tabs)/expense";
import Dropdown3 from "../Dropdown3";

// Format currency
const formatCurrency = (amount: number) => {
  return (
    new Intl.NumberFormat("th-TH", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " THB"
  );
};

// Metric Card Component
type MetricCardProps = {
  title: string;
  value: string | number; // Allow both string and number for flexibility
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MetricCard = ({ title, value, color, icon }: MetricCardProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme === "dark" ? "#27272a" : "#eeedecb3",
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 4,
        flex: 1,
        minHeight: 110,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CustomText
          className="text-sm opacity-70"
          style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
        >
          {title}
        </CustomText>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <CustomText
        weight="bold"
        className="text-2xl mt-4"
        style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
      >
        {value}
      </CustomText>
    </View>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for metrics (replace with actual API data)
  const metrics = {
    income: formatCurrency(100000),
    expense: formatCurrency(50000),
    profitloss: formatCurrency(50000),
    orders: 120,
    conversion: 75, // Example conversion rate
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const memberId = await getMemberId();
      if (memberId) {
        // Fetch products
        const productResponse = await CallAPIProduct.getProductChoiceAPI(
          memberId
        );
        setProducts(productResponse || []);

        // Fetch stores
        const storeResponse = await CallAPIStore.getStoresAPI(memberId);
        setStores(storeResponse || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };




  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    setCalendarVisible(false);
  };

  const formatDateRange = () => {
    if (selectedDates.length > 1) {
      return `${format(new Date(selectedDates[0]), "dd/MM/yyyy")} - ${format(
        new Date(selectedDates[selectedDates.length - 1]),
        "dd/MM/yyyy"
      )}`;
    } else if (selectedDates.length === 1) {
      return format(new Date(selectedDates[0]), "dd/MM/yyyy");
    } else {
      return t("dashboard.selectDate");
    }
  };

  // Format products and stores data for dropdown
  const productOptions = products.map((product) => ({
    label: product.name,
    value: product.name,
  }));

  const storeOptions = stores.map((store) => ({
    label: store.name,
    value: store.name,
  }));

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          activeOpacity={1}
          onPress={() => setCalendarVisible(false)}
        >
          <View
            style={{
              width: isMobile() ? "90%" : "40%",
              minWidth: 300,
              maxWidth: 500,
              backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <MultiDateCalendar onDatesChange={handleDatesChange} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content */}
      <ScrollView>
        <View
          style={{
            maxWidth: isDesktop() ? 1000 : "100%",
            width: "100%",
            paddingHorizontal: 16,
            alignSelf: "center",
            marginTop: Platform.OS === "web" ? 80 : 10,
          }}
        >
          {/* Header and Time Period Selection */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingTop: 5,
            }}
          >
            {/* Time period buttons and date selection - 30/30/40 split */}
            <TouchableOpacity
              style={{
                backgroundColor: theme === "dark" ? "#3f3f46" : "#f4f4f5",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 12,
                flex: 3, // 30%
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <CustomText
                weight="bold"
                style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e",
                    fontSize: 12
                 }}
              >
                {t("dashboard.thisDay")}
              </CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: theme === "dark" ? "#27272a" : "#eeedecb3",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 12,
                flex: 3, // 30% 
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <CustomText
                weight="bold"
                style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e",
                    fontSize: 12
                }}
              >
                {t("dashboard.thisMonth")}
              </CustomText>
            </TouchableOpacity>

            {/* Calendar date picker */}
            <TouchableOpacity
              onPress={() => setCalendarVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme === "dark" ? "#27272a" : "#eeedecb3",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 12,
                flex: 4, // 40%
              }}
            >
              <CustomText className="mr-2">{formatDateRange()}</CustomText>
              <Ionicons
                name="calendar"
                size={20}
                color={theme === "dark" ? "#c9c9c9" : "#48453e"}
              />
            </TouchableOpacity>
          </View>

          {/* Filters Section - Using Dropdown2 */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {/* Product Filter */}
            <View
              style={{
                flex: 1,
                minWidth: 150,
                marginRight: 8,
                marginBottom: 0,
              }}
            >
              <Dropdown3
                //title={t("dashboard.filter.product")}
                options={productOptions}
                placeholder={t("dashboard.filter.chooseProduct")}
                selectedValue={selectedProduct}
                onValueChange={(value: string) => setSelectedProduct(value)}
                bgColor={theme === "dark" ? "#27272a" : "#eeedecb3"}
                bgChoiceColor={theme === "dark" ? "#27272a" : "#eeedecb3"}
                textcolor={theme === "dark" ? "#ffffff" : "#48453e"}
              />
            </View>

            {/* Store Filter */}
            <View
              style={{
                flex: 1,
                minWidth: 150,
              }}
            >
              <Dropdown3
                //title={t("dashboard.filter.store")}
                options={storeOptions}
                placeholder={t("dashboard.filter.chooseStore")}
                selectedValue={selectedStore}
                onValueChange={(value: string) => setSelectedStore(value)}
                bgColor={theme === "dark" ? "#27272a" : "#eeedecb3"}
                bgChoiceColor={theme === "dark" ? "#27272a" : "#eeedecb3"}
                textcolor={theme === "dark" ? "#ffffff" : "#48453e"}
              />
            </View>
          </View>

          {isLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 64,
              }}
            >
              <ActivityIndicator
                size="large"
                color={theme === "dark" ? "#a78bfa" : "#8b5cf6"}
              />
            </View>
          ) : (
            <>
              {/* Summary Statistics */}
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: isDesktop() ? "row" : "column",
                    marginBottom: 8,
                  }}
                >
                  <MetricCard
                    title={t("dashboard.metrics.income")}
                    value={metrics.income}
                    icon="stats-chart"
                    color={theme === "dark" ? "#02c796" : "#02c796"}
                  />
                  <MetricCard
                    title={t("dashboard.metrics.expense")}
                    value={metrics.expense}
                    icon="cash-outline"
                    color={theme === "dark" ? "#ffb30e" : "#ffb30e"}
                  />
                </View>
                <View style={{ flexDirection: isDesktop() ? "row" : "column" }}>
                  <MetricCard
                    title={t("dashboard.metrics.profitloss")}
                    value={metrics.profitloss}
                    icon="trending-up"
                    color={theme === "dark" ? "#fb7185" : "#f43f5e"}
                  />
                  <MetricCard
                    title={t("dashboard.metrics.orders")}
                    value={metrics.orders}
                    icon="document-text-outline"
                    color={theme === "dark" ? "#a78bfa" : "#8b5cf6"}
                  />
                </View>
              </View>

              {/* Sales Chart */}
              <View
                style={{
                  backgroundColor: theme === "dark" ? "#27272a" : "#eeedecb3",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
                  // shadowColor: "#000",
                  // shadowOffset: { width: 0, height: 2 },
                  // shadowOpacity: 0.1,
                  // shadowRadius: 4,
                  // elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    name="bar-chart"
                    size={20}
                    color={theme === "dark" ? "#a78bfa" : "#8b5cf6"}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText weight="bold" className="text-lg">
                    {t("dashboard.salesChart.title")}
                  </CustomText>
                </View>

                <View
                  style={{
                    minHeight: 250,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme === "dark" ? "#3f3f42" : "#ffffff",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <Ionicons
                    name="bar-chart-outline"
                    size={48}
                    color={theme === "dark" ? "#3f3f42" : "#e5e7eb"}
                  />
                  <CustomText className="mt-4 opacity-50">
                    {t("dashboard.salesChart.noData")}
                  </CustomText>
                </View>
              </View>

              {/* Top Products */}
              <View
                style={{
                  backgroundColor: theme === "dark" ? "#27272a" : "#eeedecb3",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
                  // shadowColor: "#000",
                  // shadowOffset: { width: 0, height: 2 },
                  // shadowOpacity: 0.1,
                  // shadowRadius: 4,
                  // elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    name="list"
                    size={20}
                    color={theme === "dark" ? "#02c796" : "#02c796"}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText weight="bold" className="text-lg">
                    {t("dashboard.topProducts.title")}
                  </CustomText>
                  <View
                    style={{
                      backgroundColor: theme === "dark" ? "#3f3f42" : "#ffffff",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 12,
                      marginLeft: 8,
                    }}
                  >
                    <CustomText weight="bold" className="text-sm">
                      0
                    </CustomText>
                  </View>
                </View>

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 40,
                  }}
                >
                  <Ionicons
                    name="cube-outline"
                    size={48}
                    color={theme === "dark" ? "#3f3f42" : "#e5e7eb"}
                  />
                  <CustomText className="mt-4 opacity-50">
                    {t("dashboard.topProducts.noData")}
                  </CustomText>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
