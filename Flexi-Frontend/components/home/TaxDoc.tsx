import {
  ScrollView,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  TextInput,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "../CustomText";
import { useEffect, useState } from "react";
import { getMemberId } from "@/utils/utility";
import CallAPIBusiness from "@/api/business_api";
import { taxType } from "../../../Flexi-Backend/src/generated/client1/index.d";
import { Ionicons } from "@expo/vector-icons";
import FormField from "../FormField3";

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
  const [rental, setRental] = useState(0);
  const [otherProfession, setOtherProfession] = useState(0);
  const [yearIncome, setYearIncome] = useState(0);
  const [allYearWage, setAllYearWage] = useState(0);
  const [allYearRental, setAllYearRental] = useState(0);
  const [allYearOtherProfession, setAllYearOtherProfession] = useState(0);
  const [reductSalary, setReductSalary] = useState(""); // Default value for reduct
  const [reductWage, setReductWage] = useState(""); // Default value for reduct
  const [reductRental, setReductRental] = useState(""); // Default value for reduct
  const [reductOtherProfession, setReductOtherProfession] = useState(""); // Default value for reduct

// sum
const monthlySum = Number(salary) + Number(wage) + Number(rental) + Number(otherProfession);
const yearlySum = monthlySum * 12;
const reductSum =
  Number(reductSalary) +
  Number(reductWage) +
  Number(reductRental) +
  Number(reductOtherProfession);

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

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView
        style={{
          width: Dimensions.get("window").width > 768 ? "100%" : "100%",
          alignSelf: "center", // Center the content on larger screens
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

        {/* Tip to take money from corparate to individual spend */}
        <View
          className="p-4"
          style={{
            backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
            borderRadius: 10,
            margin: 10,
          }}
        >
          <View className="px-4 flex-row gap-2">
            <CustomText className="text-lg mb-2 font-bold">
              {t("taxDoc.tipTitle")}
            </CustomText>
          </View>
          {/* title */}
          <View className="flex-row gap-2">
            <View className="flex-1 " style={{ width: "23%" }}></View>
            <View className="flex-1 w-1/4 items-center">
              <CustomText style={{}} className="text-base text-left">
                {t("taxDoc.monthly")}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-center">
              <CustomText style={{}} className="text-base text-left">
                {t("taxDoc.yearly")}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-center">
              <CustomText style={{}} className="text-base text-left">
                {t("taxDoc.reduct")}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-start ">
            {/* Month&year Section*/}
            <View className="flex-col gap-2" style={{ width: "80%" }}>
              <FormField
                title={t("taxDoc.salary")}
                value={salary}
                value2={yearIncome.toString()}
                onChangeText={(value: number) => {
                  setSalary(value);
                  setYearIncome(Number(value) * 12);
                }}
                placeholder="0"
                placeholder3="100000"
                bgColor="#ededed"
                textcolor="#5e5e5e"
              />

              <FormField
                title={t("taxDoc.wage")}
                value={wage}
                value2={allYearWage.toString()}
                onChangeText={(value: number) => {
                  setWage(value);
                  setAllYearWage(Number(value) * 12);
                }}
                placeholder="0"
                placeholder3="100000"
                bgColor="#ededed"
                textcolor="#5e5e5e"
              />

              <FormField
                title={t("taxDoc.rental")}
                value={rental}
                value2={allYearRental.toString()}
                onChangeText={(value: number) => {
                  setRental(value);
                  setAllYearRental(Number(value) * 12);
                }}
                placeholder="0"
                placeholder3="100000"
                bgColor="#ededed"
                textcolor="#5e5e5e"
              />

              <FormField
                title={t("taxDoc.otherProfession")}
                value={otherProfession}
                value2={allYearOtherProfession.toString()}
                onChangeText={(value: number) => {
                  setOtherProfession(value);
                  setAllYearOtherProfession(Number(value) * 12);
                }}
                placeholder="0"
                placeholder3="100000"
                bgColor="#ededed"
                textcolor="#5e5e5e"
              />
            </View>
            {/* Reduct Section*/}
            <View className="flex-col gap-2" style={{ width: "20%" }}>
              <View
                className="rounded-2xl border-2 border-transparent  "
                style={{
                  backgroundColor: "#ededed",
                  height: 86,
                  opacity: 0.8,
                  width: 80,
                }}
              >
                <TextInput
                  className="flex-1 font-psemibold text-base px-2"
                  value={reductSalary.toString()}
                  placeholder="100,000"
                  placeholderTextColor={"#a5a5a5"}
                  onChangeText={(value: string) =>
                    setReductSalary(Number(value).toString())
                  }
                  style={{ color: "#5e5e5e" }}
                  editable={true}
                  keyboardType="numeric"
                />
              </View>
              <View
                className="rounded-2xl border-2 border-transparent  "
                style={{
                  backgroundColor: "#ededed",
                  height: 40,
                  opacity: 0.8,
                  width: 80,
                }}
              >
                <TextInput
                  className="flex-1 font-psemibold text-base px-2"
                  value={reductRental.toString()}
                  placeholder={t("taxDoc.reductMax")}
                  placeholderTextColor={"#a5a5a5"}
                  onChangeText={(value: string) =>
                    setReductRental(Number(value).toString())
                  }
                  style={{ color: "#5e5e5e" }}
                  editable={true}
                  keyboardType="numeric"
                />
              </View>
              <View
                className="rounded-2xl border-2 border-transparent  "
                style={{
                  backgroundColor: "#ededed",
                  height: 40,
                  opacity: 0.8,
                  width: 80,
                }}
              >
                <TextInput
                  className="flex-1 font-psemibold text-base px-2"
                  value={reductOtherProfession.toString()}
                  placeholder={t("taxDoc.reductMax")}
                  placeholderTextColor={"#a5a5a5"}
                  onChangeText={(value: string) =>
                    setReductOtherProfession(Number(value).toString())
                  }
                  style={{ color: "#5e5e5e" }}
                  editable={true}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
           {/* Sum */}
           <View className="flex-row pt-2 gap-2">
            <View className="flex-1 " style={{ width: "23%" }}></View>
            <View className="flex-1 w-1/4 items-center">
              <CustomText weight="semibold" className="text-base text-left"
                style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                {monthlySum.toLocaleString()}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-center">
              <CustomText style={{}} className="text-base text-left">
                {yearlySum.toLocaleString()}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-center">
              <CustomText style={{}} className="text-base text-left">
                {reductSum.toLocaleString()}
              </CustomText>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
