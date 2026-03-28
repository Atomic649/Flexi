import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { getMemberId } from "@/utils/utility";
import CallAPIReport from "@/api/report_api";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { isDesktop } from "@/utils/responsive";

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
  product: number;
  productList?: { name: string };
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
  expNo: string;
  date: string;
  amount: number;
  debtAmount?: number;
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
    accId?: string;
    campaignId?: string;
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

  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(
    null,
  );
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DailyCardProps | null>(null);
  const [showAllBills, setShowAllBills] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showAllAds, setShowAllAds] = useState(false);

  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formattedNumber} ฿`;
  };

  useEffect(() => {
    const fetchDetailedReport = async () => {
      try {
        setLoadingDetails(true);
        const memberId = await getMemberId();

        if (memberId && params.date) {
          const details = await CallAPIReport.getDetailsEachDateAPI(
            memberId,
            params.date as string,
          );
          setReportDetails(details);

          // Parse the selected item from params
          if (params.selectedItem) {
            const item = JSON.parse(
              params.selectedItem as string,
            ) as DailyCardProps;
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

  // Navigate to print screen with billId to open Invoice Details Modal
  const handlePressBillId = (billId: string) => {
    // Push to /print and pass billId as query param
    router.push(`/print?billId=${encodeURIComponent(String(billId))}`);
  };

  // Navigate to expense detail screen
  const handlePressExpNo = (expense: ExpenseDetail) => {
    router.push({
      pathname: "/expenseDetailScreen",
      params: {
        id: String(expense.id),
        date: expense.date,
        expenses: String(expense.amount),
        note: expense.note ?? "",
        desc: expense.desc ?? "",
        image: expense.image ?? "",
        type: "expense",
      },
    });
  };

  return (
    <View
      className={`flex-1  ${backgroundColorClass}`}
      style={{
        width: isDesktop() ? "60%" : "100%",
        maxWidth: 900,
        alignSelf: "center",
      }}
    >
      {/* Header */}
      <View
        className={`flex-row items-center justify-center p-4 border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <Text
          className={`text-lg font-bold ${textColorClass}`}
          style={{ color: theme === "dark" ? "#d4d4d8" : "#27272a" }}
        >
          {(() => {
            const date = new Date(params.date as string);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
          })()}
        </Text>
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
          {selectedItem &&
            (() => {
              // Calculate expenses from detailed data if available, otherwise use selectedItem.expenses (which will be 0)
              const calculatedExpenses = reportDetails
                ? reportDetails.expenses
                    .filter(
                      (expense) =>
                        !(Number(expense.debtAmount ?? 0) > 0),
                    )
                    .reduce(
                      (sum, expense) => sum + Number(expense.amount),
                      0,
                    )
                : selectedItem.expenses || 0;

              // Recalculate profit using detailed data
              const calculatedAds = reportDetails
                ? reportDetails.ads.reduce(
                    (sum, ad) => sum + Number(ad.adsCost),
                    0,
                  )
                : selectedItem.adsCost;

              const calculatedSales = reportDetails
                ? reportDetails.bills.reduce(
                    (sum, bill) => sum + Number(bill.total),
                    0,
                  )
                : selectedItem.sale;

              const recalculatedProfit = calculatedSales - calculatedExpenses;

              return (
                <View
                  className={`rounded-lg p-4 mb-4 ${
                    theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                  }`}
                >
                  <CustomText
                    className={`text-lg font-semibold mb-3 ${textColorClass}`}
                    weight="bold"
                  >
                    {`${t("daily.summary")}`}
                  </CustomText>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <CustomText className={textColorClass}>{`${t(
                        "daily.sale",
                      )} :`}</CustomText>
                      <Text className={`font-semibold ${textColorClass}`}>
                        {formatCurrency(calculatedSales)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <CustomText className={textColorClass}>{`${t(
                        "daily.expenses",
                      )} :`}</CustomText>
                      <Text className={`font-semibold text-[#ef4444]`}>
                        {`-${formatCurrency(calculatedExpenses)}`}
                      </Text>
                    </View>
                    <View className="flex-row pl-5 justify-between">
                      <CustomText className={textColorClass}>{`${t(
                        "daily.adsCost",
                      )} :`}</CustomText>
                      <Text
                        className={`font-semibold `}
                        style={{
                          color: theme === "dark" ? "#d4d4d8" : "#27272a",
                        }}
                      >
                        {`${formatCurrency(calculatedAds)}`}
                      </Text>
                    </View>
                    <View
                      className={`flex-row justify-between border-t pt-2 ${
                        theme === "dark" ? "border-zinc-600" : "border-zinc-300"
                      }`}
                    >
                      <CustomText
                        className={`font-bold ${textColorClass}`}
                      >{`${t("daily.profit")} :`}</CustomText>
                      <Text
                        className={`font-bold `}
                        style={{
                          color:
                            recalculatedProfit >= 0 ? "#10b981" : "#ef4444",
                        }}
                      >
                        {formatCurrency(recalculatedProfit)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })()}

          {/* Bills Section */}
          {reportDetails && (
            <>
              <View
                className={`rounded-lg p-4 mb-4 ${
                  theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <CustomText
                  className={`text-lg font-semibold mb-3 ${textColorClass}`}
                  weight="bold"
                >
                  {`${t("daily.bills")} (${reportDetails.bills.length})`}
                </CustomText>
                {reportDetails.bills.length > 0 ? (
                  <>
                    {(showAllBills
                      ? reportDetails.bills
                      : reportDetails.bills.slice(0, 5)
                    ).map((bill) => (
                      <View
                        key={bill.billId}
                        className={`border-b pb-4 mb-1 ${
                          theme === "dark"
                            ? "border-zinc-700"
                            : "border-zinc-200"
                        }`}
                      >
                        {/* Bill Info */}
                        <View className="flex-row justify-between items-center mb-2">
                          <Text
                            className={`text-sm ${textColorClass} opacity-70`}
                          >
                            {new Date(bill.purchaseAt).toLocaleTimeString(
                              "th-TH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              },
                            )}
                          </Text>
                        </View>

                        {/* Bill Header */}
                        <View className="flex-row justify-between items-center mb-1">
                          <TouchableOpacity
                            onPress={() =>
                              handlePressBillId(String(bill.billId))
                            }
                            activeOpacity={0.7}
                          >
                            <CustomText
                              className={`font-bold text-sm pt-1 px-1 ${textColorClass}
                           `}
                              style={{
                                backgroundColor:
                                  theme === "dark" ? "#1f2937" : "#dededd",
                              }}
                            >
                              {`#${String(bill.billId)}`}
                            </CustomText>
                          </TouchableOpacity>
                          <Text
                            className={`font-bold text-base ${textColorClass}`}
                            style={{
                              color: theme === "dark" ? "#d4d4d8" : "#27272a",
                            }}
                          >
                            {formatCurrency(bill.total)}
                          </Text>
                        </View>

                        {/* Products List */}
                        {bill.product && bill.product.length > 0 && (
                          <View className={`rounded-md`}>
                            {bill.product.map((product, index) => {
                              const itemTotal =
                                product.quantity * product.unitPrice -
                                product.unitDiscount;
                              return (
                                <View key={index} className="mb-1 last:mb-0">
                                  <View className="flex-row justify-between items-start">
                                    <View className="flex-1 mr-2 ">
                                      <CustomText
                                        className={`text-sm font-medium ${textColorClass}`}
                                        style={{
                                          color:
                                            theme === "dark"
                                              ? "#d4d4d8"
                                              : "#656565",
                                        }}
                                      >
                                        {product.productList?.name ??
                                          product.product}
                                      </CustomText>
                                      <View className="flex-row items-center ">
                                        <Text
                                          className={`text-xs opacity-60`}
                                          style={{
                                            color:
                                              theme === "dark"
                                                ? "#a1a1aa"
                                                : "#7c7c7c",
                                          }}
                                        >
                                          {`${product.quantity} ${
                                            product.unit
                                          } × ${formatCurrency(
                                            product.unitPrice,
                                          )}`}
                                        </Text>
                                        {product.unitDiscount > 0 && (
                                          <Text
                                            className="text-xs text-bold ml-2"
                                            style={{ color: "#e33201a2" }}
                                          >
                                            {`-${formatCurrency(
                                              product.unitDiscount,
                                            )}`}
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                    <Text
                                      className={`text-sm font-semibold ${textColorClass}`}
                                      style={{
                                        color:
                                          theme === "dark"
                                            ? "#d4d4d8"
                                            : "#656565",
                                      }}
                                    >
                                      {formatCurrency(itemTotal)}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    ))}
                    {reportDetails.bills.length > 5 && (
                      <TouchableOpacity
                        onPress={() => setShowAllBills(!showAllBills)}
                        className="mt-3 p-3 rounded-lg"
                        activeOpacity={0.7}
                        style={{
                          backgroundColor:
                            theme === "dark" ? "#374151" : "#f3f4f6",
                        }}
                      >
                        <CustomText
                          className={`text-center ${textColorClass} font-medium`}
                        >
                          {showAllBills
                            ? t("common.showLess")
                            : `${t("common.seeMore")} (${reportDetails.bills.length - 5})`}
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <CustomText
                    className={`text-center ${textColorClass} opacity-70`}
                  >
                    {t("common.notfound")}
                  </CustomText>
                )}
              </View>

              {/* Expenses Section */}
              <View
                className={`rounded-lg p-4 mb-4 ${
                  theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <CustomText
                  className={`text-lg font-semibold mb-3 ${textColorClass}`}
                  weight="bold"
                >
                  {`${t("daily.expenses")} (${reportDetails.expenses.length})`}
                </CustomText>
                {reportDetails.expenses.length > 0 ? (
                  <>
                    {(showAllExpenses
                      ? reportDetails.expenses
                      : reportDetails.expenses.slice(0, 5)
                    ).map((expense) => (
                      <View
                        key={expense.id}
                        className={`border-b pb-3 mb-3 ${
                          theme === "dark"
                            ? "border-zinc-700"
                            : "border-zinc-200"
                        }`}
                      >
                        <Text
                          className={`text-sm ${textColorClass} opacity-70 mb-1`}
                        >
                          {new Date(expense.date).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </Text>
                        <View className="flex-row justify-between items-center mb-1">
                          <TouchableOpacity
                            onPress={() => handlePressExpNo(expense)}
                            activeOpacity={0.7}
                          >
                            <CustomText
                              className={`font-bold text-sm pt-1 px-1 ${textColorClass}`}
                              style={{
                                backgroundColor:
                                  theme === "dark" ? "#1f2937" : "#dededd",
                              }}
                            >
                              {`#${expense.expNo}`}
                            </CustomText>
                          </TouchableOpacity>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <CustomText
                            className={`font-medium ${textColorClass}`}
                          >
                            {expense.sName}
                          </CustomText>

                          {parseFloat(expense.debtAmount?.toString() ?? "0") >
                          0 ? (
                            <Text
                              className={`font-bold text-base text-[#ef444483]`}
                            >
                              {formatCurrency(
                                parseFloat(expense.debtAmount!.toString()),
                              )}
                            </Text>
                          ) : (
                            <Text
                              className={`font-bold text-base text-[#ef4444]`}
                            >
                              {formatCurrency(
                                parseFloat(expense.amount.toString()),
                              )}
                            </Text>
                          )}
                        </View>
                        {(expense.desc || expense.note) && (
                          <CustomText
                            className={`text-sm ${textColorClass} opacity-70`}
                          >
                            {expense.desc || expense.note}
                          </CustomText>
                        )}
                      </View>
                    ))}
                    {reportDetails.expenses.length > 5 && (
                      <TouchableOpacity
                        onPress={() => setShowAllExpenses(!showAllExpenses)}
                        className="mt-3 p-3 rounded-lg"
                        activeOpacity={0.7}
                        style={{
                          backgroundColor:
                            theme === "dark" ? "#374151" : "#f3f4f6",
                        }}
                      >
                        <CustomText
                          className={`text-center ${textColorClass} font-medium`}
                        >
                          {showAllExpenses
                            ? t("common.showLess")
                            : `${t("common.seeMore")} (${reportDetails.expenses.length - 5})`}
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <CustomText
                    className={`text-center ${textColorClass} opacity-70`}
                  >
                    {t("common.notfound")}
                  </CustomText>
                )}
              </View>

              {/* Ads Cost Section */}
              <View
                className={`rounded-lg p-4 mb-4 ${
                  theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <CustomText
                  className={`text-lg font-semibold mb-3 `}
                  style={{ color: theme === "dark" ? "#d4d4d8" : "#27272a" }}
                  weight="bold"
                >
                  {`${t("daily.adsCost")} (${reportDetails.ads?.length || 0})`}
                </CustomText>
                {reportDetails.ads && reportDetails.ads.length > 0 ? (
                  <>
                    {(showAllAds
                      ? reportDetails.ads
                      : reportDetails.ads.slice(0, 5)
                    ).map((ad) => (
                      <View
                        key={ad.id}
                        className={`border-b pb-3 mb-3 ${
                          theme === "dark"
                            ? "border-zinc-700"
                            : "border-zinc-200"
                        }`}
                      >
                        <Text
                          className={`text-sm ${textColorClass} opacity-70`}
                        >
                          {new Date(ad.date).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </Text>
                        <View className="flex-row justify-between items-center mb-2">
                          <View className="flex-1">
                            <CustomText
                              className={`font-medium ${textColorClass}`}
                            >
                              {ad.platform.platform}
                            </CustomText>
                            <CustomText
                              className={`text-sm ${textColorClass} opacity-70`}
                            >
                              {ad.platform.accName}
                            </CustomText>
                            {(ad.platform.accId || ad.platform.campaignId) && (
                              <CustomText
                                className={`text-xs ${textColorClass} opacity-60 mt-1`}
                              >
                                {ad.platform.accId
                                  ? `${ad.platform.accId}`
                                  : ""}
                              </CustomText>
                            )}
                          </View>
                          <Text
                            className={`font-bold text-base text-[#ef4444]`}
                          >
                            {formatCurrency(ad.adsCost)}
                          </Text>
                        </View>
                      </View>
                    ))}
                    {reportDetails.ads && reportDetails.ads.length > 5 && (
                      <TouchableOpacity
                        onPress={() => setShowAllAds(!showAllAds)}
                        className="mt-3 p-3 rounded-lg"
                        activeOpacity={0.7}
                        style={{
                          backgroundColor:
                            theme === "dark" ? "#374151" : "#f3f4f6",
                        }}
                      >
                        <CustomText
                          className={`text-center ${textColorClass} font-medium`}
                        >
                          {showAllAds
                            ? t("common.showLess")
                            : `${t("common.seeMore")} (${reportDetails.ads.length - 5})`}
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <CustomText
                    className={`text-center ${textColorClass} opacity-70`}
                  >
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
