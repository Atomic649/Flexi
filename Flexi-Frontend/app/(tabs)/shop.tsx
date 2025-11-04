import React, { useState } from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Dimensions } from "react-native";
import { useBackgroundColorClass } from "@/utils/themeUtils";
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
    { key: "office", title: t("shop.tap.office") },
    { key: "coach", title: t("shop.tap.coach") },
    { key: "bank", title: t("shop.tap.bank") },
    { key: "agency", title: t("shop.tap.agency") },
    // { key: "account", title: t("shop.tap.account") },
    { key: "orm", title: t("shop.tap.orm") },
  ]);

  const renderScene = SceneMap({
   // account: Account,
    agency: Agency,
    bank: Bank,
    coach: Coach,
    office: Office,
    orm: ORM,

  });

  return (
    <View
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
              indicatorStyle={  theme === "dark"
                ? {
                    backgroundColor: "#1d1d1d",
                  }
                : { backgroundColor: "#4e4b47" }
            }
            renderTabBarItem={({ route, key, onLayout }) => {
              const tabIndex = routes.findIndex((r) => r.key === key);
              const isActive = index === tabIndex;
              const itemWidth = Dimensions.get("window").width / routes.length;

              return (
                <TouchableOpacity
                  key={route.key}
                  onLayout={onLayout}
                  onPress={() => setIndex(tabIndex)}
                  activeOpacity={1}
                  style={{
                    borderBottomWidth: isActive ? 3 : 0,
                    borderBottomColor: isActive ? "#04ecc1" : "transparent",
                    width: itemWidth,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <CustomText
                    numberOfLines={1}
                    style={{
                      color: isActive
                        ? theme === "dark"
                          ? "#ffffff"
                          : "#fbfbfb"
                        : theme === "dark"
                        ? "#868484"
                        : "#aca5a5",
                    }}
                  >
                    {route.title}
                  </CustomText>
                </TouchableOpacity>
              );
            }}
            style={
              theme === "dark"
                ? { backgroundColor: "#1d1d1d" }
                : { backgroundColor: "#4e4b47" }
            }
          />
        )}
      />
    </View>
  );
};

export default shop;
