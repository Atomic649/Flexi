import React, { useState, useEffect } from "react";
import { SafeAreaView, TouchableOpacity, View, Platform } from "react-native";
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
    //{ key: "SocialDashboard", title1: t("home.SocialDashboard") },
    { key: "Dashboard", title2: t("home.Dashboard") },
    { key: "TaxDoc", title3: t("home.TaxDoc") }
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
                  width: Dimensions.get("window").width / 2,
                  justifyContent: "center",
                }}
              >
                {/* {route.title1 && (
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
                )} */}
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

export default Home;
