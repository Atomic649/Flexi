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
import { taxType } from "../../../Flexi-Backend/src/generated/client1/index.d";
import { Ionicons } from "@expo/vector-icons";
import FormField from "../FormField3";
import i18n from "../../i18n"; // Update the path to where your i18n config actually exists

import { TextStyle } from "react-native";

const commonTextInputStyle: TextStyle = {
  color: "#5e5e5e",
  fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Medium" : "Poppins-Regular",
  textAlign: "right",
  borderWidth: 1,
  borderColor: "#ededed",
  borderRadius: 8,
  paddingHorizontal: 8,
  height: 32,
  backgroundColor: "#f9f9f9",
};

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
          width: Dimensions.get("window").width > 768 ? "100%" : "100%",
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
            {/* icon */}
            <Ionicons>
              <Ionicons
                name="cash"
                size={24}
                color={theme === "dark" ? "#06fbc6" : "#0be4c0"}
                style={{ marginRight: 4 }}
              />
            </Ionicons>
            {/* title */}
            <CustomText className="text-lg mb-2 font-bold">
              {t("taxDoc.tipTitle")}
            </CustomText>
          </View>

          {/* Add more carRental */}
          <TouchableOpacity
            className="flex-row gap-2 items-end mb-2 justify-end"
            onPress={() => {
              if (carRentals.length < 3) {
                setCarRentals([
                  ...carRentals,
                  { value: 0, yearly: 0, reduct: "" },
                ]);
              }
            }}
            disabled={carRentals.length >= 3}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color={
                carRentals.length >= 3
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
          {/* title */}
          <View className="flex-row gap-2">
            <View className="flex-1 w-1/4"></View>
            <View className="flex-1 w-1/4 items-start">
              <CustomText style={{}} className="text-base text-left">
                {t("taxDoc.monthly")}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-start">
              <CustomText style={{}} className="text-base text-left">
                {t("taxDoc.yearly")}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-start">
              <CustomText style={{}} className="text-base text-left">
                {t("taxDoc.reduct")}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-start ">
            {/* Month&year Section*/}
            <View className="flex-col gap-2" style={{ width: "75%" }}>
              <FormField
                title={t("taxDoc.salary")}
                value={Number(reductSalary) > 0 ? salary : ""}
                value2={yearIncome.toString()}
                onChangeText={(value: number) => {
                  setSalary(value);
                  setYearIncome(Number(value) * 12);
                }}
                placeholder="0"
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
                bgColor="#ededed"
                textcolor="#5e5e5e"
              />
            </View>
            {/* Reduct Section*/}
            <View className="flex-col gap-2" style={{ width: "20%" }}>
              <View
                className="rounded-2xl border-2 border-transparent  "
                style={{
                  backgroundColor: "transparent",
                  height: 86,
                  opacity: 0.8,
                  width: 80,
                  paddingTop: 20,
                }}
              >
                <TextInput
                  className="flex-1 font-psemibold text-base px-2"
                  value={
                    Number(reductSalary) > 0 ? reductSalary.toString() : ""
                  }
                  placeholder="50% max100K"
                  placeholderTextColor={"#a5a5a5"}
                  onChangeText={(value: string) =>
                    setReductSalary(Number(value).toString())
                  }
                  style={{
                    ...commonTextInputStyle,
                    height: 90,
                    textAlignVertical: "center",
                  }}
                  editable={false}
                  keyboardType="numeric"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
          {/* CarRental Section */}
          {carRentals.map((car, idx) => {
            const allCarRentalsZero = carRentals.every(
              (c) => Number(c.value) <= 0
            );
            return (
              <View
                key={idx}
                className="flex-row gap-2"
                style={{
                  width: "75%",
                  marginTop: idx === 0 ? 10 : 0,
                }}
              >
                <FormField
                  title={
                    <>
                      {t("taxDoc.carRental")}
                      {carRentals.length > 1 && (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <CustomText style={{ fontSize: 12, marginLeft: 2 }} weight="light" className="text-xs">#</CustomText>
                          <CustomText style={{ fontSize: 12, marginLeft: 2 }} weight="light" className="text-xs">{idx + 1}</CustomText>
                        </View>
                      )}
                    </>
                  }
                  value={car.value}
                  value2={car.yearly.toString()}
                  onChangeText={(value: number) => {
                    if (value > 36001) {
                      alert(t("taxDoc.carRentalMaxAlert") || "Car rental value cannot exceed 36,000");
                      return;
                    }
                    const updated = [...carRentals];
                    updated[idx].value = value;
                    updated[idx].yearly = Number(value) * 12;
                    setCarRentals(updated);
                  }}
                  placeholder="0"
                  placeholder3="100000"
                  bgColor="#ededed"
                  textcolor="#5e5e5e"
                />

                <View
                  className="rounded-2xl border-2 border-transparent  "
                  style={{
                    backgroundColor: "transparent",
                    height: 40,
                    opacity: 0.8,
                    width: 80,
                  }}
                >
                  <TextInput
                    className="flex-1 font-psemibold text-base px-2"
                    value={allCarRentalsZero ? "" : car.reduct.toString()}
                    placeholder={t("taxDoc.reductMax")}
                    placeholderTextColor={"#a5a5a5"}
                    onChangeText={(value: string) => {
                      const updated = [...carRentals];
                      updated[idx].reduct = Number(value).toString();
                      setCarRentals(updated);
                    }}
                    style={commonTextInputStyle}
                    editable={true}
                    keyboardType="numeric"
                  />
                </View>
                {/* Delete icon */}
                {carRentals.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      const updated = carRentals.filter((_, i) => i !== idx);
                      setCarRentals(updated);
                    }}
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      paddingRight: 20,
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#ff4d4f" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          {/* OfficeRental Section */}
          <View className="flex-row gap-2 mt-2" style={{ width: "75%" }}>
            <FormField
              title={t("taxDoc.officeRental")}
              value={officeRental}
              value2={allYearOfficeRental.toString()}
              onChangeText={(value: number) => {
                setOfficeRental(value);
                setAllYearOfficeRental(Number(value) * 12);
              }}
              placeholder="0"
              placeholder3="100000"
              bgColor="#ededed"
              textcolor="#5e5e5e"
            />
            <View
              className="rounded-2xl border-2 border-transparent  "
              style={{
                backgroundColor: "transparent",
                height: 40,
                opacity: 0.8,
                width: 80,
              }}
            >
              <TextInput
                className="flex-1 font-psemibold text-base px-2"
                value={
                  Number(officeRental) <= 0 &&
                  carRentals.every((c) => Number(c.value) <= 0)
                    ? ""
                    : reductOfficeRental.toString()
                }
                placeholder={t("taxDoc.reductMax")}
                placeholderTextColor={"#a5a5a5"}
                onChangeText={(value: string) =>
                  setReductOfficeRental(Number(value).toString())
                }
                style={commonTextInputStyle}
                editable={true}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Sum */}
          <View className="flex-row pt-4 gap-2">
            <View className="flex-1 " style={{ width: "20%" }}></View>
            <View className="flex-1 w-1/4 items-start">
              <CustomText className="text-base text-right">
                {monthlySum.toLocaleString()}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-start">
              <CustomText className="text-base text-right">
                {yearlySum.toLocaleString()}
              </CustomText>
            </View>
            <View className="flex-1 w-1/4 items-start">
              <CustomText className="text-base text-right">
                {reductSum.toLocaleString()}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Individual Tax */}
        <View
          className="p-4"
          style={{
            backgroundColor: theme === "dark" ? "#222222" : "#f3f2f2dd",
            borderRadius: 10,
            margin: 10,
          }}
        >
          <View className="px-4 flex-row gap-2 items-center">
            {/* Yearly Income */}
            <View
              className="
              flex-col w-1/4"
            >
              <CustomText>{t("taxDoc.yearIncome")}</CustomText>
              <CustomText>{yearIncome.toLocaleString()}</CustomText>
            </View>
            {/* Reduct */}
            <View className="flex-col w-1/4">
              <CustomText>{t("taxDoc.reduct")}</CustomText>
              <CustomText>{reductSum.toLocaleString()}</CustomText>
            </View>
            {/* TextInput Exemption */}
            <View className="flex-col w-1/4">
              <CustomText>{t("taxDoc.exemption")}</CustomText>
              <TextInput
                value={exemption.toString()}
                onChangeText={(value) => setExemption(Number(value) || 0)}
                placeholder="0"
                placeholderTextColor="#a5a5a5"
                keyboardType="numeric"
                style={commonTextInputStyle}
              />
            </View>
            {/* Taxable Income */}
            <View className="flex-col w-1/4">
              <CustomText>{t("taxDoc.taxableIncome")}</CustomText>
              <CustomText>
                {(yearIncome - reductSum - exemption).toLocaleString()}
              </CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
