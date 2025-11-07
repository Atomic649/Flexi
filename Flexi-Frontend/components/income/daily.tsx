import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { getMemberId } from "@/utils/utility";
import CallAPIReport from "@/api/report_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DailyCard from "../DailyCard";
import { CustomText } from "../CustomText";
import i18n from "@/i18n";
import { isMobile } from "@/utils/responsive";
import { useMarketing } from "@/providers/MarketingProvider";
import { getResponsiveStyles } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";


// Function to format numbers for display, handling the large values properly
const formatNumberDisplay = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};

type DailyCardProps = {
  date: string;
  amount: number;
  sale: number;
  adsCost: number;
  profit: number;
  percentageAds: number;
  ROI: number;
  expenses: number;
};

type ProductDetail = {
  product: string;
  quantity: number;
  unitPrice: number;
  unitDiscount: number;
  unit: string;
};

type BillDetail = {
  billId: string;
  purchaseAt: string;
  total: number;
  discount: number;
  billLevelDiscount: number;
  beforeDiscount: number;
  product: ProductDetail[];
};

type ExpenseDetail = {
  id: string;
  date: string;
  amount: number;
  note?: string;
  sName?: string;
  desc?: string;
  image?: string;
};

type AdsDetail = {
  id: string;
  date: string;
  adsCost: number;
  platform: {
    platform: string;
    accName: string;
  };
};

type ReportDetails = {
  bills: BillDetail[];
  expenses: ExpenseDetail[];
  ads: AdsDetail[];
};

