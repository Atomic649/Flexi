import React, { useState } from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Dimensions } from "react-native";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import detectExpense from "../../components/expense/detectExpense";
import list from "../../components/expense/list";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";
import { useFocusEffect } from "expo-router";
const Expense = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [routes] = useState([
    { key: "list", title: t("expense.title.expenseList") },
    { key: "detectExpense", title: t("expense.title.updateExpense") },
  ]);
  // Refresh expense list when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {   
      setRefreshTrigger((prev) => prev + 1)   // Increment refresh trigger to force list to reload
    }, [])
  );

  // Create scene map with access to refresh trigger
  const renderSceneWithProps = () => {
    return {
      list: () => list({ refreshTrigger }),
      detectExpense: detectExpense,
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
                    paddingVertical: 20,
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

export default Expense;
