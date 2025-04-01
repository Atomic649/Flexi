import React, { useRef, useEffect } from "react";
import { ScrollView, View, Image } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import images from "@/constants/images";

const DashboardAds = () => {
  const { theme } = useTheme();
  const { t } = useTranslation(); // กำหนดตัวแปรใช้งานภาษา
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: 3.45 * 96, animated: true });
  }, []);

  return (
    <View className="flex flex-col pt-2  items-center justify-center">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {[images.adscoke, images.adsline, images.adsscb, ...Array(2)].map((image, index) => (
          <View
            key={index}
            className={`flex-row ${
              theme === "dark" ? "bg-zinc-800" : "bg-white"
            } items-center w-96 h-44 rounded-2xl mx-2`}
          >
            {index < 3 && <Image source={image} className="w-full h-full rounded-2xl" />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default DashboardAds;
