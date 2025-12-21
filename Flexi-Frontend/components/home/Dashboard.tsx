import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { isDesktop, isMobile } from "@/utils/responsive";
import { getMemberId } from "@/utils/utility";
import CallAPIProduct from "@/api/product_api";
import CallAPIStore from "@/api/store_api";
import CallDashboardAPI from "@/api/dashboard_api";
import { format } from "date-fns";
import Dropdown3 from "../dropdown/Dropdown3";
import { Text } from "react-native";
import { getResponsiveStyles } from "@/utils/responsive";
import LinearChart from "@/components/LinearChart";

const styles = getResponsiveStyles();
const { headerFontSize } = styles;

// Format currency
const formatCurrency = (amount: number) => {
  return (
    new Intl.NumberFormat("th-TH", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " ฿"
  );
};

// Metric Card Component
type MetricCardProps = {
  title: string;
  value: string | number; // Allow both string and number for flexibility
  icon: keyof typeof Ionicons.glyphMap;
  flex?: number; // Add flex prop instead of width for better control
  valueColor?: string; // Add optional color prop for the value
};

const MetricCard = ({
  title,
  value,
  icon,
  flex = 1,
  valueColor,
}: MetricCardProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 4,
        flex: flex,
        minHeight: 110,
        borderWidth: 1,
        borderColor: theme === "dark" ? "#3f3f42" : "#e5e7eb",
        shadowColor: theme === "dark" ? "#000" : "#ccc",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
          className="text-sm opacity-70 pt-1"
          style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
        >
          {title}
        </CustomText>
        <Ionicons
          name={icon}
          size={22}
          color={theme === "dark" ? "#fff" : "#75726a"}
        />
      </View>
      <Text
        style={{
          fontSize: headerFontSize,
          fontWeight: "bold",
          color: valueColor || (theme === "dark" ? "#ffffff" : "#3c3c3c"),
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
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
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "thisMonth" | "custom"
  >("thisMonth");

  // Dashboard data state
  const [metrics, setMetrics] = useState({
    profitloss: 0,
    income: 0,
    expense: 0,
    orders: 0,
    adscost: 0,
  });
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topStores, setTopStores] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Fetch dashboard data when filters change
    fetchDashboardData();
  }, [selectedDates, selectedProduct, selectedStore, selectedPeriod]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const memberId = await getMemberId();
      console.log("Member ID:", memberId);
      if (memberId) {
        // Fetch products and stores for filters
        const [productResponse, storeResponse] = await Promise.all([
          CallAPIProduct.getProductChoiceAPI(memberId),
          CallAPIStore.getStoresAPI(memberId),
        ]);

        setProducts(productResponse || []);
        setStores(storeResponse || []);

        // Fetch initial dashboard data
        await fetchDashboardData();
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const memberId = await getMemberId();
      console.log("Fetching dashboard data for member ID:", memberId);
      if (!memberId) return;

      // Build filters for API calls
      const filters: any = {
        memberId,
        period: selectedPeriod,
      };

      // Add date range if custom period and dates are selected
      if (selectedPeriod === "custom" && selectedDates.length > 0) {
        filters.startDate = selectedDates[0];
        filters.endDate = selectedDates[selectedDates.length - 1];
        // Ensure we set the period to 'custom' when dates are selected
        filters.period = "custom";

        // If only one date selected, use it as both start and end date
        if (selectedDates.length === 1) {
          filters.endDate = selectedDates[0];
        }
      }

      // Add product filter if selected
      if (selectedProduct) {
        filters.productName = selectedProduct;
      }

      // Add store filter if selected
      if (selectedStore) {
        const store = stores.find((s) => s.accName === selectedStore);
        if (store) {
          filters.storeId = store.id;
        }
      }

      console.log("📊 Dashboard API Filters:", filters);

      // Fetch all dashboard data in parallel
      const [metricsData, chartData, productsData, storesData] =
        await Promise.all([
          CallDashboardAPI.getDashboardMetricsAPI(filters),
          CallDashboardAPI.getSalesChartDataAPI(filters),
          CallDashboardAPI.getTopProductsAPI({ ...filters, limit: 5 }),
          CallDashboardAPI.getTopStoresAPI({ ...filters, limit: 5 }),
        ]);

      // Update state with fetched data
      setMetrics({
        income: metricsData.income || 0,
        expense: metricsData.expense || 0,
        profitloss: metricsData.profitloss || 0,
        orders: metricsData.orders || 0,
        adscost: metricsData.adscost || 0,
      });

      setSalesChartData(chartData || []);
      setTopProducts(productsData || []);
      setTopStores(storesData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Keep existing data on error
    }
  };

  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    //setCalendarVisible(false); // Optionally close calendar after selection
    if (dates.length > 0) {
      setSelectedPeriod("custom");
      console.log("Selected dates:", dates);
    }
  };

  const handlePeriodChange = (period: "today" | "thisMonth") => {
    setSelectedPeriod(period);
    setSelectedDates([]); // Clear custom dates when selecting predefined period
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
    label: store.accName || "No Name",
    value: store.accName || "No Name",
  }));

  return (
    <View className={`h-full ${useBackgroundColorClass()}`}>
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
            maxWidth: 1200,
            width: isDesktop() ? "60%" : "100%",
            paddingHorizontal: 16,
            alignSelf: "center",
            marginTop: Platform.OS === "web" ? 80 : 10,
          }}
        >
          <View
            style={{
              backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
              borderColor: theme === "dark" ? "#3f3f42" : "#e5e7eb",
              borderWidth: 1,
              borderRadius: 16,
              padding: 8,
              marginBottom: 12,

              shadowColor: theme === "dark" ? "#000" : "#ccc",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            {/* Header and Time Period Selection */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {/* Time period buttons and date selection - 30/30/40 split */}
              <TouchableOpacity
                onPress={() => handlePeriodChange("today")}
                activeOpacity={1}
                style={{
                  backgroundColor:
                    selectedPeriod === "today"
                      ? theme === "dark"
                        ? "#474747"
                        : "#e3e3e3"
                      : theme === "dark"
                      ? "#27272a"
                      : "#f4f4f5",
                  paddingVertical: 9,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  flex: 3, // 30%
                  marginRight: 8,
                  alignItems: "center",
                }}
              >
                <CustomText
                  weight="bold"
                  style={{
                    color: theme === "dark" ? "#c9c9c9" : "#48453e",
                    fontSize: getResponsiveStyles().bodyFontSize,
                  }}
                >
                  {t("dashboard.today")}
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePeriodChange("thisMonth")}
                activeOpacity={1}
                style={{
                  backgroundColor:
                    selectedPeriod === "thisMonth"
                      ? theme === "dark"
                        ? "#474747"
                        : "#e3e3e3"
                      : theme === "dark"
                      ? "#27272a"
                      : "#f4f4f5",
                  paddingVertical: 9,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  flex: 3, // 30%
                  marginRight: 8,
                  alignItems: "center",
                }}
              >
                <CustomText
                  weight="bold"                  
                  style={{
                    color: theme === "dark" ? "#c9c9c9" : "#48453e",
                    fontSize: getResponsiveStyles().bodyFontSize,
                  }}
                >
                  {t("dashboard.thisMonth")}
                </CustomText>
              </TouchableOpacity>

              {/* Calendar date picker */}
              <TouchableOpacity
                onPress={() => setCalendarVisible(true)}
                activeOpacity={1}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    selectedPeriod === "custom"
                      ? theme === "dark"
                        ? "#474747"
                        : "#e3e3e3"
                      : theme === "dark"
                      ? "#27272a"
                      : "#f4f4f5",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  flex: 4, // 40%
                }}
              >
                <CustomText
                  className="mr-2"
                  style={{                
                    fontSize: getResponsiveStyles().bodyFontSize,
                  }}
                >
                  {formatDateRange()}
                </CustomText>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={theme === "dark" ? "#c9c9c9" : "#48453e"}
                />
              </TouchableOpacity>
            </View>

            {/* Filters Section - Using Dropdown3 */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 1,
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
                  options={[
                    { label: "All Products", value: "" },
                    ...productOptions,
                  ]}
                  placeholder={t("dashboard.filter.chooseProduct")}
                  selectedValue={selectedProduct || ""}
                  onValueChange={(value: string) =>
                    setSelectedProduct(value || null)
                  }
                  bgColor={theme === "dark" ? "#474747" : "#e3e3e3"}
                  bgChoiceColor={theme === "dark" ? "#27272a" : "#f4f4f5"}
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
                  options={[
                    { label: "All Stores", value: "" },
                    ...storeOptions,
                  ]}
                  placeholder={t("dashboard.filter.chooseStore")}
                  selectedValue={selectedStore || ""}
                  onValueChange={(value: string) =>
                    setSelectedStore(value || null)
                  }
                  bgColor={theme === "dark" ? "#474747" : "#e3e3e3"}
                  bgChoiceColor={theme === "dark" ? "#27272a" : "#f4f4f5"}
                  textcolor={theme === "dark" ? "#ffffff" : "#48453e"}
                />
              </View>
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
                    flexDirection: isDesktop() ? "column" : "column",
                  }}
                >
                  <MetricCard
                    title={t("dashboard.metrics.profitloss")}
                    value={formatCurrency(metrics.profitloss)}
                    icon="trending-up"
                    valueColor={
                      metrics.profitloss >= 0
                        ? theme === "dark"
                          ? "#00fad9"
                          : "#09ddc1"
                        : "#FF006E"
                    }
                  />
                  <View className="flex-row">
                    <MetricCard
                      title={t("dashboard.metrics.income")}
                      value={formatCurrency(metrics.income)}
                      icon="stats-chart"
                      flex={0.7} // 70% of the row
                    />
                    <MetricCard
                      title={t("dashboard.metrics.orders")}
                      value={metrics.orders}
                      icon="document-text-outline"
                      flex={0.3} // 30% of the row
                    />
                  </View>
                </View>
                <View style={{ flexDirection: isDesktop() ? "row" : "column" }}>
                  <MetricCard
                    title={t("dashboard.metrics.expense")}
                    value={formatCurrency(metrics.expense)}
                    icon="cash-outline"
                  />
                  <MetricCard
                    title={t("dashboard.metrics.adscost")}
                    value={formatCurrency(metrics.adscost)}
                    icon="cash-outline"
                  />
                </View>
              </View>

              {/* Sales Chart */}
              <View
                style={{
                  backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
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
                    name="analytics"
                    size={18}
                    color={theme === "dark" ? "#00fad9" : "#09ddc1"}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText weight="bold" className="text-lg">
                    {t("dashboard.salesChart.title")}
                  </CustomText>
                </View>

                <View
                  style={{
                    minHeight: 280,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "transparent",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  {salesChartData.length > 0 ? (
                    <LinearChart data={salesChartData} height={220} />
                  ) : (
                    <>
                      <Ionicons
                        name="bar-chart-outline"
                        size={48}
                        color={theme === "dark" ? "#3f3f42" : "#e5e7eb"}
                      />
                      <CustomText className="mt-4 opacity-50">
                        {t("dashboard.salesChart.noData")}
                      </CustomText>
                    </>
                  )}
                </View>
              </View>

              {/* Top Products */}
              <View
                style={{
                  backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
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
                    size={18}
                    color={theme === "dark" ? "#00fad9" : "#09ddc1"}
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
                    <CustomText weight="bold" className="text-sm pt-1">
                      {topProducts.length}
                    </CustomText>
                  </View>
                </View>

                {topProducts.length > 0 ? (
                  <View>
                    {topProducts.map((product, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          borderBottomWidth:
                            index < topProducts.length - 1 ? 1 : 0,
                          borderBottomColor:
                            theme === "dark" ? "#3f3f42" : "#e5e7eb",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <CustomText
                            weight="bold"
                            style={{
                              color: theme === "dark" ? "#c9c9c9" : "#48453e",
                            }}
                          >
                            {product.name}
                          </CustomText>
                          <View className="flex-row gap-2">
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {product.orders}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                            {`${t("common.orders")} •`}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {product.sales}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {t(`product.unit.${product.unit}`)}
                            </CustomText>
                          </View>
                        </View>
                        <CustomText
                          weight="bold"
                          style={{
                            color: theme === "dark" ? "#00fad9" : "#09ddc1",
                          }}
                        >
                          {formatCurrency(product.revenue)}
                        </CustomText>
                      </View>
                    ))}
                  </View>
                ) : (
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
                    <CustomText className="mt-4 opacity-50 pt-1">
                      {t("dashboard.topProducts.noData")}
                    </CustomText>
                  </View>
                )}
              </View>

              {/* Top Stores - New Section */}
              <View
                style={{
                  backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
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
                    name="storefront"
                    size={18}
                    color={theme === "dark" ? "#00fad9" : "#09ddc1"}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText weight="bold" className="text-lg pt-1">
                    {t("dashboard.topStores.title")}
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
                    <CustomText weight="bold" className="text-sm pt-1">
                      {topStores.length}
                    </CustomText>
                  </View>
                </View>

                {topStores.length > 0 ? (
                  <View>
                    {topStores.map((store, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          borderBottomWidth:
                            index < topStores.length - 1 ? 1 : 0,
                          borderBottomColor:
                            theme === "dark" ? "#3f3f42" : "#e5e7eb",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <CustomText
                            weight="bold"
                            style={{
                              color: theme === "dark" ? "#c9c9c9" : "#48453e",
                            }}
                          >
                            {store.name}
                          </CustomText>
                          <View className="flex-row gap-2">
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {store.orders}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {`${t("common.orders")} •`}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {store.sales}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                               {t(`product.unit.${store.unit}`)}
                            </CustomText>
                          </View>
                        </View>
                        <CustomText
                          weight="bold"
                          style={{
                            color: theme === "dark" ? "#00fad9" : "#09ddc1",
                          }}
                        >
                          {formatCurrency(store.revenue)}
                        </CustomText>
                      </View>
                    ))}
                  </View>
                ) : (
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
                      {t("dashboard.topStores.noData")}
                    </CustomText>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
