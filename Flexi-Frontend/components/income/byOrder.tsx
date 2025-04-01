import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIBill from "@/api/bill_api";
import { getMemberId } from "@/utils/utility";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BillCard from "../billCard";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";

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
    const date = new Date(item.purchaseAt).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as { [key: string]: Bill[] });
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

  const groupedBills = groupByDate(bills);
  const today = new Date().toISOString().split("T")[0];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
       className={`h-full ${useBackgroundColorClass()}`}>
      
        <FlatList
          data={Object.keys(groupedBills)}
          keyExtractor={(date) => date}
          renderItem={({ item: date }) => (
            <View>
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
                  cName={`${bill.cName} ${bill.cLastName}`}
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ByOrder;
