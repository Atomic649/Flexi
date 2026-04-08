import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIBill from "@/api/bill_api";
import { getMemberId } from "@/utils/utility";
import BillCard from "../billCard";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";
import SwipeableRow, { SwipeAction } from "../swipe/SwipeableRow";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  isDesktop,
  isMobileApp,
} from "@/utils/responsive";
import icons from "@/constants/icons";

type Bill = {
  id: number;
  createdAt: Date;
  updatedAt?: Date;
  cName: string;
  cLastName: string;
  cPhone: string;
  cGender: string;
  cAddress: string;
  cPostId: string;
  cProvince: string;
  payment: string;
  amount: number;
  cashStatus: boolean;
  total: number;
  memberId: string;
  purchaseAt?: Date;
  invoiceAt?: Date;
  quotationAt?: Date;
  businessAcc: number;
  image: string;
  platform:string;
  unit: string;
  discount: number;
  totalQuotation: number;
  totalInvoice?: number;
  flexiId?: string;
  invoiceId?: string;
  isSplitChild?: boolean;
  splitGroupId?: string;
  splitPercent?: number;
  splitPercentMax?: number;
  DocumentType?: string;
  product?: Array<{
    product: string;
    unitPrice: number;
    quantity: number;
    unit?: string;
  }>;
  project?: { id: number; name: string; description?: string };
};

type ByOrderProps = {
  refreshSignal?: number;
};

