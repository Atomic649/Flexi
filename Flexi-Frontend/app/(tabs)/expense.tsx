import React, { useState } from "react";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Dimensions } from "react-native";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import detectExpense from "../../components/expense/detectExpense";
import list from "../../components/expense/list";
import { useTranslation } from "react-i18next";
import { CustomText } from "@/components/CustomText";

const Expense = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "list", title1: t("expense.title.expenseList") },
    { key: "detectExpense", title2: t("expense.title.updateExpense") },
  ]);

  const renderScene = SceneMap({
    list: list,
    detectExpense: detectExpense,
  });

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
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

export default Expense;
