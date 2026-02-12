import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "../CustomText";
import { useEffect, useState } from "react";
import { getMemberId } from "@/utils/utility";
import CallAPIBusiness from "@/api/business_api";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../../i18n"; // Update the path to where your i18n config actually exists
import { TextStyle } from "react-native";
import { isMobile, isTablet, getResponsiveStyles } from "@/utils/responsive";
import TaxBracketStairs3D from "../TaxBracketStairs3D";
import CallAPIBill from "@/api/bill_api";
import CallAPIExpense from "@/api/expense_api";
import { DarkGrayButton } from "../CustomButton";

const commonTextInputStyle: TextStyle = {
  color: "#5e5e5e",
  fontFamily:
    i18n.language === "th" ? "IBMPlexSansThai-Medium" : "Poppins-Regular",
  textAlign: "right",
  borderWidth: 1,
  borderColor: "#ededed",
  borderRadius: 8,
  paddingHorizontal: 4,
  height: 32,
  backgroundColor: "#f9f9f9",
};

//------------ Tax brackets for progressive tax calculation--------------------
interface TaxBracket {
  min: number;
  max?: number; // undefined = no upper limit
  rate: number;
  cumulativeTax: number; // ภาษีสะสมของขั้นก่อนหน้า
}

const taxBrackets: TaxBracket[] = [
  { min: 0, max: 150000, rate: 0, cumulativeTax: 0 },
  { min: 150000, max: 300000, rate: 0.05, cumulativeTax: 0 }, // ภาษีสะสมก่อนหน้านี้คือ 0
  { min: 300000, max: 500000, rate: 0.1, cumulativeTax: 7500 }, // ภาษีสะสมก่อนหน้านี้คือ 7500
  { min: 500000, max: 750000, rate: 0.15, cumulativeTax: 27500 }, // ภาษีสะสมก่อนหน้านี้คือ 27500
  { min: 750000, max: 1000000, rate: 0.2, cumulativeTax: 65000 },
  { min: 1000000, max: 2000000, rate: 0.25, cumulativeTax: 115000 },
  { min: 2000000, max: 5000000, rate: 0.3, cumulativeTax: 365000 },
  { min: 5000000, rate: 0.35, cumulativeTax: 1265000 },
];

function calculateTax(taxableIncome: number): number {
  // ค้นหา bracket ที่ถูกต้อง
  // ใช้ >= b.min และ <= b.max เพื่อครอบคลุมขอบเขตทั้งหมด
  const bracket = taxBrackets.find(
    (b) =>
      taxableIncome > b.min && // รายได้ต้องมากกว่าจุดเริ่มต้นของขั้น (เพราะ min คือจุดเริ่มต้นของช่วงนั้นๆ)
      (b.max === undefined || taxableIncome <= b.max), // และน้อยกว่าหรือเท่ากับจุดสิ้นสุดของขั้นนั้นๆ
  );

  // ถ้าไม่เจอ bracket (เช่น taxableIncome เป็น 0 หรือติดลบ)
  if (!bracket) {
    // กรณี taxableIncome เป็น 0 หรือน้อยกว่า 0
    if (taxableIncome <= taxBrackets[0].min) {
      return 0; // รายได้อยู่ในขั้น 0%
    }
    return 0; // หรือจัดการ error ตามความเหมาะสม
  }

  // คำนวณภาษี
  // ภาษีที่ต้องจ่ายในขั้นนี้ = (รายได้ที่เกินจากจุดเริ่มต้นขั้น - 1) * อัตราภาษีในขั้น + ภาษีสะสมจากขั้นก่อนหน้า
  // ลบ 1 ออกจาก bracket.min เพราะรายได้ที่ min เป็นจุดเริ่มต้นของขั้นใหม่
  return (taxableIncome - bracket.min) * bracket.rate + bracket.cumulativeTax;
}

