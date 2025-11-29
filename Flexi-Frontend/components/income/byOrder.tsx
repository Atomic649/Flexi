import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIBill from "@/api/bill_api";
import { getMemberId } from "@/utils/utility";
import BillCard from "../billCard";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";
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
  platform: string;
  cashStatus: boolean;
  total: number;
  memberId: string;
  purchaseAt: Date;
  businessAcc: number;
  image: string;
  storeId: number;
  unit: string;
  discount: number;
  totalQuotation: number;
  DocumentType?: string; // Add DocumentType field
  product?: Array<{
    product: string;
    unitPrice: number;
    quantity: number;
    unit?: string;
  }>;
};

// Group bills by date with future date handling
const groupByDate = (items: Bill[]): { [key: string]: Bill[] } => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  return items.reduce((groups, item) => {
    const purchaseDate = new Date(item.purchaseAt);
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
};

// Format date for display purposes
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const ByOrder = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  // Call API to get bills
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIBill.getBillsAPI(memberId);
          setBills(response);
        } else {
          console.error("Member ID is null");
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    fetchBills();
  }, []);

  // Refresh bills
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIBill.getBillsAPI(memberId);
        setBills(response);
      } else {
        console.error("Member ID is null");
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {};

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
        setBills(response);
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

  // State to track expanded future bills
  const [showAllFuture, setShowAllFuture] = useState(false);

  // Create memoized grouped bills to ensure data is always fresh
  const groupedBills = useMemo(() => groupByDate(bills), [bills]);

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
                        opacity: isDateInFuture(bill.purchaseAt) ? 0.5 : 1,
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
                          {formatDate(bill.purchaseAt.toString())}
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
                            color: bill.total <= 0
                              ? theme === "dark"
                                ? "#7d7d7d27"
                                : "#7d7d7d27"
                              : theme === "dark"
                              ? "#04ecd5"
                              : "#01e0c6",
                          }}
                        >
                          {bill.total <= 0
                            ? bill.totalQuotation.toLocaleString()
                            : `${bill.total.toLocaleString()}`}
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
              alignItems: isMobileApp() ? "flex-start" : "center",
            }}
          >
            <Text
              className={`text-base font-bold ${
                theme === "dark" ? "text-zinc-400" : "text-zinc-600"
              } p-4`}
            >
              {getDateGroupDisplayName(date)}
            </Text>

            {getBillsToDisplay(date, groupedBills[date]).map((bill) => (
              <BillCard
                key={bill.id}
                id={bill.id}
                platform={bill.platform}
                product={bill.product}
                amount={bill.amount}
                cName={bill.cName}
                cLastName={bill.cLastName}
                total={bill.total}
                totalQuotation={bill.totalQuotation}
                purchaseAt={bill.purchaseAt}
                CardColor={theme === "dark" ? "#232425" : "#f6f6f6ff"}
                onDelete={handleDelete}
                PriceColor={theme === "dark" ? "#04ecd5" : "#01e0c6"}
                cNameColor={theme === "dark" ? "#8c8c8c" : "#746f67"}
                getBorderColor={getBorderColor(bill.platform)}
                unit={undefined} // Don't pass bill.unit, let BillCard handle per-product unit
                discount={bill.discount}
                currentDocumentType={bill.DocumentType}
                onUpdateDocumentType={handleUpdateDocumentType}
                iconColor={theme === "dark" ? "#232425" : "#ffffff"}
                onPress={() =>
                  router.push({
                    pathname: "/editBill",
                    params: { id: bill.id },
                  })
                }
                onDuplicate={handleDuplicateBill}
              />
            ))}

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

  return (
    <View className={`h-full ${useBackgroundColorClass()}`}>
      <TouchableOpacity
        style={{
          position: "static",
          backgroundColor: theme === "dark" ? "#302f2f00" : "#ffffff",
          borderRadius: 12,
          padding: 10,
          elevation: 5,
        }}
        onPress={() => {
          router.push("/createBill");
        }}
        activeOpacity={1}
      >
        <Ionicons
          name="add"
          size={24}
          style={{
            alignSelf: "center",
          }}
          color={theme === "dark" ? "#ffffff" : "#444541"}
        />
      </TouchableOpacity>
      {isDesktop() ? renderTableView() : renderCardView()}
    </View>
  );
};
export default ByOrder;