// Pick the relevant date based on DocumentType, with fallback to other available dates
const getRelevantDate = (item: Bill): Date | null => {
  let raw: Date | null | undefined;
  if (item.DocumentType === "Receipt") raw = item.purchaseAt;
  else if (item.DocumentType === "Invoice") raw = item.invoiceAt;
  else if (item.DocumentType === "Quotation") raw = item.quotationAt;

  // Fallback chain: try other date fields if primary is null/undefined
  const candidates = [raw, item.invoiceAt, item.quotationAt, item.purchaseAt, item.createdAt];
  for (const candidate of candidates) {
    if (candidate == null) continue;
    const d = new Date(candidate);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

// Group bills by date with future date handling
const groupByDate = (items: Bill[]): { [key: string]: Bill[] } => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const result = items.reduce((groups, item) => {
    const relevantDate = getRelevantDate(item);

    // Skip items with invalid/missing dates
    if (!relevantDate) {
      return groups;
    }

    const purchaseDate = new Date(relevantDate);
    purchaseDate.setHours(0, 0, 0, 0);

    let groupKey: string;

    if (purchaseDate > currentDate) {
      // Group all future dates under "Future"
      groupKey = "Future";
    } else {
      // Use normal date format for current and past dates
      const day = purchaseDate.getDate().toString().padStart(2, "0");
      const month = (purchaseDate.getMonth() + 1).toString().padStart(2, "0");
      const year = purchaseDate.getFullYear();
      groupKey = `${day}/${month}/${year}`;
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as { [key: string]: Bill[] });

  Object.keys(result).forEach((key) => {
    result[key].sort((a, b) => (getRelevantDate(b)?.getTime() ?? 0) - (getRelevantDate(a)?.getTime() ?? 0));
  });

  return result;
};

// Format date for display purposes
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const ByOrder = ({ refreshSignal = 0 }: ByOrderProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  const fetchBills = useCallback(async () => {
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIBill.getBillsAPI(memberId);
        setBills(Array.isArray(response) ? response : []);
      } else {
        console.error("Member ID is null");
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  }, []);

  // Call API to get bills
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useEffect(() => {
    fetchBills();
  }, [refreshSignal, fetchBills]);

  // Refresh bills
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchBills();
    } catch {
      // fetchBills handles errors
    }
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {};

  // Map parentFlexiId → children (split bills)
  const splitChildrenMap = useMemo(() => {
    const map: Record<string, Bill[]> = {};
    bills.forEach((bill) => {
      if (bill.isSplitChild && bill.splitGroupId) {
        if (!map[bill.splitGroupId]) map[bill.splitGroupId] = [];
        map[bill.splitGroupId].push(bill);
      }
    });
    return map;
  }, [bills]);

  // Only top-level (non-child) bills appear in the date groups
  const parentBills = useMemo(
    () => bills.filter((b) => !b.isSplitChild),
    [bills],
  );

  // Navigate to editBill — the split section is embedded there
  const handleSplitBill = useCallback((billId: number) => {
    router.push({
      pathname: "/editBill",
      params: { id: billId.toString() },
    });
  }, []);

  // Reset parent split back to Quotation
  const handleResetSplit = useCallback(
    async (billId: number) => {
      try {
        await CallAPIBill.resetParentSplitAPI(billId);
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIBill.getBillsAPI(memberId);
          setBills(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        console.error("Error resetting split:", error);
      }
    },
    [],
  );

  // Handle document type updates
  const handleUpdateDocumentType = async (
    billId: number,
    newDocumentType: string
  ) => {
    try {
      // Call the new efficient API to update only document type
      await CallAPIBill.updateDocumentTypeAPI(billId, newDocumentType);

      // Refresh all bills data from API to get updated totals and other fields
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIBill.getBillsAPI(memberId);
        setBills(Array.isArray(response) ? response : []);
      }

      console.log(`Bill ${billId} document type updated to ${newDocumentType}`);
    } catch (error) {
      console.error("Error updating document type:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleDuplicateBill = useCallback((billId: number) => {
    router.push({
      pathname: "/createBill",
      params: { duplicateId: billId.toString() },
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterPlatform, setFilterPlatform] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  // State to track expanded future bills
  const [showAllFuture, setShowAllFuture] = useState(false);

  // Track which split groups have children collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Auto-collapse groups where all children are Receipt (only for groups not yet manually toggled)
  useEffect(() => {
    setCollapsedGroups(prev => {
      const next = { ...prev };
      Object.entries(splitChildrenMap).forEach(([groupId, children]) => {
        if (!(groupId in prev)) {
          const allReceipt = children.length > 0 && children.every(c => c.DocumentType === 'Receipt');
          next[groupId] = allReceipt;
        }
      });
      return next;
    });
  }, [splitChildrenMap]);

  const handleToggleSplitChildren = useCallback((flexiId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [flexiId]: !prev[flexiId] }));
  }, []);

  // Apply all filters
  const filteredParentBills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return parentBills.filter((b) => {
      if (filterType !== "All" && b.DocumentType !== filterType) return false;
      if (filterPlatform !== "All" && b.platform !== filterPlatform) return false;
      if (q) {
        const name = `${b.cName ?? ""} ${b.cLastName ?? ""}`.toLowerCase();
        const phone = (b.cPhone ?? "").toLowerCase();
        const flexiId = (b.flexiId ?? "").toLowerCase();
        const d = getRelevantDate(b) ?? new Date(b.createdAt);
        const date = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
        if (!name.includes(q) && !phone.includes(q) && !flexiId.includes(q) && !date.startsWith(q)) return false;
      }
      return true;
    });
  }, [parentBills, filterType, filterPlatform, searchQuery]);

  // Create memoized grouped bills — only top-level (non-child) bills
  const groupedBills = useMemo(() => groupByDate(filteredParentBills), [filteredParentBills]);

  // Sort date groups chronologically
  const sortedDateGroups = useMemo(() => {
    const dateKeys = Object.keys(groupedBills);

    return dateKeys.sort((a, b) => {
      // Future group always comes first
      if (a === "Future") return -1;
      if (b === "Future") return 1;

      // Convert date strings to Date objects for comparison
      const parseDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split("/");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      };

      const dateA = parseDate(a);
      const dateB = parseDate(b);

      // Sort in descending order (most recent first)
      return dateB.getTime() - dateA.getTime();
    });
  }, [groupedBills]);

  const today = new Date().toISOString().split("T")[0];

  // Get display name for date group
  const getDateGroupDisplayName = useCallback(
    (dateKey: string) => {
      if (dateKey === "Future") {
        return t("common.future") || "Future";
      }

      // Check if it's today
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const year = currentDate.getFullYear();
      const todayString = `${day}/${month}/${year}`;

      return dateKey === todayString ? t("common.today") || "Today" : dateKey;
    },
    [t]
  );

  // Get bills to display for a date group
  const getBillsToDisplay = useCallback(
    (date: string, bills: Bill[]) => {
      if (date === "Future" && !showAllFuture) {
        return bills.slice(0, 1); // Show only first bill for Future group
      }
      return bills; // Show all bills for other groups
    },
    [showAllFuture]
  );

  // Check if a date is in the future
  const isDateInFuture = useCallback((date: Date) => {
    const billDate = new Date(date);
    const currentDate = new Date();
    // Set time to start of day for accurate comparison
    billDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return billDate > currentDate;
  }, []);

  // Get border color based on platform - memoized but updates when bills change
  const getBorderColor = useCallback((platform: string) => {
    switch (platform) {
      case "Facebook":
        return "#3c22ff";
      case "Tiktok":
        return "#424040";
      case "Line":
        return "#56ff56"; // Lemon green
      case "Shopee":
        return "#ff4000"; // Orange red
      default:
        return "#c5c7c7"; // Default color
    }
  }, []);

  // Get platform icon - memoized but updates when bills or theme changes
  const getPlatformIcon = useCallback(
    (platform: string) => {
      switch (platform) {
        case "Facebook":
          return <Ionicons name="logo-facebook" size={24} color="#1877f2" />;
        case "Tiktok":
          return (
            <Ionicons
              name="logo-tiktok"
              size={24}
              color={theme === "dark" ? "#ffffff" : "#000000"}
            />
          );
        case "Line":
          return (
            <Ionicons name="chatbubble-ellipses" size={24} color="#06c755" />
          );
        case "Shopee":
          return <Ionicons name="bag" size={24} color="#ee4d2d" />;
        default:
          return (
            <Image
              source={icons.shop}
              style={{ width: 16, height: 16, tintColor: "#989898" }}
            />
          ); // Default icon
      }
    },
    [theme]
  );

  // Render table view for desktop
  const renderTableView = () => {
    const hasBills = sortedDateGroups.length > 0;

    if (!hasBills) {
      return (
        <CustomText className="pt-10 text-center text-white">
          {t("common.notfound")}
        </CustomText>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          width: isDesktop() ? "80%" : "100%",
          alignSelf: "center",
          paddingHorizontal: 20,
        }}
      >
       
          <View
            className="flex flex-row border-b pb-2 mb-2"
            style={{
              backgroundColor: theme === "dark" ? "#1f1f1f" : "#f3f3f3",              
              borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
              paddingTop: 8,             

            }}
          >
            <CustomText style={{ flex: 1.5 }}>
              {t("income.table.date")}
            </CustomText>
            <CustomText style={{ flex: 2 }}>
              {t("income.table.customer")}
            </CustomText>
            <CustomText style={{ flex: 3 }}>
              {t("income.table.product")}
            </CustomText>
            <CustomText style={{ flex: 1 }}>
              {t("income.table.amount")}
            </CustomText>
            <CustomText style={{ flex: 1.5 }}>
              {t("income.table.price")}
            </CustomText>

            <CustomText
              style={{ flex: 0.8, textAlign: "center" }}
            >
              {t("income.table.platform")}
            </CustomText>

            <CustomText
              style={{ flex: 0.8, textAlign: "center" }}
            >
              {t("income.table.delete")}
            </CustomText>
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={{ maxHeight: Dimensions.get("window").height }}
          >
            {sortedDateGroups.map((dateKey) => {
              const groupBills = groupedBills[dateKey];
              const isFutureGroup = dateKey === "Future";
              const billsToRender = getBillsToDisplay(dateKey, groupBills);

              return (
                <View key={dateKey}>
                  {billsToRender.map((bill) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      key={bill.id}
                      onPress={() =>
                        router.push({
                          pathname: "/editBill",
                          params: { id: bill.id },
                        })
                      }
                      style={{
                        opacity: isDateInFuture(getRelevantDate(bill) ?? new Date(bill.createdAt)) ? 0.5 : 1,
                      }}
                    >
                      <View
                        className="flex flex-row border-b py-3"
                        style={{
                          borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
                        }}
                      >
                        <CustomText
                          style={{
                            flex: 1.5,
                          }}
                        >
                          {formatDate((getRelevantDate(bill) ?? new Date()).toISOString())}
                        </CustomText>
                        <CustomText
                          style={{
                            flex: 2,
                          }}
                          numberOfLines={1}
                        >
                          {bill.cName} {bill.cLastName}
                        </CustomText>
                        <CustomText
                          style={{
                            flex: 3,
                          }}
                        >
                          {bill.product
                            ? bill.product.map((p) => p.product).join("\n")
                            : ""}
                        </CustomText>
                        <CustomText
                          style={{
                            flex: 1,
                          }}
                        >
                          {bill.product
                            ? bill.product
                                .map((p) =>
                                  p.unit
                                    ? `${p.quantity} ${t(
                                        `product.unit.${p.unit}`
                                      )}`
                                    : p.unit === "" || p.unit == null
                                    ? ""
                                    : `${p.quantity} ${t("common.pcs")}`
                                )
                                .join("\n ")
                            : ""}
                        </CustomText>
                        <CustomText
                          className="font-bold"
                          style={{
                            flex: 1.5,
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            color: bill.DocumentType === "Receipt"
                              ? theme === "dark" ? "#04ecd5" : "#01e0c6"
                              : theme === "dark" ? "#7d7d7d" : "#9e9e9e",
                          }}
                        >
                          {bill.DocumentType === "Receipt"
                            ? `+${formatNumber(bill.total || 0)}`
                            : bill.DocumentType === "Invoice"
                            ? formatNumber(bill.totalInvoice || 0)
                            : formatNumber(bill.totalQuotation || 0)}
                        </CustomText>
                        <View
                          className={`flex items-center justify-center`}
                          style={{ flex: 0.8 }}
                        >
                          {getPlatformIcon(bill.platform)}
                        </View>
                        <View
                          className="flex flex-row items-center justify-center"
                          style={{ flex: 0.8 }}
                        >
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDelete(bill.id);
                            }}
                            className="mr-3"
                          >
                            <Ionicons
                              name="trash"
                              size={18}
                              color={theme === "dark" ? "#4d4d4d" : "#9e9d9d"}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {isFutureGroup && groupBills.length > 1 && (
                    <TouchableOpacity
                      onPress={() => setShowAllFuture(!showAllFuture)}
                      style={{
                        width: "100%",
                        padding: 15,
                        alignItems: "center",
                        backgroundColor:
                          theme === "dark" ? "#232425" : "#f5f5f5",
                        marginTop: 10,
                        marginBottom: 10,
                        borderRadius: 8,
                        opacity: 0.5,
                      }}
                    >
                      <CustomText
                        style={{
                          color: theme === "dark" ? "#04ecd5" : "#01e0c6",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        {showAllFuture
                          ? `${t("common.showLess") || "Show Less"}`
                          : `${t("common.seeMore") || "See More"} (${
                              groupBills.length - 1
                            } ${t("common.more") || "more"})`}
                      </CustomText>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        
      </View>
    );
  };

  // Render card view for mobile
  const renderCardView = () => {
    return (
      <FlatList
        data={sortedDateGroups}
        keyExtractor={(date) => date}
        renderItem={({ item: date }) => (
          <View
            style={{
              alignItems: "stretch",
            }}
          >
            <CustomText
              weight="medium"
              style={{ fontSize: 11, color: theme === "dark" ? "#555" : "#aaa", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}
            >
              {getDateGroupDisplayName(date)}
            </CustomText>

            {getBillsToDisplay(date, groupedBills[date]).map((bill) => {
              const children = bill.flexiId ? (splitChildrenMap[bill.flexiId] ?? []) : [];
              const isParentWithSplit = children.length > 0;
              const lineColor = theme === 'dark' ? '#04ecc1' : '#04ecc1';
              const dotColor = theme === 'dark' ? '#04ecc1' : '#04ecc1';
              return (
                <View key={bill.id} style={{ marginBottom: isParentWithSplit ? 10 : 2 }}>
                  <BillCard
                    id={bill.id}
                    platform={bill.platform}
                    product={bill.product}
                    project={bill.project}
                    amount={bill.amount}
                    cName={bill.cName}
                    cLastName={bill.cLastName}
                    total={bill.total}
                    totalQuotation={bill.totalQuotation}
                    totalInvoice={bill.totalInvoice}
                    purchaseAt={getRelevantDate(bill) ?? new Date(bill.createdAt)}
                    CardColor={theme === "dark" ? "#232425" : "#f6f6f6ff"}
                    onDelete={handleDelete}
                    PriceColor={theme === "dark" ? "#04ecd5" : "#01e0c6"}
                    cNameColor={theme === "dark" ? "#8c8c8c" : "#746f67"}
                    getBorderColor={getBorderColor(bill.platform)}
                    unit={undefined}
                    discount={bill.discount}
                    currentDocumentType={bill.DocumentType}
                    onUpdateDocumentType={isParentWithSplit ? undefined : handleUpdateDocumentType}
                    iconColor={theme === "dark" ? "#232425" : "#ffffff"}
                    onPress={() => router.push({ pathname: "/editBill", params: { id: bill.id } })}
                    onDuplicate={handleDuplicateBill}
                    isParentWithSplit={isParentWithSplit}
                    splitChildCount={children.length}
                    onSplit={!isParentWithSplit ? () => handleSplitBill(bill.id) : undefined}
                    onResetSplit={isParentWithSplit && bill.DocumentType !== "Receipt" ? () => handleResetSplit(bill.id) : undefined}
                    onToggleSplitChildren={isParentWithSplit && bill.flexiId ? () => handleToggleSplitChildren(bill.flexiId!) : undefined}
                  />

                  {/* Children with tree connector */}
                  {isParentWithSplit && !collapsedGroups[bill.flexiId ?? ''] && (
                    <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
                      <View style={{ width: 16 }} />

                      {/* Children list */}
                      <View style={{ flex: 1 }}>
                        {[...children].sort((a, b) => a.id - b.id).map((child, i) => {
                          const isLast = i === children.length - 1;
                          const childAmount =
                            child.DocumentType === 'Receipt'
                              ? Number(child.total ?? 0)
                              : child.DocumentType === 'Invoice'
                              ? Number(child.totalInvoice ?? 0)
                              : Number(child.totalQuotation ?? 0);
                          const statusColor =
                            child.DocumentType === 'Receipt'
                              ? theme === 'dark' ? '#04ecd5' : '#01e0c6'
                              : child.DocumentType === 'Invoice'
                              ? '#ffa12e'
                              : theme === 'dark' ? '#8c8c8c' : '#746f67';
                          const statusLabel =
                            child.DocumentType === 'Receipt'
                              ? t('bill.status.paid') || 'Paid'
                              : child.DocumentType === 'Invoice'
                              ? t('bill.status.waitingPayment') || 'Waiting'
                              : t('bill.status.waitingResponse') || 'Pending';
                          const childLeftActions: SwipeAction[] = [];
                          if (child.DocumentType !== 'Receipt') {
                            if (child.DocumentType !== 'Invoice') {
                              childLeftActions.push({
                                id: 'confirm',
                                text: t('bill.confirm') || 'Confirm',
                                backgroundColor: '#ff8c00',
                                textColor: theme === 'dark' ? '#1c1d1e' : '#ffffff',
                                onPress: () => handleUpdateDocumentType(child.id, 'Invoice'),
                              });
                            }
                            childLeftActions.push({
                              id: 'paid',
                              text: t('bill.paid') || 'Paid',
                              backgroundColor: theme === 'dark' ? '#04ecd5' : '#01e0c6',
                              textColor: theme === 'dark' ? '#1c1d1e' : '#ffffff',
                              onPress: () => handleUpdateDocumentType(child.id, 'Receipt'),
                            });
                          }
                          return (
                            <View key={child.id} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                              {/* Tree connector column */}
                              <View style={{ width: 16, alignItems: 'center' }}>
                                {/* Top half of vertical line — always shown */}
                                <View style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 5,
                                  width: 1.5,
                                  height: '50%',
                                  backgroundColor: lineColor,
                                }} />
                                {/* Bottom half — only if not last child */}
                                {!isLast && (
                                  <View style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 5,
                                    bottom: 0,
                                    width: 1.5,
                                    backgroundColor: lineColor,
                                  }} />
                                )}
                                {/* Horizontal arm */}
                                <View style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: 5,
                                  width: 10,
                                  height: 1.5,
                                  backgroundColor: lineColor,
                                }} />
                                {/* Dot */}
                                <View style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: 10,
                                  marginTop: -3,
                                  width: 6,
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: dotColor,
                                }} />
                              </View>

                              <View style={{ flex: 1 }}>
                                <SwipeableRow
                                  leftActions={childLeftActions}
                                  rightActions={[]}
                                  disabled={child.DocumentType === 'Receipt'}
                                  threshold={80}
                                  actionWidth={80}
                                  actionHeight="92%"
                                  actionBorderRadius={4}
                                >
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => router.push({ pathname: '/editBill', params: { id: child.id } })}
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      paddingVertical: 8,
                                      paddingHorizontal: 12,
                                      backgroundColor: theme === 'dark' ? '#1e1f20' : '#f2f2f2',
                                      borderRadius: 8,
                                      marginVertical: 3,
                                      borderWidth: 1,
                                      borderColor: theme === 'dark' ? '#2e2f30' : '#e8e8e8',
                                    }}
                                  >
                                    {/* Installment number */}
                                    <CustomText style={{ color: theme === 'dark' ? '#555' : '#bbb', fontSize: 11, width: 18 }}>
                                      {i + 1}.
                                    </CustomText>
                                    {/* % badge */}
                                    <View style={{
                                      paddingHorizontal: 7,
                                      paddingVertical: 2,
                                      borderRadius: 6,
                                      backgroundColor: '#04ecc112',
                                      borderWidth: 1,
                                      borderColor: '#04ecc135',
                                      marginRight: 10,
                                    }}>
                                      <CustomText style={{ color: '#04ecc1', fontSize: 11 }} weight="semibold">
                                        {Number(child.splitPercent).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                                      </CustomText>
                                    </View>
                                    {/* Amount */}
                                    <CustomText
                                      style={{
                                        flex: 1,
                                        color: statusColor,
                                        fontSize: 14,
                                        opacity: child.DocumentType === 'Receipt' ? 1 : 0.65,
                                      }}
                                      weight="semibold"
                                      numberOfLines={1}
                                    >
                                      {child.DocumentType === 'Receipt' ? '+' : ''}{formatNumber(childAmount)}
                                    </CustomText>
                                    {/* Status pill */}
                                    <View style={{
                                      paddingHorizontal: 8,
                                      paddingVertical: 3,
                                      borderRadius: 6,
                                      backgroundColor: statusColor + '18',
                                      borderWidth: 1,
                                      borderColor: statusColor + '40',
                                    }}>
                                      <CustomText style={{ color: statusColor, fontSize: 10 }} weight="semibold">
                                        {statusLabel}
                                      </CustomText>
                                    </View>
                                  </TouchableOpacity>
                                </SwipeableRow>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Show "See More" button for Future group */}
            {date === "Future" && groupedBills[date].length > 1 && (
              <TouchableOpacity
                onPress={() => setShowAllFuture(!showAllFuture)}
                style={{
                  width: "100%",
                  padding: 15,
                  alignItems: "center",
                  backgroundColor: theme === "dark" ? "#232425" : "#f5f5f5",
                  marginBottom: 10,
                  borderRadius: 8,
                  opacity: 0.5, // Match the opacity of future bills
                }}
              >
                <CustomText
                  style={{
                    color: theme === "dark" ? "#04ecd5" : "#01e0c6",
                  }}
                  weight="bold"
                >
                  {showAllFuture
                    ? `${t("common.showLess") || "Show Less"}`
                    : `${t("common.seeMore") || "See More"} (${
                        groupedBills[date].length - 1
                      } ${t("common.more") || "more"})`}
                </CustomText>
              </TouchableOpacity>
            )}
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
    );
  };

  const accent = theme === "dark" ? "#04ecd5" : "#01e0c6";
  const chipBg = theme === "dark" ? "#2a2b2c" : "#efefef";
  const chipBorder = theme === "dark" ? "#3a3b3c" : "#e0e0e0";
  const chipText = theme === "dark" ? "#aaaaaa" : "#666666";
  const inputBg = theme === "dark" ? "#1e1f20" : "#f5f5f5";
  const inputBorder = theme === "dark" ? "#333435" : "#e0e0e0";
  const placeholder = theme === "dark" ? "#555" : "#bbb";

  const renderChip = (
    chipKey: string,
    label: string,
    value: string,
    active: string,
    onPress: (v: string) => void,
    icon?: React.ReactNode,
  ) => {
    const isActive = active === value;
    return (
      <TouchableOpacity
        key={chipKey}
        onPress={() => onPress(value)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          height: 30,
          borderRadius: 20,
          backgroundColor: isActive ? accent : chipBg,
          borderWidth: 1,
          borderColor: isActive ? accent : chipBorder,
          marginRight: 6,
        }}
      >
        {icon}
        <CustomText
          style={{ fontSize: 12, color: isActive ? (theme === "dark" ? "#1c1d1e" : "#fff") : chipText }}
          weight={isActive ? "semibold" : "regular"}
        >
          {label}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const platformOptions = [
    { key: "All", label: t("common.all") || "All", icon: null },
    { key: "Facebook", label: "FB", icon: <Ionicons name="logo-facebook" size={13} color={filterPlatform === "Facebook" ? (theme === "dark" ? "#1c1d1e" : "#fff") : "#1877f2"} /> },
    { key: "Tiktok", label: "TT", icon: <Ionicons name="logo-tiktok" size={13} color={filterPlatform === "Tiktok" ? (theme === "dark" ? "#1c1d1e" : "#fff") : (theme === "dark" ? "#fff" : "#000")} /> },
    { key: "Line", label: "Line", icon: <Ionicons name="chatbubble-ellipses" size={13} color={filterPlatform === "Line" ? (theme === "dark" ? "#1c1d1e" : "#fff") : "#06c755"} /> },
    { key: "Shopee", label: "Shopee", icon: <Ionicons name="bag" size={13} color={filterPlatform === "Shopee" ? (theme === "dark" ? "#1c1d1e" : "#fff") : "#ee4d2d"} /> },
    { key: "Shop", label: t("bill.platform") || "Shop", icon: <Image source={icons.shop} style={{ width: 13, height: 13, tintColor: filterPlatform === "Shop" ? (theme === "dark" ? "#1c1d1e" : "#fff") : "#989898" }} /> },
  ];

  return (
    <View style={{ flex: 1 }} className={useBackgroundColorClass()}>
      {/* Header row: search + filter toggle + add */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, gap: 8 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: inputBg, borderRadius: 10, borderWidth: 1, borderColor: inputBorder, paddingHorizontal: 10, height: 38 }}>
          <Ionicons name="search" size={16} color={placeholder} style={{ marginRight: 6 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("common.searchBillHint") || "Search by name, phone, bill ID or date"}
            placeholderTextColor={placeholder}
            style={{ flex: 1, fontSize: 13, color: theme === "dark" ? "#ffffff" : "#333333", paddingVertical: 0, fontFamily: "IBMPlexSansThai-Medium" }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={placeholder} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters((v) => !v)}
          style={{
            width: 38, height: 38, borderRadius: 10,
            backgroundColor: showFilters || filterType !== "All" || filterPlatform !== "All" ? accent : chipBg,
            borderWidth: 1,
            borderColor: showFilters || filterType !== "All" || filterPlatform !== "All" ? accent : chipBorder,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={showFilters || filterType !== "All" || filterPlatform !== "All"
              ? (theme === "dark" ? "#1c1d1e" : "#fff")
              : (theme === "dark" ? "#aaaaaa" : "#666")}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/createBill")}
          style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: accent, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="add" size={22} color={theme === "dark" ? "#1c1d1e" : "#ffffff"} />
        </TouchableOpacity>
      </View>

      {/* Filter chips — shown only when toggled */}
      {showFilters && (
        <View style={{ height: 46 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, alignItems: "center", height: 46 }}>
            {(["All", "Quotation", "Invoice", "Receipt"] as const).map((key) =>
              renderChip(
                `doc-${key}`,
                key === "All" ? (t("common.all") || "All") : key === "Quotation" ? (t("bill.quotation") || "Quotation") : key === "Invoice" ? (t("bill.invoice") || "Invoice") : (t("bill.receipt") || "Receipt"),
                key, filterType, setFilterType,
              )
            )}
            <View style={{ width: 1, height: 18, backgroundColor: chipBorder, marginHorizontal: 6 }} />
            {platformOptions.map((p) => renderChip(`plat-${p.key}`, p.label, p.key, filterPlatform, setFilterPlatform, p.icon ?? undefined))}
          </ScrollView>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {isDesktop() ? renderTableView() : renderCardView()}
      </View>
    </View>
  );
};
export default ByOrder;
