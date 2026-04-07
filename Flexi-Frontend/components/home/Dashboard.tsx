import { useState, useEffect, useRef, ReactNode } from "react";
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
import CallAPIExpense from "@/api/expense_api";
import CallDashboardAPI from "@/api/dashboard_api";
import { format } from "date-fns";
import { Text } from "react-native";
import { getResponsiveStyles } from "@/utils/responsive";
import LinearChart from "@/components/LinearChart";
import PieChart from "@/components/PieChart";

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
        backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff",
        borderRadius: 16,
        padding: 16,
        margin: 4,
        flex: flex,
        borderWidth: 1,
        borderColor: theme === "dark" ? "#2e2e30" : "#ebebeb",
        shadowColor: theme === "dark" ? "#000" : "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === "dark" ? 0.25 : 0.07,
        shadowRadius: 6,
        elevation: 3,
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
          style={{ color: theme === "dark" ? "#aaaaaa" : "#888888" }}
        >
          {title}
        </CustomText>
        <Ionicons
          name={icon}
          size={22}
          color={theme === "dark" ? "#888" : "#b0b0b0"}
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
            color: valueColor || (theme === "dark" ? "#ffffff" : "#111111"),
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
              color: valueColor || (theme === "dark" ? "#ffffff" : "#111111"),
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
              color: valueColor || (theme === "dark" ? "#ffffff" : "#111111"),
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
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "yesterday" | "thisWeek" | "lastWeek" | "lastMonth" | "thisMonth" | "thisYear" | "lastYear" | "yearBeforeLast" | "custom"
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
  const [apArModalVisible, setApArModalVisible] = useState(false);
  const [apArModalType, setApArModalType] = useState<'receivable' | 'payable'>('receivable');
  const [apArDetail, setApArDetail] = useState<{ invoiceBills: any[]; invoiceExpenses: any[] } | null>(null);
  const [apArDetailLoading, setApArDetailLoading] = useState(false);
  const [incExpModalVisible, setIncExpModalVisible] = useState(false);
  const [incExpModalType, setIncExpModalType] = useState<'income' | 'expense'>('income');
  const [incExpDetail, setIncExpDetail] = useState<{ bills: any[]; expenses: any[] } | null>(null);
  const [incExpDetailLoading, setIncExpDetailLoading] = useState(false);
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topPlatforms, setTopPlatforms] = useState<any[]>([]);
  const [expenseByCustomGroup, setExpenseByCustomGroup] = useState<{ data: any[]; total: number }>({ data: [], total: 0 });
  const [expenseByNote, setExpenseByNote] = useState<{ data: any[]; total: number }>({ data: [], total: 0 });
  const [expenseByGroup, setExpenseByGroup] = useState<{ data: any[]; total: number }>({ data: [], total: 0 });
  const [activePieIndex, setActivePieIndex] = useState(0);
  const pieScrollRef = useRef<any>(null);
  const [pieContainerWidth, setPieContainerWidth] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Fetch dashboard data when filters change
    fetchDashboardData();
  }, [selectedDates, selectedProduct, selectedPlatform, selectedPeriod, selectedProject]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const memberId = await getMemberId();
      // console.log("Member ID:", memberId);
      if (memberId) {
        // Fetch products, platforms, and projects for filters
        const [productResponse, platformResponse, projectResponse] = await Promise.all([
          CallAPIProduct.getProductChoiceAPI(memberId),
          CallAPIPlatform.getPlatformEnumAPI(memberId),
          CallAPIExpense.getProjectSuggestionsAPI(memberId),
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
        setProjects(Array.isArray(projectResponse) ? projectResponse : []);
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

      // Add project filter if selected
      if (selectedProject) {
        filters.projectId = selectedProject;
      }

      //   console.log("📊 Dashboard API Filters:", filters);

      // Fetch all dashboard data in parallel
      const [metricsData, chartData, productsData, platformsData, apArData, customGroupData, noteGroupData, expenseGroupData] =
        await Promise.all([
          CallDashboardAPI.getDashboardMetricsAPI(filters),
          CallDashboardAPI.getSalesChartDataAPI(filters),
          CallDashboardAPI.getTopProductsAPI({ ...filters, limit: 5 }),
          CallDashboardAPI.getTopStoresAPI({ ...filters, limit: 5 }),
          CallDashboardAPI.getAccountsPayableReceivableAPI(filters),
          CallDashboardAPI.getExpenseByCustomGroupAPI(filters),
          CallDashboardAPI.getExpenseByCustomGroupAPI({ ...filters, groupBy: 'note' }),
          CallDashboardAPI.getExpenseByCustomGroupAPI({ ...filters, groupBy: 'group' }),
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
      setExpenseByCustomGroup(customGroupData || { data: [], total: 0 });
      setExpenseByNote(noteGroupData || { data: [], total: 0 });
      setExpenseByGroup(expenseGroupData || { data: [], total: 0 });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Keep existing data on error
    }
  };

  const openApArModal = async (type: 'receivable' | 'payable') => {
    setApArModalType(type);
    setApArModalVisible(true);
    setApArDetailLoading(true);
    try {
      const memberId = await getMemberId();
      if (!memberId) return;
      const filters: any = { memberId, period: selectedPeriod };
      if (selectedPeriod === 'custom' && selectedDates.length >= 2) {
        filters.startDate = selectedDates[0];
        filters.endDate = selectedDates[selectedDates.length - 1];
      }
      const data = await CallDashboardAPI.getAPARDetailAPI(filters);
      setApArDetail(data);
    } catch (err) {
      console.error("Failed to fetch AP/AR detail", err);
    } finally {
      setApArDetailLoading(false);
    }
  };

  const openIncExpModal = async (type: 'income' | 'expense') => {
    setIncExpModalType(type);
    setIncExpModalVisible(true);
    setIncExpDetailLoading(true);
    try {
      const memberId = await getMemberId();
      if (!memberId) return;
      const filters: any = { memberId, period: selectedPeriod };
      if (selectedPeriod === 'custom' && selectedDates.length >= 2) {
        filters.startDate = selectedDates[0];
        filters.endDate = selectedDates[selectedDates.length - 1];
      }
      if (selectedProduct) filters.productName = selectedProduct;
      if (selectedPlatform) filters.platform = selectedPlatform;
      const data = await CallDashboardAPI.getIncomeExpenseDetailAPI(filters);
      setIncExpDetail(data);
    } catch (err) {
      console.error("Failed to fetch income/expense detail", err);
    } finally {
      setIncExpDetailLoading(false);
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

  const handlePeriodChange = (period: "today" | "yesterday" | "thisWeek" | "lastWeek" | "lastMonth" | "thisMonth" | "thisYear" | "lastYear" | "yearBeforeLast") => {
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

  const projectOptions = (Array.isArray(projects) ? projects : []).map((p) => ({
    label: p.name,
    value: String(p.id),
  }));

  const isFiltered = Boolean(selectedProduct || selectedPlatform);

  return (
    <View style={{ flex: 1, backgroundColor: theme === "dark" ? "#09090b" : "#f5f5f5" }}>
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

      {/* Income / Expense Detail Modal */}
      <Modal
        visible={incExpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIncExpModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setIncExpModalVisible(false)}
        >
          <View
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme === "dark" ? "#18181b" : "#f0fbfa",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: "75%",
              width: isMobile() ? "100%" : "50%",
              alignSelf: "center",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <CustomText weight="bold" style={{ fontSize: 16 }}>
                {incExpModalType === 'income'
                  ? t("dashboard.metrics.income")
                  : t("dashboard.metrics.expense")}
              </CustomText>
              <TouchableOpacity onPress={() => setIncExpModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme === "dark" ? "#b4b3b3" : "#2a2a2a"} />
              </TouchableOpacity>
            </View>

            {incExpDetailLoading ? (
              <ActivityIndicator size="large" color={theme === "dark" ? "#00fad9" : "#09ddc1"} style={{ marginTop: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {(incExpModalType === 'income'
                  ? incExpDetail?.bills ?? []
                  : incExpDetail?.expenses ?? []
                ).length === 0 ? (
                  <CustomText style={{ textAlign: "center", marginTop: 40, opacity: 0.5 }}>
                    {t("common.noData") || "No data"}
                  </CustomText>
                ) : (
                  (incExpModalType === 'income'
                    ? incExpDetail?.bills ?? []
                    : incExpDetail?.expenses ?? []
                  ).map((item: any) => (
                    <View
                      key={item.id}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === "dark" ? "#27272a" : "#e5e7eb",
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <CustomText weight="semibold" style={{ fontSize: 14 }} numberOfLines={1}>
                            {item.name || "-"}
                          </CustomText>
                          {(item.note || item.desc) ? (
                            <CustomText style={{ fontSize: 12, opacity: 0.6 }} numberOfLines={1}>
                              {item.note || item.desc}
                            </CustomText>
                          ) : null}
                          {item.platform ? (
                            <CustomText style={{ fontSize: 11, opacity: 0.45 }} numberOfLines={1}>
                              {item.platform}
                            </CustomText>
                          ) : null}
                          <CustomText style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                            {item.date ? new Date(item.date).toLocaleDateString("th-TH") : ""}
                          </CustomText>
                        </View>
                        <CustomText
                          weight="bold"
                          style={{
                            fontSize: 15,
                            color: incExpModalType === 'income'
                              ? (theme === "dark" ? "#00fad9" : "#09ddc1")
                              : "#FF006E",
                          }}
                        >
                          {new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2 }).format(item.amount)}
                        </CustomText>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* AP/AR Detail Modal */}
      <Modal
        visible={apArModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setApArModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setApArModalVisible(false)}
        >
          <View
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme === "dark" ? "#18181b" : "#f0fbfa",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: "75%",
              width: isMobile() ? "100%" : "50%",
              alignSelf: "center",
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <CustomText weight="bold" style={{ fontSize: 16 }}>
                {apArModalType === 'receivable'
                  ? t("dashboard.metrics.accountsReceivable")
                  : t("dashboard.metrics.accountsPayable")}
              </CustomText>
              <TouchableOpacity onPress={() => setApArModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme === "dark" ? "#b4b3b3" : "#2a2a2a"} />
              </TouchableOpacity>
            </View>

            {apArDetailLoading ? (
              <ActivityIndicator size="large" color={theme === "dark" ? "#00fad9" : "#09ddc1"} style={{ marginTop: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {(apArModalType === 'receivable'
                  ? apArDetail?.invoiceBills ?? []
                  : apArDetail?.invoiceExpenses ?? []
                ).length === 0 ? (
                  <CustomText style={{ textAlign: "center", marginTop: 40, opacity: 0.5 }}>
                    {t("common.noData") || "No data"}
                  </CustomText>
                ) : (
                  (apArModalType === 'receivable'
                    ? apArDetail?.invoiceBills ?? []
                    : apArDetail?.invoiceExpenses ?? []
                  ).map((item: any) => (
                    <View
                      key={item.id}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === "dark" ? "#27272a" : "#e5e7eb",
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <CustomText weight="semibold" style={{ fontSize: 14 }} numberOfLines={1}>
                            {item.name || "-"}
                          </CustomText>
                          {item.note ? (
                            <CustomText style={{ fontSize: 12, opacity: 0.6 }} numberOfLines={1}>
                              {item.note}
                            </CustomText>
                          ) : null}
                          <CustomText style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                            {item.date ? new Date(item.date).toLocaleDateString("th-TH") : ""}
                          </CustomText>
                          {item.dueDate ? (
                            <CustomText style={{ fontSize: 11, color: "#ff2a00", marginTop: 1 }}>
                              DUE: {new Date(item.dueDate).toLocaleDateString("th-TH")}
                            </CustomText>
                          ) : null}
                        </View>
                        <CustomText weight="bold" style={{ fontSize: 15, color: apArModalType === 'receivable' ? (theme === "dark" ? "#00fad9" : "#09ddc1") : "#FF006E" }}>
                          {new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2 }).format(item.amount)}
                        </CustomText>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
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
            paddingBottom: 40,
          }}
        >
          {/* Filter bar */}
          {(() => {
            const accent     = theme === "dark" ? "#04ecd5" : "#14dbc4";
            const chipBg     = theme === "dark" ? "#2a2b2c" : "#f0f0f0";
            const chipBorder = theme === "dark" ? "#3a3b3c" : "#dddddd";
            const chipText   = theme === "dark" ? "#aaaaaa" : "#444444";
            const accentText = theme === "dark" ? "#1c1d1e" : "#ffffff";
            const divider    = theme === "dark" ? "#3a3b3c" : "#e0e0e0";

            const Chip = ({ chipKey, label, isActive, onPress, icon }: { chipKey: string; label: string; isActive: boolean; onPress: () => void; icon?: React.ReactNode }) => (
              <TouchableOpacity
                key={chipKey}
                onPress={onPress}
                style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, height: 30, borderRadius: 20, backgroundColor: isActive ? accent : chipBg, borderWidth: 1, borderColor: isActive ? accent : chipBorder }}
              >
                {icon}
                <CustomText weight={isActive ? "semibold" : "regular"} style={{ fontSize: 12, color: isActive ? accentText : chipText }}>
                  {label}
                </CustomText>
              </TouchableOpacity>
            );

            const MiniSelect = ({ value, onChange, options, placeholder }: { value: string | null; onChange: (v: string | null) => void; options: { label: string; value: string }[]; placeholder: string }) => {
              const [open, setOpen] = useState(false);
              const selected = options.find((o) => o.value === value);
              const isActive = !!value;
              return (
                <>
                  <TouchableOpacity
                    onPress={() => setOpen(true)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, height: 30, borderRadius: 20, backgroundColor: isActive ? accent : chipBg, borderWidth: 1, borderColor: isActive ? accent : chipBorder }}
                  >
                    <CustomText weight={isActive ? "semibold" : "regular"} numberOfLines={1} style={{ fontSize: 12, color: isActive ? accentText : chipText }}>
                      {selected?.label || placeholder}
                    </CustomText>
                    <Ionicons name="chevron-down" size={11} color={isActive ? accentText : chipText} />
                  </TouchableOpacity>
                  <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }} activeOpacity={1} onPress={() => setOpen(false)}>
                      <View onStartShouldSetResponder={() => true} style={{ width: "80%", maxWidth: 320, backgroundColor: theme === "dark" ? "#1c1c1e" : "#f0fbfa", borderRadius: 16, padding: 16, maxHeight: 360 }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                          {[{ label: t("common.all") || "All", value: "" }, ...options].map((opt) => {
                            const isSelected = (value ?? "") === opt.value;
                            return (
                              <TouchableOpacity
                                key={opt.value || "__all__"}
                                onPress={() => { onChange(opt.value || null); setOpen(false); }}
                                style={{ paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: theme === "dark" ? "#2e2e30" : "#f0f0f0", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                              >
                                <CustomText weight={isSelected ? "semibold" : "regular"} style={{ fontSize: 14, color: isSelected ? (theme === "dark" ? "#f0f0f0" : "#111111") : chipText }}>
                                  {opt.label}
                                </CustomText>
                                {isSelected && <Ionicons name="checkmark" size={15} color={accent} />}
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </>
              );
            };

            return (
              <View style={{ marginBottom: 16, zIndex: 2000, backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: theme === "dark" ? "#2e2e30" : "#ebebeb", padding: 10, shadowColor: theme === "dark" ? "#000" : "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme === "dark" ? 0.3 : 0.07, shadowRadius: 6, gap: 6 }}>
                {/* Row 1 — period chips */}
                <View style={{ height: 30 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: 6, height: 30 }}>
                    <TouchableOpacity
                      onPress={() => setCalendarVisible(true)}
                      style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, height: 30, borderRadius: 20, backgroundColor: selectedPeriod === "custom" ? accent : chipBg, borderWidth: 1, borderColor: selectedPeriod === "custom" ? accent : chipBorder }}
                    >
                      <Ionicons name="calendar-outline" size={12} color={selectedPeriod === "custom" ? accentText : chipText} />
                      <CustomText weight={selectedPeriod === "custom" ? "semibold" : "regular"} style={{ fontSize: 12, color: selectedPeriod === "custom" ? accentText : chipText }} numberOfLines={1}>
                        {formatDateRange()}
                      </CustomText>
                    </TouchableOpacity>
                    <View style={{ width: 1, height: 18, backgroundColor: divider, marginHorizontal: 2 }} />
                    <Chip chipKey="today" label={t("dashboard.today")} isActive={selectedPeriod === "today"} onPress={() => handlePeriodChange("today")} />
                    <Chip chipKey="thisMonth" label={t("dashboard.thisMonth")} isActive={selectedPeriod === "thisMonth"} onPress={() => handlePeriodChange("thisMonth")} />
                    <Chip chipKey="yesterday" label={t("dashboard.yesterday")} isActive={selectedPeriod === "yesterday"} onPress={() => handlePeriodChange("yesterday")} />
                    <Chip chipKey="thisWeek" label={t("dashboard.thisWeek")} isActive={selectedPeriod === "thisWeek"} onPress={() => handlePeriodChange("thisWeek")} />
                    <Chip chipKey="lastWeek" label={t("dashboard.lastWeek")} isActive={selectedPeriod === "lastWeek"} onPress={() => handlePeriodChange("lastWeek")} />
                    <Chip chipKey="lastMonth" label={t("dashboard.lastMonth")} isActive={selectedPeriod === "lastMonth"} onPress={() => handlePeriodChange("lastMonth")} />
                    <Chip chipKey="thisYear" label={t("dashboard.thisYear")} isActive={selectedPeriod === "thisYear"} onPress={() => handlePeriodChange("thisYear")} />
                    <Chip chipKey="lastYear" label={t("dashboard.lastYear")} isActive={selectedPeriod === "lastYear"} onPress={() => handlePeriodChange("lastYear")} />
                    <Chip chipKey="yearBeforeLast" label={t("dashboard.yearBeforeLast")} isActive={selectedPeriod === "yearBeforeLast"} onPress={() => handlePeriodChange("yearBeforeLast")} />
                  </ScrollView>
                </View>

                {/* Row 2 — product & platform */}
                <View style={{ height: 30 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: 6, height: 30 }}>
                    <MiniSelect value={selectedProject !== null ? String(selectedProject) : null} onChange={(v) => setSelectedProject(v ? parseInt(v) : null)} options={projectOptions} placeholder={t("dashboard.filter.chooseProject")} />
                    <MiniSelect value={selectedProduct} onChange={setSelectedProduct} options={productOptions} placeholder={t("dashboard.filter.chooseProduct")} />
                    <MiniSelect value={selectedPlatform} onChange={setSelectedPlatform} options={platformOptions} placeholder={t("dashboard.filter.choosePlatform")} />
                  </ScrollView>
                </View>
              </View>
            );
          })()}

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
                color={theme === "dark" ? "#04ecd5" : "#01e0c6"}
              />
            </View>
          ) : (
            <>
              {/* Summary Statistics */}
              <View style={{ marginBottom: 24, zIndex: 1 }}>
                <View
                  style={{
                    flexDirection: "column",
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
                            ? "#04ecd5"
                            : "#01e0c6"
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
                            ? "#04ecd5"
                            : "#01e0c6"
                          : "#FF006E"
                      }
                    />
                  )}
                  <View className="flex-row">
                    <TouchableOpacity style={{ flex: 0.7 }} onPress={() => openIncExpModal('income')} activeOpacity={0.8}>
                      <MetricCard
                        title={t("dashboard.metrics.income")}
                        value={formatCurrency(metrics.income)}
                        icon="stats-chart"
                      />
                    </TouchableOpacity>
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
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => openIncExpModal('expense')} activeOpacity={0.8}>
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
                              : "#eeeeee",
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
                    </TouchableOpacity>
                  )}
                </View>
                <View className="flex-row">
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => openApArModal('receivable')} activeOpacity={0.8}>
                    <MetricCard
                      title={t("dashboard.metrics.accountsReceivable")}
                      value={formatCurrency(accountsPayable)}
                      icon="arrow-up-circle-outline"
                      valueColor={theme === "dark" ? "#04ecd5" : "#01e0c6"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => openApArModal('payable')} activeOpacity={0.8}>
                    <MetricCard
                      title={t("dashboard.metrics.accountsPayable")}
                      value={formatCurrency(accountsReceivable)}
                      icon="arrow-down-circle-outline"
                      valueColor="#FF006E"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sales Chart */}
              <View
                style={{
                  backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme === "dark" ? "#2e2e30" : "#ebebeb",
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: theme === "dark" ? "#000" : "#000000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: theme === "dark" ? 0.25 : 0.07,
                  shadowRadius: 6,
                  elevation: 3,
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
                    color={theme === "dark" ? "#04ecd5" : "#01e0c6"}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText weight="bold" style={{ fontSize: 15 }}>
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
                  backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme === "dark" ? "#2e2e30" : "#ebebeb",
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: theme === "dark" ? "#000" : "#000000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: theme === "dark" ? 0.25 : 0.07,
                  shadowRadius: 6,
                  elevation: 3,
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
                    color={theme === "dark" ? "#04ecd5" : "#01e0c6"}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText weight="bold" style={{ fontSize: 15 }}>
                    {t("dashboard.topProducts.title")}
                  </CustomText>
                  <View
                    style={{
                      backgroundColor: theme === "dark" ? "#2a2a2c" : "#d0f5f1",
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
                            theme === "dark" ? "#2e2e30" : "#f0f0f0",
                        }}
                      >
                        <CustomText weight="bold" style={{ fontSize: 13, color: theme === "dark" ? "#555" : "#cccccc", marginRight: 12, width: 18, textAlign: "center" }}>{index + 1}</CustomText>
                        <View style={{ flex: 1 }}>
                          <CustomText
                            weight="bold"
                            style={{
                              color: theme === "dark" ? "#c9c9c9" : "#111111",
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
                            color: theme === "dark" ? "#04ecd5" : "#01e0c6",
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

              {/* Expense Pie Charts — swipeable */}
              {(expenseByCustomGroup.data.length > 0 || expenseByNote.data.length > 0 || expenseByGroup.data.length > 0) && (
                <View
                  style={{
                    backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme === "dark" ? "#2e2e30" : "#ebebeb",
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: theme === "dark" ? "#000" : "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: theme === "dark" ? 0.25 : 0.07,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {/* Header */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                    <Ionicons name="pie-chart" size={18} color={theme === "dark" ? "#04ecd5" : "#01e0c6"} style={{ marginRight: 8 }} />
                    <CustomText weight="bold" style={{ fontSize: 15 }}>
                      {activePieIndex === 0 ? t("dashboard.expenseByCustomGroup.title") : activePieIndex === 1 ? t("dashboard.expenseByNote.title") : t("dashboard.expenseByGroup.title")}
                    </CustomText>
                  </View>

                  {/* Paged charts */}
                  <View onLayout={(e) => setPieContainerWidth(e.nativeEvent.layout.width)}>
                    {pieContainerWidth > 0 && (
                      <ScrollView
                        ref={pieScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onMomentumScrollEnd={(e) => {
                          const idx = Math.round(e.nativeEvent.contentOffset.x / pieContainerWidth);
                          setActivePieIndex(idx);
                        }}
                      >
                        <View style={{ width: pieContainerWidth }}>
                          <PieChart data={expenseByCustomGroup.data} total={expenseByCustomGroup.total} />
                        </View>
                        <View style={{ width: pieContainerWidth }}>
                          <PieChart data={expenseByNote.data} total={expenseByNote.total} />
                        </View>
                        <View style={{ width: pieContainerWidth }}>
                          <PieChart data={expenseByGroup.data} total={expenseByGroup.total} />
                        </View>
                      </ScrollView>
                    )}
                  </View>

                  {/* Dot indicators */}
                  <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 }}>
                    {[0, 1, 2].map((i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          setActivePieIndex(i);
                          pieScrollRef.current?.scrollTo({ x: i * pieContainerWidth, animated: true });
                        }}
                        style={{
                          width: activePieIndex === i ? 18 : 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: activePieIndex === i
                            ? (theme === "dark" ? "#04ecd5" : "#01c4ad")
                            : (theme === "dark" ? "#3a3b3c" : "#dddddd"),
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Top Platforms - New Section */}
              <View
                style={{
                  backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme === "dark" ? "#2e2e30" : "#ebebeb",
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: theme === "dark" ? "#000" : "#000000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: theme === "dark" ? 0.25 : 0.07,
                  shadowRadius: 6,
                  elevation: 3,
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
                    color={theme === "dark" ? "#04ecd5" : "#01e0c6"}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText weight="bold" style={{ fontSize: 15 }}>
                    {t("dashboard.topPlatforms.title")}
                  </CustomText>
                  <View
                    style={{
                      backgroundColor: theme === "dark" ? "#2a2a2c" : "#d0f5f1",
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
                            theme === "dark" ? "#2e2e30" : "#f0f0f0",
                        }}
                      >
                        <CustomText weight="bold" style={{ fontSize: 13, color: theme === "dark" ? "#555" : "#cccccc", marginRight: 12, width: 18, textAlign: "center" }}>{index + 1}</CustomText>
                        <View style={{ flex: 1 }}>
                          <CustomText
                            weight="bold"
                            style={{
                              color: theme === "dark" ? "#c9c9c9" : "#111111",
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
                            color: theme === "dark" ? "#04ecd5" : "#01e0c6",
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