const Daily = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { marketingPreference } = useMarketing();
  
  // Theme classes - must be called at component level
  const backgroundColorClass = useBackgroundColorClass();
  const textColorClass = useTextColorClass();
  
  const [refreshing, setRefreshing] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyCardProps[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DailyCardProps | null>(null);
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Generate dates starting from today going backwards
  const generateDates = (days: number = 30) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
    return dates;
  };

  // Merge backend data with generated dates
  const mergeDataWithDates = (backendData: DailyCardProps[], generatedDates: string[]) => {
    const dataMap = new Map(backendData.map(item => [item.date, item]));
    
    return generatedDates.map(date => {
      const existingData = dataMap.get(date);
      return existingData || {
        date,
        amount: 0,
        sale: 0,
        adsCost: 0,
        profit: 0,
        percentageAds: 0,
        ROI: 0,
        expenses: 0,
      };
    });
  };

  // Call API to get daily data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIReport.getDailyReportsAPI(memberId);
          // Generate dates and merge with backend data
          const generatedDates = generateDates(30); // Show last 30 days
          const mergedData = mergeDataWithDates(response || [], generatedDates);
          setDailyReport(mergedData);
        } else {
          console.log("Member ID is null");
          // Even without member ID, show dates with zero values
          const generatedDates = generateDates(30);
          const emptyData = mergeDataWithDates([], generatedDates);
          setDailyReport(emptyData);
        }
      } catch (error) {
        console.error("Error fetching reports", error);
        // On error, still show dates with zero values
        const generatedDates = generateDates(30);
        const emptyData = mergeDataWithDates([], generatedDates);
        setDailyReport(emptyData);
      }
    };
    fetchReport();
  }, [marketingPreference]); // Add marketingPreference to dependency array

  // Refetch data when refreshing
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const memberId = await getMemberId();
      if (memberId) {
        const response = await CallAPIReport.getDailyReportsAPI(memberId);
        // Generate dates and merge with backend data
        const generatedDates = generateDates(30); // Show last 30 days
        const mergedData = mergeDataWithDates(response || [], generatedDates);
        setDailyReport(mergedData);
      } else {
        console.error("Member ID is null");
        // Even without member ID, show dates with zero values
        const generatedDates = generateDates(30);
        const emptyData = mergeDataWithDates([], generatedDates);
        setDailyReport(emptyData);
      }
    } catch (error) {
      console.error("Error fetching reports", error);
      // On error, still show dates with zero values
      const generatedDates = generateDates(30);
      const emptyData = mergeDataWithDates([], generatedDates);
      setDailyReport(emptyData);
    }
    setRefreshing(false);
  };

  const handleItemPress = async (item: DailyCardProps) => {
    setSelectedItem(item);
    setLoadingDetails(true);
    setModalVisible(true);
    
    try {
      const memberId = await getMemberId();
      if (memberId) {
        const details = await CallAPIReport.getDetailsEachDateAPI(memberId, item.date);
        setReportDetails(details);
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
      // You might want to show an error message to the user
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setReportDetails(null);
    setSelectedItem(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Adjust front size and color of Title Table
  const textStyle = {
    fontSize: getResponsiveStyles().smallFontSize,
    color: isMobile() ? theme === "dark" ? "#27272a" : "#4b5563": theme === "dark" ? "#b4b4b5" : "#4b5563",
    //fontWeight: "900" as "900", // or any other acceptable value
    fontFamily:
      i18n.language === "th" ? "IBMPlexSansThai-Regular" : "Poppins-Regular",
  };

  const tableColor = theme === "dark" ? "#29292a00" : "#fcfcfc00";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        className={`h-full ${backgroundColorClass}`}
        style={{
          width: Dimensions.get("window").width > 768  ? "60%" : "100%",
          maxWidth: 800,
          alignSelf: "center",
         // paddingTop: Platform.OS === "web" ? "1.5%":0
        }}
      >
        <View
          className={`flex flex-col items-end `}
         style={{
                     backgroundColor:
                       Platform.OS === "web"
                   ? "transparent"
                   : theme === "dark"
                   ? "#adacac"
                   : "#d0cfcb",
                   borderBottomWidth: 1,
                   borderColor: theme === "dark" ? "#27272a" : "#e5e7eb",
                   }}
        >
          <View
            className="flex flex-row m-3 items-start justify-evenly w-full pl-5 "
            style={{
              marginHorizontal: 10,
            }}
          >
            <View className="flex flex-col items-start  w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.date")}
              </Text>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.amount")}
              </Text>
            </View>

            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={3}>
                {t("income.table.sales")}
              </Text>
            </View>

            {marketingPreference !== "organic" && (
              <View className="flex flex-col items-center w-1/6">
                <Text style={textStyle} numberOfLines={1}>
                  {t("income.table.adCost")}
                </Text>
              </View>
            )}

            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                + / -
              </Text>
            </View>
              {marketingPreference !== "organic" && (
            <View className="flex flex-col items-center w-1/6">
              <Text style={textStyle} numberOfLines={1}>
                {t("income.table.percentAd")}
              </Text>
            </View>
            )}
          </View>
        </View>

        <FlatList
          data={dailyReport}
          keyExtractor={(item) => item.date.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
              <DailyCard
                date={item.date}
                amount={item.amount}
                sale={formatNumberDisplay(item.sale)}
                adsCost={formatNumberDisplay(item.adsCost)}
                profit={formatNumberDisplay(item.profit)}
                percentageAds={item.percentageAds}
                ROI={item.ROI}
                tableColor={tableColor}
                broaderColor={
                  theme === "dark" ? "border-teal-900" : "border-gray-100"
                }
                marketingPreference={marketingPreference}
              />
            </TouchableOpacity>
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
      </View>
      
      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View className={`flex-1 mt-10 ${backgroundColorClass}`}>
          {/* Header */}
          <View className={`flex-row items-center justify-between p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <TouchableOpacity onPress={handleCloseModal} className="p-2">
              <CustomText className={`${textColorClass} text-lg`}>←</CustomText>
            </TouchableOpacity>
            <CustomText className={`text-lg font-bold ${textColorClass}`}>{`${t("daily.details")} - ${selectedItem?.date}`}
            </CustomText>
            <View className="w-10" />
          </View>

          {loadingDetails ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#09b789" />
              <CustomText className={`mt-4 ${textColorClass}`}>
                {t("common.loading")}...
              </CustomText>
            </View>
          ) : (
            <ScrollView className="flex-1 p-4">
              {/* Summary Section */}
              {selectedItem && (() => {
                // Calculate expenses from detailed data if available, otherwise use selectedItem.expenses (which will be 0)
                const calculatedExpenses = reportDetails 
                  ? reportDetails.expenses.reduce((sum, expense) => sum + expense.amount, 0)
                  : selectedItem.expenses || 0;
                
                // Recalculate profit using detailed data
                const calculatedAds = reportDetails 
                  ? reportDetails.ads.reduce((sum, ad) => sum + ad.adsCost, 0)
                  : selectedItem.adsCost;
                
                const calculatedSales = reportDetails 
                  ? reportDetails.bills.reduce((sum, bill) => sum + bill.total, 0)
                  : selectedItem.sale;
                  
                const recalculatedProfit = calculatedSales - calculatedExpenses;

                return (
                  <View className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`}>
                    <CustomText className={`text-lg font-semibold mb-3 ${textColorClass}`}>{`${t("daily.summary")}`}
                    </CustomText>
                    <View className="space-y-2">
                      <View className="flex-row justify-between">
                        <CustomText className={textColorClass}>{`${t("daily.sale")} :`}</CustomText>
                        <CustomText className={`font-semibold ${textColorClass}`}>
                          {formatCurrency(calculatedSales)}
                        </CustomText>
                      </View>
                      <View className="flex-row justify-between">
                        <CustomText className={textColorClass}>{`${t("daily.adsCost")} :`}</CustomText>
                        <CustomText className={`font-semibold text-orange-600`}>
                          {`-${formatCurrency(calculatedAds)}`}
                        </CustomText>
                      </View>
                      <View className="flex-row justify-between">
                        <CustomText className={textColorClass}>{`${t("daily.expenses")} :`}</CustomText>
                        <CustomText className={`font-semibold text-red-600`}>
                          {`-${formatCurrency(calculatedExpenses)}`}
                        </CustomText>
                      </View>
                      <View className={`flex-row justify-between border-t pt-2 ${theme === "dark" ? "border-zinc-600" : "border-zinc-300"}`}>
                        <CustomText className={`font-bold ${textColorClass}`}>{`${t("daily.profit")} :`}</CustomText>
                        <CustomText className={`font-bold ${recalculatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(recalculatedProfit)}
                        </CustomText>
                      </View>
                    </View>
                  </View>
                );
              })()}


              {/* Bills Section */}
              {reportDetails && (
                <>
                  <View className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-50"}`}>
                    <CustomText className={`text-lg font-semibold mb-3 ${textColorClass}`}>
                      {`${t("daily.bills")} (${reportDetails.bills.length})`}
                    </CustomText>
                    {reportDetails.bills.length > 0 ? (
                      reportDetails.bills.map((bill) => (
                        <View key={bill.billId} className={`border-b pb-4 mb-4 ${theme === "dark" ? "border-zinc-700" : "border-zinc-200"}`}>
                          {/* Bill Header */}
                          <View className="flex-row justify-between items-center mb-2">
                            <CustomText className={`font-bold ${textColorClass}`}>
                              {`#${String(bill.billId)}`}
                            </CustomText>
                            <CustomText className={`font-bold text-lg ${textColorClass}`}>
                              {formatCurrency(bill.total - bill.discount)}
                            </CustomText>
                          </View>
                          
                          {/* Bill Info */}
                          <View className="flex-row justify-between items-center mb-3">
                            <CustomText className={`text-sm ${textColorClass} opacity-70`}>
                              {new Date(bill.purchaseAt).toLocaleTimeString('th-TH')}
                            </CustomText>
                            <View className="flex-row space-x-4">
                              <CustomText className={`text-sm ${textColorClass}`}>
                                {`${bill.product?.length || 0} items`}
                              </CustomText>
                              {/* {bill.discount > 0 && (
                                <CustomText className="text-sm text-green-600">
                                  {`-${formatCurrency(bill.discount)}`}
                                </CustomText>
                              )} */}
                            </View>
                          </View>

                          {/* Products List */}
                          {bill.product && bill.product.length > 0 && (
                            <View className={`rounded-md p-3 px-5 bg-${theme === "dark" ? "zinc-900" : "zinc-100"}`}>
                              {bill.product.map((product, index) => {
                                const itemTotal = (product.quantity * product.unitPrice) - product.unitDiscount;
                                return (
                                  <View key={index} className="mb-1 last:mb-0">
                                    <View className="flex-row justify-between items-start">
                                      <View className="flex-1 mr-2 ">
                                        <CustomText className={`text-sm font-medium ${textColorClass}`}>
                                          {product.product}
                                        </CustomText>
                                        <View className="flex-row items-center mt-1">
                                          <CustomText className={`text-xs ${textColorClass} opacity-60`}>
                                            {`${product.quantity} ${product.unit} × ${formatCurrency(product.unitPrice)}`}
                                          </CustomText>
                                          {product.unitDiscount > 0 && (
                                            <CustomText className="text-xs  ml-2"
                                            style={{ color: '#e33201a2' }}>
                                              {`-${formatCurrency(product.unitDiscount)}`}
                                            </CustomText>
                                          )}
                                        </View>
                                      </View>
                                      <CustomText className={`text-sm font-semibold ${textColorClass}`}>
                                        {formatCurrency(itemTotal)}
                                      </CustomText>
                                    </View>
                                  </View>
                                );
                              })}                              
                             
                            </View>
                          )}
                        </View>
                      ))
                    ) : (
                      <CustomText className={`text-center ${textColorClass} opacity-70`}>
                        {t("common.notfound")}
                      </CustomText>
                    )}
                  </View>

                  {/* Expenses Section */}
                  <View className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-50"}`}>
                    <CustomText className={`text-lg font-semibold mb-3 ${textColorClass}`}>
                      {`${t("daily.expenses")} (${reportDetails.expenses.length})`}
                    </CustomText>
                    {reportDetails.expenses.length > 0 ? (
                      reportDetails.expenses.map((expense) => (
                        <View key={expense.id} className={`border-b pb-3 mb-3 ${theme === "dark" ? "border-zinc-700" : "border-zinc-200"}`}>
                          <View className="flex-row justify-between items-center mb-2">
                            <CustomText className={`font-medium ${textColorClass}`}>
                              {expense.sName  }
                            </CustomText>
                            <CustomText className={`font-bold text-red-600`}>{`${formatCurrency(expense.amount)}`}
                            </CustomText>
                          </View>
                          {(expense.desc || expense.note) && (
                            <CustomText className={`text-sm ${textColorClass} opacity-70`}>
                              {expense.desc || expense.note}
                            </CustomText>
                          )}
                          <CustomText className={`text-sm ${textColorClass} opacity-70`}>
                            {new Date(expense.date).toLocaleTimeString('th-TH')}
                          </CustomText>
                        </View>
                      ))
                    ) : (
                      <CustomText className={`text-center ${textColorClass} opacity-70`}>
                        {t("common.notfound")}
                      </CustomText>
                    )}
                  </View>

                  {/* Ads Cost Section */}
                  <View className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-50"}`}>
                    <CustomText className={`text-lg font-semibold mb-3 ${textColorClass}`}>
                      {`${t("daily.adsCost")} (${reportDetails.ads?.length || 0})`}
                    </CustomText>
                    {reportDetails.ads && reportDetails.ads.length > 0 ? (
                      reportDetails.ads.map((ad) => (
                        <View key={ad.id} className={`border-b pb-3 mb-3 ${theme === "dark" ? "border-zinc-700" : "border-zinc-200"}`}>
                          <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-1">
                              <CustomText className={`font-medium ${textColorClass}`}>
                                {ad.platform.platform}
                              </CustomText>
                              <CustomText className={`text-sm ${textColorClass} opacity-70`}>
                                {ad.platform.accName}
                              </CustomText>
                            </View>
                            <CustomText className={`font-bold text-orange-600`}>
                              {formatCurrency(ad.adsCost)}
                            </CustomText>
                          </View>
                          <CustomText className={`text-sm ${textColorClass} opacity-70`}>
                            {new Date(ad.date).toLocaleTimeString('th-TH')}
                          </CustomText>
                        </View>
                      ))
                    ) : (
                      <CustomText className={`text-center ${textColorClass} opacity-70`}>
                        {t("common.notfound")}
                      </CustomText>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

export default Daily;
