import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Dimensions } from "react-native";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { useFocusEffect } from "expo-router";
import SocialDashboard from "@/components/home/SocialDashboard";
import Dashboard from "@/components/home/Dashboard";
import TaxDoc from "@/components/home/TaxDoc";


const Home = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [routes] = useState([
    { key: "Dashboard", title: t("home.Dashboard") },
    { key: "TaxDoc", title: t("home.TaxDoc") }
  ]);

  // Refresh expense list when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Increment refresh trigger to force list to reload
      setRefreshTrigger(prev => prev + 1);
    }, [])
  );

  // Create scene map with access to refresh trigger
  const renderSceneWithProps = () => {
    return {
//SocialDashboard: SocialDashboard,
      Dashboard: Dashboard,
      TaxDoc: TaxDoc,
    };
  };

  const renderScene = SceneMap(renderSceneWithProps());

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

              return (
                <TouchableOpacity
                  key={route.key}
                  onLayout={onLayout}
                  onPress={() => setIndex(tabIndex)}
                  activeOpacity={1}
                  style={{
                    borderBottomWidth: isActive ? 3 : 0,
                    borderBottomColor: isActive ? "#04ecc1" : "transparent",
                    width: Dimensions.get("window").width / 2,
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

export default Home;
