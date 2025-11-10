import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { getMemberId } from "@/utils/utility";
import CallAPIReport from "@/api/report_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { useLocalSearchParams, useRouter } from "expo-router";

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

export default function DailyDetail() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Theme classes - must be called at component level
  const backgroundColorClass = useBackgroundColorClass();
  const textColorClass = useTextColorClass();
  
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DailyCardProps | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const fetchDetailedReport = async () => {
      try {
        setLoadingDetails(true);
        const memberId = await getMemberId();
        
        if (memberId && params.date) {
          const details = await CallAPIReport.getDetailsEachDateAPI(memberId, params.date as string);
          setReportDetails(details);
          
          // Parse the selected item from params
          if (params.selectedItem) {
            const item = JSON.parse(params.selectedItem as string) as DailyCardProps;
            setSelectedItem(item);
          }
        }
      } catch (error) {
        console.error("Error fetching report details:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetailedReport();
  }, [params.date, params.selectedItem]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className={`flex-1  ${backgroundColorClass}`}>
      {/* Header */}
      <View className={`flex-row items-center justify-between p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>        
        <CustomText className={`text-lg font-bold ${textColorClass}`}>
          {`${t("daily.details")}  ${params.date}`}
        </CustomText>
        <View className="w-10" />
      </View>

      {loadingDetails ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#09b789" />
          <CustomText className={`mt-4 ${textColorClass}`}>
            {t("common.loading")}
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
                <CustomText className={`text-lg font-semibold mb-3 ${textColorClass}`}>
                  {`${t("daily.summary")}`}
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
              <View className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`}>
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
                        </View>
                      </View>

                      {/* Products List */}
                      {bill.product && bill.product.length > 0 && (
                        <View className={`rounded-md p-3 px-5 bg-${theme === "dark" ? "zinc-900" : "zinc-50"}`}>
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
              <View className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`}>
                <CustomText className={`text-lg font-semibold mb-3 ${textColorClass}`}>
                  {`${t("daily.expenses")} (${reportDetails.expenses.length})`}
                </CustomText>
                {reportDetails.expenses.length > 0 ? (
                  reportDetails.expenses.map((expense) => (
                    <View key={expense.id} className={`border-b pb-3 mb-3 ${theme === "dark" ? "border-zinc-700" : "border-zinc-200"}`}>
                      <View className="flex-row justify-between items-center mb-2">
                        <CustomText className={`font-medium ${textColorClass}`}>
                          {expense.sName}
                        </CustomText>
                        <CustomText className={`font-bold text-red-600`}>
                          {`${formatCurrency(expense.amount)}`}
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
              <View className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`}>
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
  );
}