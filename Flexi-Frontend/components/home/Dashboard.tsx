import { useState, useEffect, ReactNode } from "react";
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
import CallAPIPlatform from "@/api/platform_api";
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
  subValue?: string | number;
  percentage?: string | number;
  value: string | number; // Allow both string and number for flexibility
  icon: keyof typeof Ionicons.glyphMap;
  flex?: number; // Add flex prop instead of width for better control
  valueColor?: string; // Add optional color prop for the value
  children?: ReactNode;
};

const MetricCard = ({
  title,
  subValue,
  value,
  percentage,
  icon,
  flex = 1,
  valueColor,
  children,
}: MetricCardProps) => {
  const { theme } = useTheme();
  const formattedPercentage =
    typeof percentage === "number" ? percentage.toFixed(2) : percentage;

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
      <View
        className="flex-row"
        style={{
          justifyContent:
            percentage !== undefined && percentage !== null
              ? "space-between"
              : "flex-start",
        }}
      >
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
        {subValue !== undefined && subValue !== null && (
          <Text
            style={{
              fontSize: headerFontSize,
              fontWeight: "bold",
              color: valueColor || (theme === "dark" ? "#ffffff" : "#3c3c3c"),
              opacity: 0.2,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            /{subValue}
          </Text>
        )}
        {percentage !== undefined && percentage !== null && (
          <Text
            style={{
              fontSize: headerFontSize * 1.5,
              fontWeight: "bold",
              color: valueColor || (theme === "dark" ? "#ffffff" : "#3c3c3c"),
              opacity: 0.5,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formattedPercentage}%
          </Text>
        )}
      </View>
      {children}
    </View>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
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
    allOrders: 0,
    adscost: 0,
    forcastProfitloss: 0,
    adsPercentage: 0,
  });
  const [accountsPayable, setAccountsPayable] = useState(0);
  const [accountsReceivable, setAccountsReceivable] = useState(0);
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topPlatforms, setTopPlatforms] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Fetch dashboard data when filters change
    fetchDashboardData();
  }, [selectedDates, selectedProduct, selectedPlatform, selectedPeriod]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const memberId = await getMemberId();
      // console.log("Member ID:", memberId);
      if (memberId) {
        // Fetch products and platforms for filters
        const [productResponse, platformResponse] = await Promise.all([
          CallAPIProduct.getProductChoiceAPI(memberId),
          CallAPIPlatform.getPlatformEnumAPI(memberId),
        ]);

        const normalizedProducts = Array.isArray(productResponse)
          ? productResponse
          : Array.isArray(productResponse?.data)
            ? productResponse.data
            : [];
        const normalizedPlatforms = Array.isArray(platformResponse)
          ? platformResponse
          : Array.isArray(platformResponse?.data)
            ? platformResponse.data
            : [];

        setProducts(normalizedProducts);
        setPlatforms(normalizedPlatforms);
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
      //   console.log("Fetching dashboard data for member ID:", memberId);
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

      // Add platform filter if selected (platform string from enum API)
      if (selectedPlatform) {
        filters.platform = selectedPlatform;
      }

      //   console.log("📊 Dashboard API Filters:", filters);

      // Fetch all dashboard data in parallel
      const [metricsData, chartData, productsData, platformsData, apArData] =
        await Promise.all([
          CallDashboardAPI.getDashboardMetricsAPI(filters),
          CallDashboardAPI.getSalesChartDataAPI(filters),
          CallDashboardAPI.getTopProductsAPI({ ...filters, limit: 5 }),
          CallDashboardAPI.getTopStoresAPI({ ...filters, limit: 5 }),
          CallDashboardAPI.getAccountsPayableReceivableAPI(filters),
        ]);

      // Update state with fetched data
      setMetrics({
        income: metricsData.income || 0,
        expense: metricsData.expense || 0,
        profitloss: metricsData.profitloss || 0,
        orders: metricsData.orders || 0,
        allOrders: metricsData.allOrders || 0,
        adscost: metricsData.adscost || 0,
        forcastProfitloss: metricsData.forcastProfitloss || 0,
        adsPercentage: metricsData.adsPercentage || 0,
      });

      setAccountsPayable(apArData?.accountsPayable || 0);
      setAccountsReceivable(apArData?.accountsReceivable || 0);

      setSalesChartData(chartData || []);
      setTopProducts(productsData || []);
      setTopPlatforms(platformsData || []);
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
      //  console.log("Selected dates:", dates);
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
        "dd/MM/yyyy",
      )}`;
    } else if (selectedDates.length === 1) {
      return format(new Date(selectedDates[0]), "dd/MM/yyyy");
    } else {
      return t("dashboard.selectDate");
    }
  };

  // Format products and platforms data for dropdown
  const productOptions = (Array.isArray(products) ? products : [])
    .map((product: any) => {
      const name =
        typeof product === "string" ? product : (product?.name as string);
      return name ? { label: name, value: name } : null;
    })
    .filter(Boolean) as { label: string; value: string }[];

  const normalizePlatformLabel = (platform: any): string => {
    if (!platform) return "";
    if (typeof platform === "string") return platform;
    return (
      platform.platform ||
      platform.plat ||
      platform.accName ||
      platform.accname ||
      ""
    );
  };

  const platformOptions = (Array.isArray(platforms) ? platforms : [])
    .map((platform) => {
      const label = normalizePlatformLabel(platform);
      return label ? { label, value: label } : null;
    })
    .filter(Boolean) as { label: string; value: string }[];

  const isFiltered = Boolean(selectedProduct || selectedPlatform);

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
              zIndex: 2000,
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
                  paddingVertical: isMobile() ? 10 : 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  minHeight: isMobile() ? 44 : 54,
                  justifyContent: "center",
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
                    lineHeight: getResponsiveStyles().bodyFontSize * 1.5,
                    textAlignVertical: "center",
                    paddingTop: 2,
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
                  paddingVertical: isMobile() ? 10 : 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  minHeight: isMobile() ? 44 : 54,
                  justifyContent: "center",
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
                    lineHeight: getResponsiveStyles().bodyFontSize * 1.5,
                    textAlignVertical: "center",
                    paddingTop: 2,
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
                  paddingVertical: isMobile() ? 10 : 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  minHeight: isMobile() ? 44 : 54,
                  flex: 4, // 40%
                }}
              >
                <CustomText
                  style={{
                    fontSize: getResponsiveStyles().bodyFontSize,
                    lineHeight: getResponsiveStyles().bodyFontSize * 1.5,
                    textAlignVertical: "center",
                    paddingTop: 2,
                    paddingRight: 4,
                  }}
                  numberOfLines={2}
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
                zIndex: 10,
              }}
            >
              {/* Product Filter */}
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  marginRight: 8,
                  marginBottom: 0,
                  zIndex: 2000,
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
                  otherStyles={{}}
                />
              </View>

              {/* Platform Filter */}
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  zIndex: 2000,
                }}
              >
                <Dropdown3
                  options={[
                    { label: "All Platforms", value: "" },
                    ...platformOptions,
                  ]}
                  placeholder={t("dashboard.filter.choosePlatform")}
                  selectedValue={selectedPlatform || ""}
                  onValueChange={(value: string) =>
                    setSelectedPlatform(value || null)
                  }
                  bgColor={theme === "dark" ? "#474747" : "#e3e3e3"}
                  bgChoiceColor={theme === "dark" ? "#27272a" : "#f4f4f5"}
                  textcolor={theme === "dark" ? "#ffffff" : "#48453e"}
                  otherStyles={{}}
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
                zIndex: 1,
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
              <View style={{ marginBottom: 24, zIndex: 1 }}>
                <View
                  style={{
                    flexDirection: isDesktop() ? "column" : "column",
                  }}
                >
                  {isFiltered ? (
                    <MetricCard
                      title={t("dashboard.metrics.forcastProfitloss")}
                      value={formatCurrency(metrics.forcastProfitloss)}
                      icon="trending-up"
                      percentage={metrics.adsPercentage}
                      valueColor={
                        metrics.forcastProfitloss >= 30
                          ? theme === "dark"
                            ? "#00fad9"
                            : "#09ddc1"
                          : "#FF006E"
                      }
                    />
                  ) : (
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
                  )}
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
                      subValue={metrics.allOrders}
                      icon="document-text-outline"
                      flex={0.3} // 30% of the row
                    />
                  </View>
                </View>
                <View style={{ flexDirection: isDesktop() ? "row" : "column" }}>
                  {isFiltered ? (
                    <MetricCard
                      title={t("dashboard.metrics.adscost")}
                      value={formatCurrency(metrics.adscost)}
                      icon="megaphone"
                    ></MetricCard>
                  ) : (
                    <MetricCard
                      title={t("dashboard.metrics.expense")}
                      value={formatCurrency(metrics.expense)}
                      icon="cash-outline"
                    >
                      <View
                        style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor:
                            theme === "dark"
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="megaphone-outline"
                            size={16}
                            color={theme === "dark" ? "#c9c9c9" : "#75726a"}
                            style={{ marginRight: 6 }}
                          />
                          <CustomText style={{ fontSize: 13, opacity: 0.8 }}>
                            {t("dashboard.metrics.adscost")}
                          </CustomText>
                        </View>
                        <CustomText weight="bold" style={{ fontSize: 14 }}>
                          {formatCurrency(metrics.adscost)}
                        </CustomText>
                      </View>
                    </MetricCard>
                  )}
                </View>
                <View className="flex-row">
                  <MetricCard
                    title={t("dashboard.metrics.accountsReceivable")}
                    value={formatCurrency(accountsPayable)}
                    icon="arrow-up-circle-outline"
                    valueColor={theme === "dark" ? "#00fad9" : "#09ddc1"}
                  />
                  <MetricCard
                    title={t("dashboard.metrics.accountsPayable")}
                    value={formatCurrency(accountsReceivable)}
                    icon="arrow-down-circle-outline"
                    valueColor="#FF006E"
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

              {/* Top Platforms - New Section */}
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
                    {t("dashboard.topPlatforms.title")}
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
                      {topPlatforms.length}
                    </CustomText>
                  </View>
                </View>

                {topPlatforms.length > 0 ? (
                  <View>
                    {topPlatforms.map((platform, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          borderBottomWidth:
                            index < topPlatforms.length - 1 ? 1 : 0,
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
                            {platform.name}
                          </CustomText>
                          <View className="flex-row gap-2">
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {platform.orders}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {`${t("common.orders")} •`}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {platform.sales}
                            </CustomText>
                            <CustomText style={{ fontSize: 12, opacity: 0.7 }}>
                              {t(`product.unit.${platform.unit}`)}
                            </CustomText>
                          </View>
                        </View>
                        <CustomText
                          weight="bold"
                          style={{
                            color: theme === "dark" ? "#00fad9" : "#09ddc1",
                          }}
                        >
                          {formatCurrency(platform.revenue)}
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
                      {t("dashboard.topPlatforms.noData")}
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
