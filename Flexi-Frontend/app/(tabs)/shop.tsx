import React, { useState } from "react";
import { SafeAreaView, TouchableOpacity, View, Platform } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Dimensions } from "react-native";
import { useBackgroundColorClass } from "@/utils/themeUtils";;
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import Account from "@/components/shop/account";
import Agency from "@/components/shop/agency";
import Bank from "@/components/shop/bank";
import Coach from "@/components/shop/coach";
import Office from "@/components/shop/office";
import ORM from "@/components/shop/orm";

const shop = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "office", title1: t("shop.tap.office") },   
    { key: "coach", title2: t("shop.tap.coach") },   
    { key: "bank", title3: t("shop.tap.bank") },
    { key: "agency", title4: t("shop.tap.agency") },
    { key: "account", title5: t("shop.tap.account") },
    { key: "orm", title6: t("shop.tap.orm") },
  ]);

  const renderScene = SceneMap({
    account: Account,
    agency: Agency,
    bank: Bank,
    coach: Coach,
    office: Office,
    orm: ORM,

  });

  return (
    <SafeAreaView
      className={`h-full ${useBackgroundColorClass()}`}
      style={Platform.OS === "web" ? { paddingTop: 60 } : {}}
    >
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            tabStyle={
              theme === "dark"
                ? {
                    backgroundColor: "#1d1d1d",
                  }
                : { backgroundColor: "#4e4b47" }
            }
            indicatorStyle={{ backgroundColor: "#1afee0", height: 3 }}
            renderTabBarItem={({ route, key }) => (
              <View
                className="flex-row items-center my-5 "
                style={{
                  width: Dimensions.get("window").width / 6,
                  justifyContent: "center",
                }}
              >
                {route.title1 && (
                  <View className="justify-center items-center">
                    <TouchableOpacity
                      className="justify-center items-center"
                      onPress={() =>
                        setIndex(routes.findIndex((r) => r.key === key))
                      }
                    >
                      <CustomText
                        numberOfLines={1}
                        style={{
                          color:
                            index === routes.findIndex((r) => r.key === key)
                              ? theme === "dark"
                                ? "#ffffff"
                                : "#fbfbfb"
                              : theme === "dark"
                              ? "#868484"
                              : "#e5e5e5",
                        }}
                      >
                        {route.title1}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}
                {route.title2 && (
                  <View className="justify-center items-center">
                    <TouchableOpacity
                      className="justify-center items-center"
                      onPress={() =>
                        setIndex(routes.findIndex((r) => r.key === key))
                      }
                    >
                      <CustomText
                        style={{
                          color:
                            index === routes.findIndex((r) => r.key === key)
                              ? theme === "dark"
                                ? "#ffffff"
                                : "#ffffff"
                              : theme === "dark"
                              ? "#868484"
                              : "#aca5a5",
                        }}
                      >
                        {route.title2}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}
                {route.title3 && (
                  <View className="justify-center items-center">
                    <TouchableOpacity
                      className="justify-center items-center"
                      onPress={() =>
                        setIndex(routes.findIndex((r) => r.key === key))
                      }
                    >
                      <CustomText
                        style={{
                          color:
                            index === routes.findIndex((r) => r.key === key)
                              ? theme === "dark"
                                ? "#ffffff"
                                : "#ffffff"
                              : theme === "dark"
                              ? "#868484"
                              : "#aca5a5",
                        }}
                      >
                        {route.title3}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}
                {route.title4 && (
                  <View className="justify-center items-center">
                    <TouchableOpacity
                      className="justify-center items-center"
                      onPress={() =>
                        setIndex(routes.findIndex((r) => r.key === key))
                      }
                    >
                      <CustomText
                        style={{
                          color:
                            index === routes.findIndex((r) => r.key === key)
                              ? theme === "dark"
                                ? "#ffffff"
                                : "#ffffff"
                              : theme === "dark"
                              ? "#868484"
                              : "#aca5a5",
                        }}
                      >
                        {route.title4}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}
                {route.title5 && (
                  <View className="justify-center items-center">
                    <TouchableOpacity
                      className="justify-center items-center"
                      onPress={() =>
                        setIndex(routes.findIndex((r) => r.key === key))
                      }
                    >
                      <CustomText
                        style={{
                          color:
                            index === routes.findIndex((r) => r.key === key)
                              ? theme === "dark"
                                ? "#ffffff"
                                : "#ffffff"
                              : theme === "dark"
                              ? "#868484"
                              : "#aca5a5",
                        }}
                      >
                        {route.title5}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}
                {route.title6 && (
                  <View className="justify-center items-center">
                    <TouchableOpacity
                      className="justify-center items-center"
                      onPress={() =>
                        setIndex(routes.findIndex((r) => r.key === key))
                      }
                    >
                      <CustomText
                        style={{
                          color:
                            index === routes.findIndex((r) => r.key === key)
                              ? theme === "dark"
                                ? "#ffffff"
                                : "#ffffff"
                              : theme === "dark"
                              ? "#868484"
                              : "#aca5a5",
                        }}
                      >
                        {route.title6}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}

              </View>
            )}
            style={
              theme === "dark"
                ? { backgroundColor: "#1d1d1d" }
                : { backgroundColor: "#4e4b47" }
            }
          />
        )}
      />
    </SafeAreaView>
  );
};

export default shop;
