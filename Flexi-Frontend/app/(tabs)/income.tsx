import React, { useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Dimensions } from "react-native";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import ByOrder from "../../components/income/byOrder";
import Daily from "../../components/income/daily";
import Monthly from "../../components/income/monthly";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { getResponsiveStyles } from "@/utils/responsive";

const Income = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "byOrder", title: t("income.title.byOrder") },
    { key: "daily", title: t("income.title.Daily") },
    { key: "monthly", title: t("income.title.Monthly") },
  ]);

  const renderScene = SceneMap({
    byOrder: ByOrder,
    daily: Daily,
    monthly: Monthly,
  });

  return (
    <View className={`h-full ${useBackgroundColorClass()}`}
     style={Platform.OS === "web" ? { paddingTop: 60 } : {}}>
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

              return (
                <TouchableOpacity
                  key={route.key}
                  onLayout={onLayout}
                  onPress={() => setIndex(tabIndex)}
                  activeOpacity={1}
                  style={{
                    borderBottomWidth: isActive ? 3 : 0,
                    borderBottomColor: isActive ? "#04ecc1" : "transparent",
                    width: Dimensions.get("window").width / 3,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <CustomText
                    numberOfLines={1}
                    style={{ fontSize: getResponsiveStyles().fontSize,
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

export default Income;
