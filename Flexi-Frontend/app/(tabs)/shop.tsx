import React, { useMemo, useState } from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { TabView, TabBar } from "react-native-tab-view";
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
import { getResponsiveStyles } from "@/utils/responsive";

const shop = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      { key: "office", title: t("shop.tap.office") },
      { key: "coach", title: t("shop.tap.coach") },
      { key: "bank", title: t("shop.tap.bank") },
      { key: "agency", title: t("shop.tap.agency") },
      // { key: "account", title: t("shop.tap.account") },
      { key: "orm", title: t("shop.tap.orm") },
    ],
    [i18n.resolvedLanguage]
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "office":
        return <Office />;
      case "coach":
        return <Coach />;
      case "bank":
        return <Bank />;
      case "agency":
        return <Agency />;
      case "orm":
        return <ORM />;
      default:
        return null;
    }
  };

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
        lazy
        lazyPreloadDistance={0}
        renderLazyPlaceholder={() => (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <CustomText>Loading...</CustomText>
          </View>
        )}
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
                      fontSize: getResponsiveStyles().fontSize,
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
