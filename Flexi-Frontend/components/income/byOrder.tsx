import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIBill from "@/api/bill_api";
import { getMemberId } from "@/utils/utility";
import BillCard from "../billCard";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import i18n from "@/i18n";
import { router } from "expo-router";
import { getResponsiveStyles, isDesktop, isMobileWeb } from "@/utils/responsive";
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
    product : string;
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
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ByOrder = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  // Table header text style
  const headerTextStyle: TextStyle = {
   // fontWeight: "900" as "900", // or any other acceptable value
    fontSize:getResponsiveStyles().smallFontSize,
    color: theme === "dark" ? "#b4b4b5" : "#4b5563",
    fontFamily:
      i18n.language === "th" ? "IBMPlexSansThai-Regular" : "Poppins-Regular",
  };

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
  const handleUpdateDocumentType = async (billId: number, newDocumentType: string) => {
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
        const [day, month, year] = dateStr.split('/');
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
  const getDateGroupDisplayName = useCallback((dateKey: string) => {
    if (dateKey === "Future") {
      return t("common.future") || "Future";
    }
    
    // Check if it's today
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    const todayString = `${day}/${month}/${year}`;
    
    return dateKey === todayString ? (t("common.today") || "Today") : dateKey;
  }, [t]);

  // Get bills to display for a date group
  const getBillsToDisplay = useCallback((date: string, bills: Bill[]) => {
    if (date === "Future" && !showAllFuture) {
      return bills.slice(0, 1); // Show only first bill for Future group
    }
    return bills; // Show all bills for other groups
  }, [showAllFuture]);

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
              style={{ width: 20, height: 20, tintColor: "#8d8e8e" }}
            />
          ); // Default icon
      }
    },
    [theme]
  );

  // Render table view for desktop
  const renderTableView = () => {
    // Flatten grouped bills for table view
    const allBills = Object.values(groupedBills).flat();

    if (allBills.length === 0) {
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
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <ScrollView horizontal={true}>
          <View style={{ paddingTop: 16, width: "100%" }}>
            <View
              className="flex flex-row border-b pb-2 mb-2"
              style={{
                borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
              }}
            >
              <Text style={headerTextStyle} className={`w-40 `}>
                {t("income.table.date")}
              </Text>
              <Text style={headerTextStyle} className={`w-48 `}>
                {t("income.table.customer")}
              </Text>
              <Text style={headerTextStyle} className={`w-64 `}>
                {t("income.table.product")}
              </Text>
              <Text style={headerTextStyle} className={`w-28 `}>
                {t("income.table.amount")}
              </Text>
              <Text style={headerTextStyle} className={`w-36 `}>
                {t("income.table.price")}
              </Text>

              <Text style={headerTextStyle} className={`w-20 `}>
                {t("income.table.platform")}
              </Text>

              <Text style={headerTextStyle} className={`w-24 text-center`}>
                {t("income.table.delete")}
              </Text>
            </View>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={{ maxHeight: Dimensions.get("window").height * 0.8 }}
            >
              {allBills.map((bill) => (
                <TouchableOpacity
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
                    className="flex flex-row border-b py-3 items-center"
                    style={{
                      borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
                    }}
                  >
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-40`}
                      style={{
                        color: theme === "dark" ? "#b4b4b5" : undefined,
                      }}
                    >
                      {formatDate(bill.purchaseAt.toString())}
                    </Text>
                    <Text
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-48`}
                      style={{
                        color: theme === "dark" ? "#b4b4b5" : undefined,
                      }}
                      numberOfLines={1}
                    >
                      {bill.cName} {bill.cLastName}
                    </Text>
                    <CustomText
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-64`}
                      style={{
                        color: theme === "dark" ? "#b4b4b5" : undefined,
                       
                      }}
                     // numberOfLines={2}
                    >
                      {bill.product
                        ? bill.product.map((p) => p.product).join("\n")
                        : ""}
                    </CustomText>
                    <CustomText
                      className={`${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-28`}
                      style={{
                        color: theme === "dark" ? "#b4b4b5" : undefined,
                      }}
                    >
                      {bill.product
                        ? bill.product
                            .map((p) =>
                              p.unit
                                ? `${p.quantity} ${t(`product.unit.${p.unit}`)}`
                                : p.unit === "" || p.unit == null
                                ? ""
                                : `${p.quantity} ${t("common.pcs")}`
                            )
                            .join("\n ")
                        : ""}
                    </CustomText>
                    <Text
                      className={`${
                      theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                      } w-28 font-bold `}
                      style={{
                      color: theme === "dark" ? "#b4b4b5" : undefined,
                      }}
                    >
                      +{(bill.total).toLocaleString()}
                    </Text>
                    <View className={`w-28 flex items-center justify-center`}>
                      {getPlatformIcon(bill.platform)}
                    </View>
                    <View className="flex flex-row w-24 items-center justify-center">
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(bill.id);
                        }}
                        className="mr-3"
                      >
                        <Ionicons
                          name="trash"
                          size={20}
                          color={theme === "dark" ? "#4d4d4d" : "#9e9d9d"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
              alignItems: Platform.OS === "web" ? "center" : "flex-start",
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
                  marginHorizontal: 10,
                  marginBottom: 10,
                  borderRadius: 8,
                  opacity: 0.5, // Match the opacity of future bills
                }}
              >
                <Text
                  style={{
                    color: theme === "dark" ? "#04ecd5" : "#01e0c6",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {showAllFuture 
                    ? `${t("common.showLess") || "Show Less"}` 
                    : `${t("common.seeMore") || "See More"} (${groupedBills[date].length - 1} ${t("common.more") || "more"})`
                  }
                </Text>
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
};export default ByOrder;
