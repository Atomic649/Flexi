import {
  View,
  ScrollView,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import TotalSale from "@/components/home/TotalSale";
import FacebookCard from "@/components/home/FacebookCard";
import TiktokCard from "@/components/home/TiktokCard";
import ShopeeCard from "@/components/home/ShopeeCard";
import LineCard from "@/components/home/LineCard";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DashboardAds from "@/components/home/DashboardAds";
import { LinearGradient } from "expo-linear-gradient";
import { CustomText } from "@/components/CustomText";
import { getMemberId } from "@/utils/utility";
import CallAPIProduct from "@/api/product_api";
import { images } from "@/constants";

export default function Dashboard() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [productChoice, setProductChoice] = useState<any[]>([]);
  const [productChoiceVisible, setProductChoiceVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductChoice = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIProduct.getProductChoiceAPI(memberId);
          setProductChoice(response || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductChoice([]);
      }
    };

    fetchProductChoice();
  }, []);

  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    console.log("Selected Dates:", dates);
  };

  const selectedDateRange =
    selectedDates.length > 1
      ? `${selectedDates[0]} ${t("common.to")} ${
          selectedDates[selectedDates.length - 1]
        }`
      : selectedDates.length === 1
      ? `${selectedDates[0]}`
      : t("dashboard.selectDate");

  return (
    <LinearGradient
      colors={
        theme === "dark"
          ? ["#18181b", "#18181b"]
          : ["#f7f7f7", "#d8f8f3", "#ffffff"]
      }
      style={{ flex: 1 }}
    >
      <SafeAreaView
        className="h-full "
        
      >
        <ScrollView>
          {/* Dashboard*/}
          <View
            className="w-full  justify-center items-center px-8"
            style={{
              flex: 1,
              paddingTop: 10,
              height: Dimensions.get("window").width > 768 ? "auto" : "auto",
              marginBottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* คำอธิบาย */}
            <CustomText
              weight="bold"
              className="mt-7 text-center text-white"
              style={{
                fontSize: Dimensions.get("window").width > 768 ? 18 : 14,
                lineHeight: 24,
                color: theme === "dark" ? "#c9c9c9" : "#48453e",
              }}
            >
              {t("landing.description")}
            </CustomText>
            {/* Slogan */}
            <View className="relative m-5">
              <CustomText
                className=" text-start text-white leading-10"
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 18 : 13,
                  lineHeight: 24,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("automate")}
              </CustomText>
            </View>
          </View>

          <View
            style={{
              width: Dimensions.get("window").width > 768 ? "40%" : "100%",
              alignSelf: "center",
            }}
          >
            {/* Filter */}
            <View className="flex-row items-center justify-between  mt-2 px-3 font-bold">
              <TouchableOpacity onPress={() => setProductChoiceVisible(true)}>
                <View
                  className="flex-row items-center justify-center rounded-full w-36 px-2 p-3"
                  style={{
                    backgroundColor: theme === "dark" ? "#27272a" : "#48453e",
                  }}
                >
                  <CustomText
                    className="text-sm font-bold"
                    style={{
                      color: theme === "dark" ? "#c9c9c9" : "#ffffff",
                    }}
                  >
                    {selectedProduct || t("product.chooseProduct")}
                  </CustomText>
                </View>
              </TouchableOpacity>
              <View className="flex-row items-center bg-transparent  rounded-full p-2 ml-2">
                <CustomText
                  className={`text-sm mx-2 ${
                    theme === "dark" ? "text-[#c9c9c9]" : "text-[#48453e]"
                  }`}
                >
                  {selectedDateRange}
                </CustomText>
                {/* icon Calendar */}
                <Ionicons
                  name="calendar"
                  size={24}
                  color={theme === "dark" ? "#ffffff" : "#444541"}
                  onPress={() => setCalendarVisible(true)}
                />
              </View>
            </View>
            {/* Totalsale */}
            <TotalSale />
            {/* All Platform Card*/}
            <View className="flex-1 flex-wrap  flex-row ">
              <View className="w-1/2 pl-3 ">
                <FacebookCard />
              </View>
              <View className="w-1/2 p-0">
                <TiktokCard />
              </View>
              <View className="w-1/2 pl-3">
                <ShopeeCard />
              </View>
              <View className="w-1/2 p-0">
                <LineCard />
              </View>

              {/* <DashboardAds /> */}
            </View>
          </View>

          <View
            className=" pt-5 px-2"
            style={{
              flex: 1,
              height: Dimensions.get("window").width > 768 ? "auto" : "auto",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingBottom: 20,
              marginBottom: Dimensions.get("window").width > 768 ? 30 : 10,
            }}
          >
            <View className="relative">
              <CustomText
                weight="bold"
                className=" text-center text-white leading-10"
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.title")}
              </CustomText>
              <CustomText
                weight="regular"
                className=" text-start text-white  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content1")}
              </CustomText>
              {/* Image of get start */}
              <Image
                source={images.start}
                style={{
                  width: Dimensions.get("window").width > 768 ? 600 : 350,
                  height: Dimensions.get("window").width > 768 ? 300 : 200,
                  alignSelf: "center",
                }}
                resizeMode="contain"
              />

              <CustomText
                weight="regular"
                className=" text-start text-white leading-10  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content2")}
              </CustomText>
              <Image
                source={images.loginshopee}
                style={{
                  width: Dimensions.get("window").width > 768 ? 600 : 350,
                  height: Dimensions.get("window").width > 768 ? 500 : 200,
                  marginTop: 10,
                  marginBottom: 20,
                }}
                resizeMode="contain"
              />
               <CustomText
                weight="regular"
                className=" text-start text-white leading-10  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content3")}
              </CustomText>
              <CustomText
                weight="regular"
                className=" text-start text-white leading-10  "
                style={{
                  fontSize: Dimensions.get("window").width > 768 ? 16 : 14,
                  color: theme === "dark" ? "#c9c9c9" : "#48453e",
                }}
              >
                {t("howto.content4")}
              </CustomText>
            </View>
          </View>
        </ScrollView>

        {/* Modal for MultiDateCalendar */}
        <Modal
          visible={calendarVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setCalendarVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setCalendarVisible(false)}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme === "dark" ? "#000000b5" : "#b4cac6a9",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
                padding: 16,
                borderRadius: 16,
              }}
            >
              <MultiDateCalendar onDatesChange={handleDatesChange} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Modal for Product Choice */}
        <Modal
          visible={productChoiceVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setProductChoiceVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setProductChoiceVisible(false)}
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              backgroundColor: "#00000000",
              paddingTop: 125,
              paddingLeft: 1,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: "#00000000",
                padding: 11,
                borderRadius: 20,
                width: "38%",
                maxHeight: "80%",
              }}
            >
              <ScrollView>
                {Array.isArray(productChoice) &&
                  productChoice.map((product, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedProduct(product.name);
                        setProductChoiceVisible(false);
                      }}
                      style={{
                        padding: 9,
                        borderRadius: 20,
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor:
                          theme === "dark" ? "#3f3f42" : "#4d4b46",
                      }}
                    >
                      <CustomText
                        style={{
                          fontSize: 12,
                          color: theme === "dark" ? "#c9c9c9" : "#ffffff",
                        }}
                      >
                        {product.name}
                      </CustomText>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
