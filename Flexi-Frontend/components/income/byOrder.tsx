import React, { useEffect, useState} from "react";
import {
  View,
  Text,
  SafeAreaView,
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BillCard from "../billCard";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";
import { Ionicons } from "@expo/vector-icons";
import i18n from "@/i18n";

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
  product: string;
  payment: string;
  amount: number;
  platform: string;
  cashStatus: boolean;
  price: number;
  memberId: string;
  purchaseAt: Date;
  businessAcc: number;
  image: string;
  storeId: number;
};

// Group bills by date
const groupByDate = (items: Bill[]): { [key: string]: Bill[] } => {
  return items.reduce((groups, item) => {
    const purchaseDate = new Date(item.purchaseAt);
    const day = purchaseDate.getDate().toString().padStart(2, '0');
    const month = (purchaseDate.getMonth() + 1).toString().padStart(2, '0');
    const year = purchaseDate.getFullYear();
    const date = `${day}/${month}/${year}`;
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
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
  const isDesktop = Platform.OS === "web";

  // Table header text style
  const headerTextStyle: TextStyle = {
    fontWeight: "900" as "900", // or any other acceptable value
    fontSize: 13,
    color: theme === "dark" ? "#27272a" : "#4b5563",      
    fontFamily:
    i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
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

  const groupedBills = groupByDate(bills);
  const today = new Date().toISOString().split("T")[0];

  // Get border color based on platform
  const getBorderColor = (platform: string) => {
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
        return "#61fff2"; // Default color
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
        switch (platform) {
      case "Facebook":
        return <Ionicons name="logo-facebook" size={24} color="#1877f2" />;
      case "Tiktok":
        return <Ionicons name="logo-tiktok" size={24} color={theme === "dark" ? "#ffffff" : "#000000"} />;
      case "Line":
        return <Ionicons name="chatbubble-ellipses" size={24} color="#06c755" />;
      case "Shopee":
        return <Ionicons name="bag" size={24} color="#ee4d2d" />;
      default:
        return <Ionicons name="globe-outline" size={24} color="#61fff2" />;
    }
  };

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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: "100%" }}>
        <ScrollView horizontal={true}>
          <View style={{ paddingTop: 16, width: "100%" }}>
            <View className="flex flex-row border-b pb-2 mb-2"
              style={{
                borderColor: theme === "dark" ? "#444444" : "#e5e5e5",
              }}>
              <Text
                style={headerTextStyle}
                className={`w-40 `}
              >
                {t("income.table.date")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-48 `}
              >
                {t("income.table.customer")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-64 `}
              >
                {t("income.table.product")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-28 `}
              >
               {t("income.table.amount")}
              </Text>
              <Text
                style={headerTextStyle}
                className={`w-36 `}
              >
                {t("income.table.price")}
              </Text>
              
                <Text
                  style={headerTextStyle}
                  className={`w-20 `}
                >
                  {t("income.table.platform")}
                </Text>
              
              <Text
                style={headerTextStyle}
                className={`w-24 text-center`}
              >
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
                <View
                  key={bill.id}
                  className="flex flex-row border-b py-3"
                  style={{
                    borderColor: theme === "dark" ? "#444444" : "#e5e5e5"        
                  }}
                >
                  <Text
                    className={`${
                      theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                    } w-40`}
                  >
                    {formatDate(bill.purchaseAt.toString())}
                  </Text>
                  <Text
                    className={`${
                      theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                    } w-48`}
                    numberOfLines={1}
                  >
                    {bill.cName} {bill.cLastName}
                  </Text>
                  <Text
                    className={`${
                      theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                    } w-64`}
                    numberOfLines={1}
                  
                  >
                    {bill.product}
                  </Text>
                  <Text
                    className={`${
                      theme === "dark" ? "text-zinc-300" : "text-zinc-600"
                    } w-28`}
                  >
                    {bill.amount} {t("common.pcs")}
                  </Text>
                  <Text
                    className={`w-28 font-semibold`}
                    style={{ color: theme === "dark" ? "#04ecd5" : "#01e0c6" }}
                  >
                    +{bill.price}
                  </Text>
                  <View className={`w-28 flex items-center justify-center`}>
                    {getPlatformIcon(bill.platform)}
                  </View>
                  <View className="flex flex-row w-24 items-center justify-center">
                    <TouchableOpacity
                      onPress={() => handleDelete(bill.id)}
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
        data={Object.keys(groupedBills)}
        keyExtractor={(date) => date}
        renderItem={({ item: date }) => (
          <View
            style={{
              alignItems: Platform.OS === "web" ? "center" : "flex-start"}}>
            <Text
              className={`text-base font-bold ${
                theme === "dark" ? "text-zinc-400" : "text-zinc-600"
              } p-4`}
            >
              {date === today ? "Today" : date}
            </Text>

            {groupedBills[date].map((bill) => (
              <BillCard
                key={bill.id}
                id={bill.id}
                platform={bill.platform}
                product={bill.product}
                amount={bill.amount}
                cName={bill.cName}
                cLastName={bill.cLastName}
                ProductNameColor = {theme === "dark" ? "#e98103" : "#ffa718"}
                price={bill.price}
                purchaseAt={bill.purchaseAt}
                CardColor={theme === "dark" ? "#1d1d1d" : "#24232108"}
                onDelete={handleDelete}
                PriceColor={theme === "dark" ? "#04ecd5" : "#01e0c6"}
                cNameColor={theme === "dark" ? "#8c8c8c" : "#746f67"}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={() => (
          <CustomText className="pt-10 text-center text-white">{t("common.notfound")}</CustomText>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
        {isDesktop ? renderTableView() : renderCardView()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ByOrder;
