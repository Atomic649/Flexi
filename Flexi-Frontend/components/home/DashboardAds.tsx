import React, { useRef, useEffect } from "react";
import { ScrollView, View, Image, Dimensions, Platform } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import images from "@/constants/images";

const DashboardAds = () => {
  const { theme } = useTheme();
  const { t } = useTranslation(); // กำหนดตัวแปรใช้งานภาษา
  const scrollViewRef = useRef<ScrollView>(null);
  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: Platform.OS === "web" ? 0 : 0, // Remove space on top for web
        }}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {[images.daikin, ...Array(2)].map((image, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme === "dark" ? "#27272a" : "#ffffff",
              marginVertical: 5,
              width: Dimensions.get("window").width > 768  ? width * 0.55 : width * 1,
              height:  Dimensions.get("window").width > 768  ? width * 0.4 : width * 0.7,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5, // For Android shadow
            }}
          >
            {index < 3 && (
              <Image
                source={image}
                style={{
                  flex: 1,
                  resizeMode: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default DashboardAds;