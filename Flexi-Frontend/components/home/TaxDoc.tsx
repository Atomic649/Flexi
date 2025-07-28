import {
  ScrollView,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { isMobile } from "@/utils/responsive";
import TaxBracketStairs3D from "../TaxBracketStairs3D";

const commonTextInputStyle: TextStyle = {
  color: "#5e5e5e",
  fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Medium" : "Poppins-Regular",
  textAlign: "right",
  borderWidth: 1,
  borderColor: "#ededed",
  borderRadius: 8,
  paddingHorizontal: 4,
  height: 32,
  backgroundColor: "#f9f9f9",
};


// Tax brackets for progressive tax calculation
interface TaxBracket {
  min: number;
  max?: number; // undefined = no upper limit
  rate: number;
  cumulativeTax: number; // ภาษีสะสมของขั้นก่อนหน้า
}

const taxBrackets: TaxBracket[] = [
  { min: 0,          max: 150000,   rate: 0,    cumulativeTax: 0 },
  { min: 150000,     max: 300000,   rate: 0.05, cumulativeTax: 0 }, // ภาษีสะสมก่อนหน้านี้คือ 0
  { min: 300000,     max: 500000,   rate: 0.10, cumulativeTax: 7500 }, // ภาษีสะสมก่อนหน้านี้คือ 7500
  { min: 500000,     max: 750000,   rate: 0.15, cumulativeTax: 27500 }, // ภาษีสะสมก่อนหน้านี้คือ 27500
  { min: 750000,     max: 1000000,  rate: 0.20, cumulativeTax: 65000 },
  { min: 1000000,    max: 2000000,  rate: 0.25, cumulativeTax: 115000 },
  { min: 2000000,    max: 5000000,  rate: 0.30, cumulativeTax: 365000 },
  { min: 5000000,    rate: 0.35,    cumulativeTax: 1265000 }
];

function calculateTax(taxableIncome: number): number {
  // ค้นหา bracket ที่ถูกต้อง
  // ใช้ >= b.min และ <= b.max เพื่อครอบคลุมขอบเขตทั้งหมด
  const bracket = taxBrackets.find(b =>
    taxableIncome > b.min && // รายได้ต้องมากกว่าจุดเริ่มต้นของขั้น (เพราะ min คือจุดเริ่มต้นของช่วงนั้นๆ)
    (b.max === undefined || taxableIncome <= b.max) // และน้อยกว่าหรือเท่ากับจุดสิ้นสุดของขั้นนั้นๆ
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

  const anualSales = 1200000; // Example annual sales
  const percentage = anualSales / 1800000; // Assuming full score is 1.8 million
  const score = percentage * 100; // Convert to
  var annualSalesMil = anualSales / 1000000; // Convert to millions
  const anualSalesM = annualSalesMil.toFixed(1) + "M"; //
  const [businessData, setBusinessData] = useState<any>([]);
  const vat = businessData?.vat || false; // Default to false if not set
  const annualExpense = 500000;
  const annualExpenseK =
    annualExpense >= 1000000
      ? (annualExpense / 1000000).toFixed(1) + "M"
      : (annualExpense / 1000).toFixed(0) + "K";
  const percentageExpense = annualExpense / anualSales;
  const scoreExpense = percentageExpense * 100; // Convert to percentage
  const scoreExpensePercentage = scoreExpense.toFixed(2) + "%"; // Convert to millions

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
  const [exemption, setExemption] = useState(0);

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

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView
        style={{
        style={{
          alignSelf: "center", // Center the content on larger screens
          padding: 10,
        }}
      >
        {/* VAT7% */}
        {vat && (
          <View
            className="p-4"
            style={{
              backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
              borderRadius: 10,
              margin: 10,
            }}
          >
            <View className="px-4 flex-row gap-2">
              <Ionicons>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme === "dark" ? "#06fbc6" : "#0be4c0"}
                />
              </Ionicons>
              <CustomText className="text-lg font-bold">
                {t("taxDoc.vatRegistration")}
              </CustomText>
            </View>
          </View>
        )}
        {!vat && (
          <View
            className="p-4"
            style={{
              backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
              borderRadius: 10,
              margin: 10,
            }}
          >
            <View className="pt-4 px-4">
              <View className="mb-4">
                <CustomText className="text-lg font-bold">
                  {t("taxDoc.vatTitle")}
                </CustomText>
                <CustomText className="text-sm text-gray-600">
                  {t("taxDoc.vatDesc")}
                </CustomText>
              </View>
              <View className="mb-4 flex flex-row justify-around ">
                <View className="flex-col">
                  <CustomText className="text-base text-left">
                    {t("taxDoc.annualSales")}
                  </CustomText>
                  <CustomText className="text-base text-left">
                    {anualSalesM}
                  </CustomText>
                </View>
                <View className="flex-col">
                  <CustomText className="text-base text-right">
                    {t("taxDoc.vatFullScore")}
                  </CustomText>
                  <CustomText className="text-base text-right">1.8M</CustomText>
                </View>
              </View>
            </View>

            {/* VAT Power Tank limit */}
            <View className="px-6 mb-4">
              <View
                style={{
                  width: "100%",
                  height: 16, // Adjust height to fit content
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme === "dark" ? "#343436" : "#d9d8d5",
                  borderRadius: 10,
                  margin: 10,
                }}
              ></View>

              <View
                style={{
                  width: `${score}%`, // Adjust width based on score
                  height: 16, // Adjust height to fit content
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme === "dark" ? "#06fbc6" : "#0efbd4",
                  borderRadius: 10,
                  margin: 10,
                  position: "absolute", // Position it on top of the background
                  left: 0, // Align to the left
                }}
              ></View>
            </View>
          </View>
        )}

        {/* Annual Tax */}
        {businessData?.taxType === "Juristic" && (
          <View
            className="p-4"
            style={{
              backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
              borderRadius: 10,
              margin: 10,
            }}
          >
            <View className="px-4 flex-row gap-2">
              <Ionicons>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme === "dark" ? "#06fbc6" : "#0be4c0"}
                />
              </Ionicons>
              <CustomText className="text-lg font-bold">
                {t("taxDoc.corpRegistration")}
              </CustomText>
            </View>
          </View>
        )}

        {businessData?.taxType === "Individual" && (
          <View
            className="p-4"
            style={{
              backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
              borderRadius: 10,
              margin: 10,
            }}
          >
            <View className="pt-4 px-4">
              <CustomText className="text-lg font-bold">
                {t("taxDoc.annualTaxTitle")}
              </CustomText>
              <View className="flex-row gap-2 items-center">
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme === "dark" ? "#06fbc6" : "#0be4c0"}
                />
                <CustomText className="text-lg font-bold">
                  {t(businessData?.taxType)}
                </CustomText>
              </View>
              <CustomText className="text-sm text-gray-600">
                {t("taxDoc.annualTaxDesc")}
              </CustomText>
              <View className="mb-4 flex flex-row justify-around mt-2 ">
                <View className="flex-col">
                  <CustomText className="text-base text-left">
                    {t("taxDoc.annualExpense")}
                  </CustomText>

                  <CustomText className="text-base text-left">
                    {annualExpenseK}
                  </CustomText>
                  <CustomText
                    className="text-base text-left"
                    style={{
                      fontWeight: "bold",
                      color:
                        parseFloat(scoreExpensePercentage) > 60
                          ? "red"
                          : theme === "dark"
                          ? "#ffffff"
                          : "#000000",
                    }}
                  >
                    {scoreExpensePercentage}
                  </CustomText>
                  {parseFloat(scoreExpensePercentage) > 60 && (
                    <CustomText
                      className="text-sm text-left"
                      style={{
                        color: "red",
                      }}
                    >
                      {t("taxDoc.taxDocAlert")}
                    </CustomText>
                  )}
                </View>
                <View className="flex-col">
                  <CustomText className="text-base text-right">
                    {t("taxDoc.annualIncome")}
                  </CustomText>
                  <CustomText className="text-base text-right">
                    {anualSalesM}
                  </CustomText>
                </View>
              </View>
            </View>

            {/* Tax Power Tank limit */}
            <View className="px-6 mb-4">
              <View
                style={{
                  width: "100%",
                  height: 16, // Adjust height to fit content
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme === "dark" ? "#343436" : "#d9d8d5",
                  borderRadius: 10,
                  margin: 10,
                }}
              ></View>
              <View
                style={{
                  width: "60%", // Adjust width based on score
                  height: 16, // Adjust height to fit content
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme === "dark" ? "#fe270b50" : "#fe270b73",
                  margin: 10,
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                  position: "absolute", // Position it on top of the background
                  left: 0, // Align to the left
                }}
              ></View>
              <View
                style={{
                  width: `${scoreExpense}%`, // Adjust width based on score
                  height: 16, // Adjust height to fit content
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme === "dark" ? "#06fbc6" : "#0efbd4",
                  borderRadius: 10,
                  margin: 10,
                  position: "absolute", // Position it on top of the background
                  left: 0, // Align to the left
                }}
              ></View>
            </View>
          </View>
        )}


        {/* 3D Tax Bracket Stairs before Individual Tax */}
        <View style={{ marginVertical: 0 }}>       
          <TaxBracketStairs3D taxBrackets={taxBrackets} taxableIncome={yearlySum - (reductSum + exemption)} />
        {/* Individual Tax */}
        <View
          className="p-4"
          style={{
            backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
            borderRadius: 10,
            margin: 10,
          }}
        >
          <View className="px-4 flex-row gap-2 items-start">
            {/* Yearly Income */}
            <View
              className="
              flex-col w-1/4 items-center"
            >
              <CustomText>{t("taxDoc.yearIncome")}</CustomText>
              <CustomText
              className="pt-2">{yearlySum.toLocaleString()}</CustomText>
            </View>
            {/* Reduct */}
            <View className="flex-col w-1/4 items-center">
              <CustomText>{t("taxDoc.reduction")}</CustomText>
              <CustomText className="pt-2">{reductSum.toLocaleString()}</CustomText>
            </View>
            {/* TextInput Exemption */}
            <View className="flex-col w-1/4 items-center">
              <CustomText>{t("taxDoc.exemption")}</CustomText>
              <TextInput
                value={exemption.toString()}
                onChangeText={(value) => setExemption(Number(value) || 0)}
                placeholder="0"
                placeholderTextColor="#a5a5a5"
                keyboardType="numeric"
                keyboardType="numeric"
                style={{
                  ...commonTextInputStyle,
                  width: isMobile() ? 80 : 120,
                  minWidth: 60,
                  maxWidth: 160,
                  alignSelf: "center",
              />
            </View>
            {/* Taxable Income */}
            <View className="flex-col w-1/4 items-center">
              <CustomText>{t("taxDoc.taxableIncome")}</CustomText>
              <CustomText className="pt-2">
                {(yearlySum - (reductSum + exemption)).toLocaleString()}
              </CustomText>
            </View>
          </View>
          {/* Tax Calculation */}
          {/* Tax Calculation */}
            <CustomText>{t("taxDoc.individualTax")}</CustomText>
            <Text
            style={{
              color: theme === "dark" ? "#ff4d4f" : "#ff4d4f",
              fontSize: 28,
              fontWeight: "900",
              marginLeft: 10,
             }}>
              {(() => {
                const taxableIncome = yearlySum - (reductSum + exemption);
                return calculateTax(taxableIncome).toLocaleString();
              })()}
            </Text>
          </View>
        </View>

        {/* Tip to take money from corparate to individual spend */}
        <View
          className="p-4"
          style={{
            backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
            borderRadius: 10,
            margin: 10,
          }}
        >
        >
            <Ionicons>
              <Ionicons
                name="cash"
                size={24}
                color={theme === "dark" ? "#06fbc6" : "#0be4c0"}
                style={{ marginRight: 4 }}
              />
            </Ionicons>
            </Ionicons>
              {t("taxDoc.tipTitle")}
            </CustomText>
          </View>
          {/* Add more carRental */}
          <TouchableOpacity
            className="flex-row gap-2 items-end mt-2 mb-6 justify-end"
            onPress={() => {
            onPress={() => {
                setCarRentals([
                  ...carRentals,
                  { value: 0, yearly: 0, reduct: "" },
                ]);
              }
            }}
            }}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color={
              color={
                  ? "#ccc"
                  : theme === "dark"
                  ? "#06fbc6"
                  : "#0be4c0"
              }
              style={{ marginRight: 4 }}
            />
            <CustomText className="text-base text-left">
              {t("taxDoc.addMoreCar")}
            </CustomText>
          </TouchableOpacity>
          </TouchableOpacity>
          {/* Table header */}
          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#e0e0e0", paddingBottom: 4, marginBottom: 4 }}>
            <View style={{ flex: isMobile() ? 1.5 : 1 }}><CustomText> </CustomText></View>
            <View style={{ flex: 1, alignItems: "center" }}><CustomText>{t("taxDoc.monthly")}</CustomText></View>
            <View style={{ flex: 1, alignItems: "center" }}><CustomText>{t("taxDoc.yearly")}</CustomText></View>
          </View>
          </View>
          {/* Salary row (merged deduction with wage) */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 2 }}>
            <View style={{ flex: isMobile() ? 1.5 : 1 }}><CustomText>{t("taxDoc.salary")}</CustomText></View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <TextInput
                value={salary.toString()}
                onChangeText={(value) => {
                  const num = Number(value) || 0;
                  setSalary(num);
                }}
                placeholder="0"
                placeholder="0"
                placeholderTextColor="#a5a5a5"
                keyboardType="numeric"
                style={{
                  ...commonTextInputStyle,
                  width: isMobile() ? 80 : 120,
                  minWidth: 60,
                  maxWidth: 160,
                  alignSelf: "center",
              />
            </View>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}><CustomText>{yearIncome.toLocaleString()}</CustomText></View>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            </View>
          </View>
          </View>
          {/* Wage row (deduction cell merged above) */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 2 }}>
            <View style={{ flex: isMobile() ? 1.5 : 1 }}><CustomText>{t("taxDoc.wage")}</CustomText></View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <TextInput
                value={wage.toString()}
                onChangeText={(value) => {
                  const num = Number(value) || 0;
                  setWage(num);
                  setAllYearWage(num * 12);
                }}
                placeholder="0"
                placeholderTextColor="#a5a5a5"
                style={{
                style={{
                  ...commonTextInputStyle,
                  width: isMobile() ? 80 : 120,
                  minWidth: 60,
                  maxWidth: 160,
                  alignSelf: "center",
                }}
              />
            </View>
            <View style={{ flex: 1, alignItems: "center" }}><CustomText>{allYearWage.toLocaleString()}</CustomText></View>
            <View style={{ flex: 1 }} />
          </View>
          {/* Car rental rows (one per car rental) */}
          {carRentals.map((car, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 2 }}>
              <View style={{ flex: isMobile() ? 1.5 : 1, flexDirection: "row", alignItems: "center" }}>
                <CustomText>{t("taxDoc.carRental")}</CustomText>
                {carRentals.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      const updated = carRentals.filter((_, i) => i !== idx);
                      setCarRentals(updated);
                    }}
                    }}
                  >
                  >
                  </TouchableOpacity>
                )}
              </View>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TextInput
                  value={car.value.toString()}
                  onChangeText={(value) => {
                    let num = Number(value) || 0;
                    if (num > 36000) {
                      alert(t("taxDoc.carRentalMaxAlert") || "Car rental value cannot exceed 36,000");
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
                    width: isMobile() ? 80 : 120,
                    minWidth: 60,
                    maxWidth: 160,
                    alignSelf: "center",
                  }}
                />
              </View>
              <View style={{ flex: 1, alignItems: "center" }}><CustomText>{Number(car.yearly).toLocaleString()}</CustomText></View>
              <View style={{ flex: 1, alignItems: "center" }}><CustomText>{Number(car.reduct).toLocaleString()}</CustomText></View>
            </View>
          ))}
          {/* Office rental row */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 2 }}>
            <View style={{ flex: isMobile() ? 1.5 : 1 }}><CustomText>{t("taxDoc.officeRental")}</CustomText></View>
              <TextInput
              <TextInput
                value={officeRental.toString()}
                onChangeText={(value) => {
                  const num = Number(value) || 0;
                  setOfficeRental(num);
                  setAllYearOfficeRental(num * 12);
                }}
                placeholder="0"
                keyboardType="numeric"
                keyboardType="numeric"
                style={{
                  ...commonTextInputStyle,
                  width: isMobile() ? 80 : 120,
                  minWidth: 60,
                  maxWidth: 160,
                  alignSelf: "center",
              />
            </View>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}><CustomText>{allYearOfficeRental.toLocaleString()}</CustomText></View>
          </View>
          </View>
          {/* Sum row */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 2, borderTopWidth: 1, borderColor: "#e0e0e0", marginTop: 4 }}>
            <View style={{ flex: isMobile() ? 1.5 : 1 }}><CustomText style={{ fontWeight: "bold" }}>{t("")}</CustomText></View>
            <View style={{ flex: 1, alignItems: "center" }}><CustomText style={{ fontWeight: "bold" }}>{monthlySum.toLocaleString()}</CustomText></View>
            <View style={{ flex: 1, alignItems: "center" }}><CustomText style={{ fontWeight: "bold" }}>{yearlySum.toLocaleString()}</CustomText></View>
          </View>
        </View>
        </View>


        
      </ScrollView>
    </SafeAreaView>
  );
}