export default function TaxDoc() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getResponsiveStyles();

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  const parseNumberInput = (value: string) =>
    Number(value.replace(/,/g, "").replace(/[^\d.]/g, "")) || 0;

  // State for annual sales
  const [anualSales, setAnualSales] = useState(0); // Default value, will be replaced by API

  // Fetch yearly sales from API and set to anualSales
  useEffect(() => {
    const fetchYearlySales = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId !== null) {
          const response = await CallAPIBill.getYearlySalesAPI(memberId);
          console.log("Yearly Sales Response:", response);
          setAnualSales(Number(response?.anualSalesM) || 0);
        }
      } catch (error) {
        console.error("Error fetching yearly sales:", error);
      }
    };
    fetchYearlySales();
  }, []);

  const percentage = anualSales / 1800000; // Assuming full score is 1.8 million
  const score = percentage * 100; // Convert to
  const [businessData, setBusinessData] = useState<any>([]);
  const vat = businessData?.vat || false; // Default to false if not set
  const [annualExpense, setAnnualExpense] = useState(0);

  // Fetch this year's expenses from API and set to annualExpense
  useEffect(() => {
    const fetchAnnualExpense = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId !== null) {
          const response =
            await CallAPIExpense.getThisYearExpensesAPI(memberId);
          console.log("Annual Expense Response:", response);
          setAnnualExpense(Number(response?.anualExpenseM) || 0);
        }
      } catch (error) {
        console.error("Error fetching annual expense:", error);
      }
    };
    fetchAnnualExpense();
  }, []);

  const percentageExpense = annualExpense / anualSales;
  const scoreExpense = percentageExpense * 100; // Convert to percentage
  const scoreExpensePercentage = scoreExpense.toFixed(2) + "%"; // Convert to millions
  const [selectedTaxOption, setSelectedTaxOption] = useState<"60" | "100">(
    "60",
  );

  // Handle form field values
  const [salary, setSalary] = useState(0);
  const [wage, setWage] = useState(0);
  const [officeRental, setOfficeRental] = useState(0);
  const [yearIncome, setYearIncome] = useState(0);
  const [allYearWage, setAllYearWage] = useState(0);
  const [allYearOfficeRental, setAllYearOfficeRental] = useState(0);
  const [reductSalary, setReductSalary] = useState(""); // Default value for reduct
  const [reductWage, setReductWage] = useState(""); // Default value for reduct
  const [reductOfficeRental, setReductOfficeRental] = useState(""); // Default value for reduct
  // Car rental state as array
  const [carRentals, setCarRentals] = useState([
    { value: 0, yearly: 0, reduct: "" },
  ]);
  // Add exemption state
  const [exemption, setExemption] = useState(60000);

  // Updated sum logic to include all car rentals
  const monthlySum =
    Number(salary) +
    Number(wage) +
    carRentals.reduce((sum, car) => sum + Number(car.value), 0) +
    Number(officeRental);
  const yearlySum = monthlySum * 12;
  const reductSum =
    Number(reductSalary) +
    Number(reductWage) +
    carRentals.reduce((sum, car) => sum + Number(car.reduct), 0) +
    Number(reductOfficeRental);

  // get business data from API
  const fetchBusinessDataDetails = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId !== null) {
        const response = await CallAPIBusiness.getBusinessDetailsAPI(memberId);
        setBusinessData(response);
        console.log("Business Data:", response);
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };

  useEffect(() => {
    fetchBusinessDataDetails();
  }, []);

  useEffect(() => {
    // Calculate 30% of (yearIncome + allYearWage), capped at 100,000
    const reduct = Math.floor((Number(yearIncome) + Number(allYearWage)) * 0.5);
    setReductSalary(reduct > 100000 ? "100000" : reduct.toString());
  }, [yearIncome, allYearWage]);

  useEffect(() => {
    // Calculate 30% of allYearOfficeRental, no max limit
    const reduct = Math.floor(Number(allYearOfficeRental) * 0.3);
    setReductOfficeRental(reduct.toString());
  }, [allYearOfficeRental]);

  // Calculate and set reduct for each car rental when carRentals change, no max limit
  useEffect(() => {
    setCarRentals((prevCarRentals) => {
      return prevCarRentals.map((car) => {
        const reduct = Math.floor(Number(car.yearly) * 0.3);
        return {
          ...car,
          reduct: reduct.toString(),
        };
      });
    });
  }, [carRentals.length, carRentals.map((car) => car.yearly).join(",")]);

  const keyboardVerticalOffset =
    Platform.select({ ios: 160, android: 0, default: 0 }) ?? 0;

  const dynamicTextInputStyle = {
    ...commonTextInputStyle,
    height: styles.fontSize * 2.5,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={{ flex: 1 }}
    >
      <View className={`flex-1 h-full ${useBackgroundColorClass()}`}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{
            width: isMobile() || isTablet() ? "100%" : "50%",
            alignSelf: "center", // Center the content on larger screens
            padding: 10,
            //maxWidth: 500,
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {!vat && (
            <View
              className="p-4"
              style={{
                backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
                borderRadius: 10,
                marginVertical: 10,
              }}
            >
              <View className="pt-4 px-4">
                <View className="mb-4">
                  <CustomText
                    style={{ fontSize: styles.bodyFontSize  }}
                    className="mb-1 "
                    weight="bold"
                  >
                    {t("taxDoc.vatTitle")}
                  </CustomText>
                  <CustomText
                    style={{ fontSize: styles.smallFontSize }}
                    className="text-gray-600 pt-1"
                  >
                    {t("taxDoc.vatDesc")}
                  </CustomText>
                </View>
                <View className="mb-4 flex flex-row justify-around ">
                  <View className="flex-col">
                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-left pt-1"
                    >
                      {t("taxDoc.annualSales")}
                    </CustomText>
                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-left"
                    >
                      {formatNumber(anualSales)}
                    </CustomText>
                  </View>
                  <View className="flex-col">
                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-right pt-1"
                    >
                      {t("taxDoc.vatFullScore")}
                    </CustomText>
                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-right"
                    >
                      {formatNumber(1800000)}
                    </CustomText>
                  </View>
                </View>
              </View>

              {/* VAT Power Tank limit */}
              <View
                className="mb-4"
                style={{
                  position: "relative",
                  height: 16,
                  width: "100%",
                  borderRadius: 10,
                  backgroundColor: theme === "dark" ? "#343436" : "#d9d8d5",
                  overflow: "hidden", // ensure children are cropped to this container
                }}
              >
                {/* Foreground (teal) bar */}
                <View
                  style={{
                    width: `${score}%`,
                    height: 16,
                    backgroundColor: theme === "dark" ? "#06fbc6" : "#0efbd4",
                    borderRadius: 10,
                    position: "absolute",
                    left: 0,
                    top: 0,
                  }}
                />
              </View>
            </View>
          )}

          {businessData?.taxType === "Individual" && (
            <View
              className="p-4"
              style={{
                backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
                borderRadius: 10,
                marginVertical: 10,
              }}
            >
              <View className="pt-4 px-4">
                <CustomText
                  style={{ fontSize: styles.bodyFontSize }}
                  className="mb-2 "
                  weight="bold"
                >
                  {t("taxDoc.annualTaxTitle")}
                </CustomText>
                <View className="flex-row gap-2 items-center">
                  <Ionicons
                    name="checkmark-circle"
                    size={styles.headerFontSize}
                    color={theme === "dark" ? "#06fbc6" : "#0be4c0"}
                  />
                  <CustomText
                    style={{ fontSize: styles.bodyFontSize }}
                    className="font-bold"
                  >
                    {t(businessData?.taxType)}
                  </CustomText>
                </View>
                <CustomText
                  style={{ fontSize: styles.smallFontSize }}
                  className="text-gray-600 mt-1"
                >
                  {t("taxDoc.annualTaxDesc")}
                </CustomText>
                <View className="mb-4 flex flex-row justify-around mt-2 ">
                  <View className="flex-col">
                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-left pt-1"
                    >
                      {t("taxDoc.annualExpense")}
                    </CustomText>

                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-left"
                    >
                      {formatNumber(annualExpense)}
                    </CustomText>
                    <CustomText
                      style={{
                        fontSize: styles.bodyFontSize,
                        color:
                          parseFloat(scoreExpensePercentage) > 60
                            ? "#ff2d31"
                            : theme === "dark"
                              ? "#b4b3b3"
                              : "#2a2a2a",
                      }}
                      className="text-left pt-2"
                      weight="bold"
                    >
                      {scoreExpensePercentage}
                    </CustomText>
                    {/* income > 150K pay tax alert */}
                    {parseFloat(scoreExpensePercentage) > 60 &&
                      anualSales > 150000 && (
                        <CustomText
                          style={{
                            fontSize: styles.smallFontSize,
                            color: "#ff2d31",
                          }}
                          className="text-left"
                        >
                          {t("taxDoc.taxDocAlert")}
                        </CustomText>
                      )}
                  </View>
                  <View className="flex-col">
                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-right pt-1"
                    >
                      {t("taxDoc.annualIncome")}
                    </CustomText>
                    <CustomText
                      style={{ fontSize: styles.bodyFontSize }}
                      className="text-right"
                    >
                      {formatNumber(anualSales)}
                    </CustomText>
                  </View>
                </View>
              </View>

              {/* Tax Power Tank limit */}
              <View
                className="mb-4 items-center"
                style={{
                  width: "100%",
                  height: 16,
                  justifyContent: "center",
                  alignItems: "flex-start",
                  backgroundColor: theme === "dark" ? "#06fbc6" : "#9cffef",
                  borderRadius: 10,
                  position: "relative",
                  overflow: "hidden", // ensure children are cropped to this container
                }}
              >
                <View
                  style={{
                    width: "60%",
                    height: 16,
                    justifyContent: "center",
                    alignItems: "flex-start",
                    backgroundColor:
                      theme === "dark" ? "#fe270b25" : "#fe270b15",
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                    position: "absolute",
                    left: 0,
                    top: 0,
                  }}
                />
                <View
                  style={{
                    width: `${Math.min(Math.max(scoreExpense, 0), 100)}%`, // capped 0-100%
                    maxWidth: "100%",
                    height: 16,
                    justifyContent: "center",
                    alignItems: "flex-start",
                    backgroundColor: theme === "dark" ? "#ff2d31" : "#ff2d31",
                    borderRadius: 10,
                    position: "absolute",
                    left: 0,
                    top: 0,
                  }}
                />
              </View>
            </View>
          )}
          {/* --------------------------TaxType Individual ---------------------------------------------*/}

          {/* Individual Tax */}
          {businessData?.taxType === "Individual" && (
            <View
              className="p-4"
              style={{
                backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
                borderRadius: 10,
              }}
            >
              <View
                className="px-4 flex-row gap-2 items-start"
                style={{ marginHorizontal: isMobile() ? "0%" : "20%" }}
              >
                {/* Yearly Income */}
                <View
                  className="
              flex-col w-1/4 items-center"
                >
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.yearIncome")}
                  </CustomText>
                  <CustomText
                    style={{ fontSize: styles.smallFontSize }}
                    className="pt-2"
                  >
                    {formatNumber(anualSales)}
                  </CustomText>
                </View>
                <CustomText>-</CustomText>
                {/* Reduct */}
                <View className="flex-col w-1/4 items-center">
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.reduction")}
                  </CustomText>
                  <CustomText
                    style={{ fontSize: styles.smallFontSize }}
                    className="pt-2"
                  >
                    {selectedTaxOption === "100"
                      ? formatNumber(annualExpense)
                      : formatNumber(anualSales * 0.6)}
                  </CustomText>
                </View>
                <CustomText>+</CustomText>
                {/* TextInput Exemption */}
                <View className="flex-col w-1/4 items-center">
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.exemption")}
                  </CustomText>
                  <TextInput
                    value={formatNumber(exemption)}
                    onChangeText={(value) => {
                      setExemption(parseNumberInput(value));
                    }}
                    placeholder="0"
                    placeholderTextColor="#a5a5a5"
                    keyboardType="numeric"
                    style={{
                      ...dynamicTextInputStyle,
                      fontSize: styles.smallFontSize,
                      width: isMobile() ? 80 : 120,
                      minWidth: 60,
                      maxWidth: 160,
                      alignSelf: "center",
                    }}
                  />
                </View>
                <CustomText>=</CustomText>
                {/* Taxable Income */}
                <View className="flex-col w-1/4 items-center">
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.taxableIncome")}
                  </CustomText>
                  <CustomText
                    style={{ fontSize: styles.smallFontSize }}
                    className="pt-2"
                  >
                    {formatNumber(
                      Number(anualSales) -
                        ((selectedTaxOption === "100"
                          ? Number(annualExpense)
                          : Number(anualSales) * 0.6) +
                          Number(exemption)),
                    )}
                  </CustomText>
                </View>
              </View>
              {/* Tax Calculation */}
              <View className="p-4 flex-row gap-2 items-center justify-center">
                <CustomText style={{ fontSize: styles.bodyFontSize }}>
                  {t("taxDoc.individualTax")}
                </CustomText>
                <Text
                  style={{
                    color: theme === "dark" ? "#ff4d4f" : "#ff4d4f",
                    fontSize: styles.headerFontSize,
                    fontWeight: "900",
                    marginLeft: 10,
                  }}
                >
                  {(() => {
                    // compute numeric deduction based on selected option
                    const deduction =
                      selectedTaxOption === "100"
                        ? Number(annualExpense)
                        : Number(anualSales) * 0.6;
                    // use anualSales (yearly income) for Individual taxable income calculation
                    const taxableIncome =
                      Number(anualSales) - (deduction + Number(exemption));
                    return formatNumber(calculateTax(taxableIncome));
                  })()}
                </Text>
              </View>
              {businessData?.taxType === "Individual" && (
                <View style={{ marginVertical: 0 }}>
                  <TaxBracketStairs3D
                    taxBrackets={taxBrackets}
                    taxableIncome={
                      Number(anualSales) -
                      ((selectedTaxOption === "100"
                        ? Number(annualExpense)
                        : Number(anualSales) * 0.6) +
                        Number(exemption))
                    }
                  />
                </View>
              )}
            </View>
          )}

          {/* choice to submit tax */}
          {businessData?.taxType === "Individual" && (
            <View
              className="flex-row justify-around items-center mb-4 p-4"
              style={{
                backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
                borderRadius: 10,
                marginVertical: 10,
              }}
            >
              <View
                style={{ marginHorizontal: isMobile() ? "0%" : "20%" }}
                className="flex-row gap-4 items-center"
              >
                <CustomText
                  style={{ fontSize: styles.bodyFontSize }}
                  className="text-left "
                  weight="bold"
                >
                  {t("taxDoc.chooseSubmitTax")}
                </CustomText>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setSelectedTaxOption("60");
                  }}
                  className="px-4 items-center justify-center"
                  style={{
                    paddingVertical: styles.padding / 2,
                    paddingHorizontal: styles.padding,
                    backgroundColor:
                      selectedTaxOption === "60"
                        ? theme === "dark"
                          ? "#06fbc6"
                          : "#9cffef"
                        : theme === "dark"
                          ? "#333333"
                          : "#dcdada",
                    borderRadius: 8,
                  }}
                >
                  <CustomText
                    style={{ fontSize: styles.bodyFontSize }}
                    weight="medium"
                  >
                    {t("taxDoc.60%")}
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setSelectedTaxOption("100");
                  }}
                  className="px-4 items-center justify-center"
                  style={{
                    paddingVertical: styles.padding / 2,
                    paddingHorizontal: styles.padding,
                    backgroundColor:
                      selectedTaxOption === "100"
                        ? theme === "dark"
                          ? "#06fbc6"
                          : "#9cffef"
                        : theme === "dark"
                          ? "#333333"
                          : "#dcdada",
                    borderRadius: 8,
                  }}
                >
                  <CustomText
                    style={{ fontSize: styles.bodyFontSize }}
                    weight="medium"
                  >
                    {t("taxDoc.100%")}
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/*-------------------------- TaxType Juristic ---------------------------------------------*/}

          {/* Individual Tax */}
          {businessData?.taxType === "Juristic" && (
            <View
              className="p-4"
              style={{
                backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <View className=" flex-row items-start justify-center px-4 gap-2 ">
                {/* Yearly Income */}
                <View
                  className="flex-col  items-center">
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.yearIncome")}
                  </CustomText>
                  <CustomText
                    style={{ fontSize: styles.smallFontSize }}
                    className="pt-2"
                  >
                    {formatNumber(yearlySum)}
                  </CustomText>
                </View>
                <CustomText>-</CustomText>
                {/* Reduct */}
                <View className="flex-col items-center">
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.reduction")}
                  </CustomText>
                  <CustomText
                    style={{ fontSize: styles.smallFontSize }}
                    className="pt-2"
                  >
                    {formatNumber(reductSum)}
                  </CustomText>
                </View>
                <CustomText>+</CustomText>
                {/* TextInput Exemption */}
                <View className="flex-col  items-center">
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.exemption")}
                  </CustomText>
                  <TextInput
                    value={formatNumber(exemption)}
                    onChangeText={(value) => {
                      setExemption(parseNumberInput(value));
                    }}
                    placeholder="0"
                    placeholderTextColor="#a5a5a5"
                    keyboardType="numeric"
                    style={{
                      ...commonTextInputStyle,
                      fontSize: styles.smallFontSize,
                      width: isMobile() ? 80 : 120,
                      minWidth: 60,
                      maxWidth: 160,
                      alignSelf: "center",
                    }}
                  />
                </View>
                <CustomText>=</CustomText>
                {/* Taxable Income */}
                <View className="flex-col items-center">
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.taxableIncome")}
                  </CustomText>
                  <CustomText
                    style={{ fontSize: styles.smallFontSize }}
                    className="pt-2"
                  >
                    {formatNumber(yearlySum - (reductSum + exemption))}
                  </CustomText>
                </View>
              </View>
              {/* Tax Calculation */}
              <View className="p-4 flex-row gap-2 items-center justify-center">
                <CustomText style={{ fontSize: styles.bodyFontSize }}
                weight="bold"
               >
                  {t("taxDoc.individualTax")}
                </CustomText>
                <Text
                  style={{
                    color: theme === "dark" ? "#ff4d4f" : "#ff4d4f",
                    fontSize: styles.headerFontSize,
                    fontWeight: "900",
                    marginLeft: 10,
                  }}
                >
                  {(() => {
                    const taxableIncome = yearlySum - (reductSum + exemption);
                    return formatNumber(calculateTax(taxableIncome));
                  })()}
                </Text>
              </View>
              {/* 3D Tax Bracket Stairs before Individual Tax */}
              {businessData?.taxType === "Juristic" && (
                <View style={{ marginVertical: 0 }}>
                  <TaxBracketStairs3D
                    taxBrackets={taxBrackets}
                    taxableIncome={yearlySum - (reductSum + exemption)}
                  />
                </View>
              )}
            </View>
          )}

          {/* Tip to take money from corparate to individual spend */}
          {businessData?.taxType === "Juristic" && (
            <View
              className="p-4"
              style={{
                backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
                borderRadius: 10,
              }}
            >
              <View className="px-4 flex-row gap-2 mb-2">
                <Ionicons>
                  <Ionicons
                    name="cash"
                    size={24}
                    color={theme === "dark" ? "#06fbc6" : "#0be4c0"}
                    style={{ marginRight: 4 }}
                  />
                </Ionicons>
                <CustomText
                  style={{ fontSize: styles.bodyFontSize }}
                  weight="bold"
                >
                  {t("taxDoc.tipTitle")}
                </CustomText>
              </View>
              {/* Add more carRental */}
              <TouchableOpacity
                className="flex-row gap-2 items-end mt-2 mb-6 justify-end"
                onPress={() => {
                  if (carRentals.length < 5) {
                    setCarRentals([
                      ...carRentals,
                      { value: 0, yearly: 0, reduct: "" },
                    ]);
                  }
                }}
                disabled={carRentals.length >= 5}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={
                    carRentals.length >= 5
                      ? "#ccc"
                      : theme === "dark"
                        ? "#06fbc6"
                        : "#0be4c0"
                  }
                  style={{ marginRight: 4 }}
                />
                <CustomText
                  style={{ fontSize: styles.bodyFontSize }}
                  className="text-left"
                >
                  {t("taxDoc.addMoreCar")}
                </CustomText>
              </TouchableOpacity>
              {/* Table header */}
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderColor: "#e0e0e0",
                  paddingBottom: 4,
                  marginBottom: 4,
                }}
              >
                <View style={{ flex: isMobile() ? 1.5 : 1 }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {" "}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.monthly")}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.yearly")}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.reduct")}
                  </CustomText>
                </View>
              </View>
              {/* Salary row (merged deduction with wage) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 2,
                }}
              >
                <View style={{ flex: isMobile() ? 1.5 : 1 }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.salary")}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <TextInput
                    value={formatNumber(salary)}
                    onChangeText={(value) => {
                      const num = parseNumberInput(value);
                      setSalary(num);
                      setYearIncome(num * 12);
                    }}
                    placeholder="0"
                    placeholderTextColor="#a5a5a5"
                    keyboardType="numeric"
                    style={{
                      ...commonTextInputStyle,
                      fontSize: styles.smallFontSize,
                      width: isMobile() ? 80 : 120,
                      minWidth: 60,
                      maxWidth: 160,
                      alignSelf: "center",
                    }}
                  />
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {formatNumber(yearIncome)}
                  </CustomText>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CustomText
                    style={{
                      fontSize: styles.smallFontSize,
                      textAlign: "center",
                    }}
                  >
                    {formatNumber(Number(reductSalary))}
                  </CustomText>
                </View>
              </View>
              {/* Wage row (deduction cell merged above) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 2,
                }}
              >
                <View style={{ flex: isMobile() ? 1.5 : 1 }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.wage")}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <TextInput
                    value={formatNumber(wage)}
                    onChangeText={(value) => {
                      const num = parseNumberInput(value);
                      setWage(num);
                      setAllYearWage(num * 12);
                    }}
                    placeholder="0"
                    placeholderTextColor="#a5a5a5"
                    keyboardType="numeric"
                    style={{
                      ...commonTextInputStyle,
                      fontSize: styles.smallFontSize,
                      width: isMobile() ? 80 : 120,
                      minWidth: 60,
                      maxWidth: 160,
                      alignSelf: "center",
                    }}
                  />
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {formatNumber(allYearWage)}
                  </CustomText>
                </View>
                <View style={{ flex: 1 }} />
              </View>
              {/* Car rental rows (one per car rental) */}
              {carRentals.map((car, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 2,
                  }}
                >
                  <View
                    style={{
                      flex: isMobile() ? 1.5 : 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <CustomText style={{ fontSize: styles.smallFontSize }}>
                      {t("taxDoc.carRental")}
                    </CustomText>
                    <CustomText style={{ fontSize: styles.smallFontSize }}>
                      {carRentals.length > 1 ? ` #${idx + 1}` : ""}
                    </CustomText>
                    {carRentals.length > 1 && (
                      <TouchableOpacity
                        onPress={() => {
                          const updated = carRentals.filter(
                            (_, i) => i !== idx,
                          );
                          setCarRentals(updated);
                        }}
                        style={{ marginLeft: 6 }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color="#ff4d4f"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <TextInput
                      value={formatNumber(car.value)}
                      onChangeText={(value) => {
                        let num = parseNumberInput(value);
                        if (num > 36000) {
                          alert(
                            t("taxDoc.carRentalMaxAlert") ||
                              "Car rental value cannot exceed 36,000",
                          );
                          num = 36000;
                        }
                        const updated = [...carRentals];
                        updated[idx].value = num;
                        updated[idx].yearly = num * 12;
                        setCarRentals(updated);
                      }}
                      placeholder="0"
                      placeholderTextColor="#a5a5a5"
                      keyboardType="numeric"
                      style={{
                        ...commonTextInputStyle,
                        fontSize: styles.smallFontSize,
                        width: isMobile() ? 80 : 120,
                        minWidth: 60,
                        maxWidth: 160,
                        alignSelf: "center",
                      }}
                    />
                  </View>
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <CustomText style={{ fontSize: styles.smallFontSize }}>
                      {formatNumber(Number(car.yearly))}
                    </CustomText>
                  </View>
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <CustomText style={{ fontSize: styles.smallFontSize }}>
                      {formatNumber(Number(car.reduct))}
                    </CustomText>
                  </View>
                </View>
              ))}
              {/* Office rental row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 2,
                }}
              >
                <View style={{ flex: isMobile() ? 1.5 : 1 }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {t("taxDoc.officeRental")}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <TextInput
                    value={formatNumber(officeRental)}
                    onChangeText={(value) => {
                      const num = parseNumberInput(value);
                      setOfficeRental(num);
                      setAllYearOfficeRental(num * 12);
                    }}
                    placeholder="0"
                    placeholderTextColor="#a5a5a5"
                    keyboardType="numeric"
                    style={{
                      ...commonTextInputStyle,
                      fontSize: styles.smallFontSize,
                      width: isMobile() ? 80 : 120,
                      minWidth: 60,
                      maxWidth: 160,
                      alignSelf: "center",
                    }}
                  />
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {formatNumber(allYearOfficeRental)}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText style={{ fontSize: styles.smallFontSize }}>
                    {formatNumber(Number(reductOfficeRental))}
                  </CustomText>
                </View>
              </View>
              {/* Sum row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 2,
                  borderTopWidth: 1,
                  borderColor: "#e0e0e0",
                  marginTop: 4,
                }}
              >
                <View style={{ flex: isMobile() ? 1.5 : 1 }}>
                  <CustomText
                    style={{
                      fontSize: styles.smallFontSize,
                      fontWeight: "bold",
                    }}
                  >
                    {t("")}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText
                    style={{
                      fontSize: styles.smallFontSize,
                      fontWeight: "bold",
                    }}
                  >
                    {formatNumber(monthlySum)}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText
                    style={{
                      fontSize: styles.smallFontSize,
                      fontWeight: "bold",
                    }}
                  >
                    {formatNumber(yearlySum)}
                  </CustomText>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <CustomText
                    style={{
                      fontSize: styles.smallFontSize,
                      fontWeight: "bold",
                    }}
                  >
                    {formatNumber(reductSum)}
                  </CustomText>
                </View>
              </View>
            </View>
          )}
          {/* ----------------------------------------------------------------------------------------- */}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
