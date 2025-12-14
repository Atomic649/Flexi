import { View, ActivityIndicator, RefreshControl } from "react-native";
import React, { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "../CustomText";
import CallAPIB2B from "@/api/B2B_api";
import B2BAds from "../B2BAds";
import { useInfiniteB2BFeed } from "./useInfiniteB2BFeed";

export default function Bank() {
  const { theme } = useTheme();
  const {
    data: bankData,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    onRefresh,
    loadMore,
  } = useInfiniteB2BFeed(
    useCallback((cursor?: string) => CallAPIB2B.getB2BBankDataAPI(cursor), [])
  );

  return (
    <View className={`flex-1 ${useBackgroundColorClass()}`}>
      <View className="flex-1 items-center justify-center ">
        {loading && bankData.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color={theme === "dark" ? "#ffffff" : "#0000ff"}
            />
          </View>
        ) : error && bankData.length === 0 ? (
          <CustomText className="text-red-500 text-center mt-4">
            {error}
          </CustomText>
        ) : (
          <B2BAds
            officeData={bankData}
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
