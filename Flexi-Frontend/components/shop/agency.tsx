import { View, ActivityIndicator, RefreshControl } from "react-native";
import React, { useCallback } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "@/components/CustomText";
import CallAPIB2B from "@/api/B2B_api";
import B2BAds from "../B2BAds";
import { useInfiniteB2BFeed } from "./useInfiniteB2BFeed";

export default function Agency() {
  const { theme } = useTheme();
  const {
    data: agencyData,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    onRefresh,
    loadMore,
  } = useInfiniteB2BFeed(useCallback((cursor?: string) => CallAPIB2B.getB2BAgencyDataAPI(cursor), []));

  return (
    <View className={`flex-1 ${useBackgroundColorClass()}`}>
      <View className="flex-1 items-center justify-center">
        {loading && agencyData.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={theme === "dark" ? "#ffffff" : "#0000ff"}
          />
        ) : error && agencyData.length === 0 ? (
          <CustomText className="text-red-500 text-center mt-4">
            {error}
          </CustomText>
        ) : (
          <B2BAds
            officeData={agencyData}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme === "dark" ? "#ffffff" : "#0000ff"]}
                tintColor={theme === "dark" ? "#ffffff" : "#0000ff"}
              />
            }
            onEndReached={loadMore}
            isLoadingMore={loadingMore}
            hasMore={hasMore}
          />
        )}
      </View>
    </View>
  );
}
