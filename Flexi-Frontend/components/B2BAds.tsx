import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControlProps,
  FlatList,
  ListRenderItem,
  ViewToken,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import images from "@/constants/images";
import { CustomText } from "./CustomText";
import { API_URL, MOCKUP_IMAGE_URL } from "@/utils/config";
import { getResponsiveStyles } from "@/utils/responsive";
import CallAPIAdsEvent from "@/api/adsEvent_api";
import { getMemberId } from "@/utils/utility";
import { useRouter } from "expo-router";

interface B2BAdsProps {
  officeData?: any[];
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const B2BAds: React.FC<B2BAdsProps> = ({
  officeData = [],
  onEndReached,
  isLoadingMore = false,
  hasMore = true,
  refreshControl,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const [viewerId, setViewerId] = useState<string | null>(null);
  const viewedImpressions = useRef<Set<number>>(new Set());

  // Use responsive styles from utility
  const responsiveStyles = getResponsiveStyles();
  const { bodyFontSize, titleFontSize, smallFontSize } = responsiveStyles;

  // Responsive breakpoints
  const isSmallScreen = width < 640;
  const isMediumScreen = width >= 640 && width < 1024;
  const isLargeScreen = width >= 1024;

  // Load viewerId for tracking
  useEffect(() => {
    let mounted = true;
    getMemberId()
      .then((id) => {
        if (mounted) setViewerId(id);
      })
      .catch((e) => console.error("Failed to load memberId", e));
    return () => {
      mounted = false;
    };
  }, []);

  // Format image URL properly
  const getImageSource = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return images.empty;

    // Check if the image URL is already a complete URL
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return { uri: imageUrl };
    }

    // If it's a relative path, prepend the IMAGE_URL
    return { uri: `${MOCKUP_IMAGE_URL}${imageUrl}` };
  };

  // Recalculate layout dimensions when screen size changes
  const getCardWidth = () => {
    if (isSmallScreen) return width * 0.92;
    if (isMediumScreen) return width * 0.75;
    // For large screens, make cards take up roughly half the container width to fit two per row
    return width * 0.45;
  };

  const getImageHeight = () => {
    if (isSmallScreen) return 180;
    if (isMediumScreen) return 220;
    return 220; // Slightly reduced height for the two-column layout
  };

 const handleCallToAction = (action: string) => {
     if (!action) return;
 
     if (action.startsWith("tel:")) {
       const phoneNumber = action.replace("tel:", "").trim();
       Linking.openURL(`tel:${phoneNumber}`);
     } else if (action.startsWith("email:")) {
       const email = action.replace("email:", "").trim();
       Linking.openURL(`mailto:${email}`);
     } else if (action.includes("LINE ID:")) {
       // Safely extract LINE ID; support both known formats
       const byToken = action.split("09=p9");
       let lineId = byToken.length > 1 ? byToken[1]?.trim() : undefined;
       if (!lineId) {
         const parts = action.split("LINE ID:");
         lineId = parts.length > 1 ? parts[1]?.trim() : undefined;
       }
       if (lineId) {
         Linking.openURL(`https://line.me/ti/p/${lineId}`);
       } else {
         alert(action);
       }
     } else {
       // Default action
       alert(action);
     }
   };
 

  // Resolve campaignId from item (prefer explicit, otherwise first from campaigns[])
  const resolveCampaignId = useCallback((item: any): number | null => {
    const direct = item?.campaignId ?? item?.campaign?.id;
    if (direct !== undefined && direct !== null) {
      const n = Number(direct);
      return Number.isNaN(n) ? null : n;
    }
    const campaigns = item?.campaigns;
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      // prefer an active campaign if such field exists
      const active = campaigns.find(
        (c: any) => (c?.status?.toString?.().toLowerCase?.() === "active") || c?.isActive === true
      );
      const chosen = active ?? campaigns[0];
      const cid = chosen?.id ?? chosen?.campaignId;
      if (cid !== undefined && cid !== null) {
        const n = Number(cid);
        return Number.isNaN(n) ? null : n;
      }
    }
    return null;
  }, []);

  const trackClick = useCallback(
    async (item: any) => {
      try {
        if (!viewerId) return;
        const productId = Number(item?.productId ?? item?.id);
        if (!productId || Number.isNaN(productId)) return;
        const campaignId = resolveCampaignId(item);
        await CallAPIAdsEvent.createAdsEvent({
          productId,
          viewerId,
          type: "CLICK",
          campaignId,
        });
      } catch (err) {
        console.error("Failed to track ad CLICK", err);
      }
    },
    [viewerId, resolveCampaignId]
  );

  // track Veiw 
  const trackView = useCallback(
    async (item: any) => {
      try {
        if (!viewerId) return;
        const productId = Number(item?.productId ?? item?.id);
        if (!productId || Number.isNaN(productId)) return;
        const campaignId = resolveCampaignId(item);
        await CallAPIAdsEvent.createAdsEvent({
          productId,
          viewerId,
          type: "VIEW",
          campaignId,
        });
      } catch (err) {
        console.error("Failed to track ad VIEW", err);
      }
    },
    [viewerId, resolveCampaignId]
  );



  // If no data is provided, return placeholder content
  if (!officeData || officeData.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { width: getCardWidth() }]}>
        <CustomText
          style={{
            color: theme === "dark" ? "#ffffff" : "#000000",
            fontSize: bodyFontSize,
          }}
        >
          {t("common.noDataAvailable")}
        </CustomText>
      </View>
    );
  }

  // Render function for individual card
  const renderCard: ListRenderItem<any> = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        const idNum = Number(item?.productId ?? item?.id);
        if (idNum && !Number.isNaN(idNum)) {
          // Navigate to detail; cast to any to avoid strict route typing until screen is registered
          (router as any).push({ pathname: "/B2BAdsDetail", params: { id: String(idNum) } });
        }
      }}
      key={index}
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme === "dark" ? "#27272a" : "#ffffff",
          width: getCardWidth(),
          marginBottom: 20,
          marginHorizontal: isLargeScreen ? 10 : 0,
          maxWidth: isLargeScreen ? 400 : "100%",
          gap: isLargeScreen ? 10 : 10,
        },
      ]}
    >
      <View style={[styles.imageContainer, { height: getImageHeight() }]}>
        <Image
          source={getImageSource(item.image)}
          style={styles.image}
          defaultSource={images.empty}
          // Adding specific props for iOS image loading
          resizeMethod={isIOS ? "resize" : "auto"}
        />
      </View>

      <View
        style={[
          styles.contentContainer,
          { padding: isSmallScreen ? 10 : isLargeScreen ? 16 : 16 },
        ]}
      >
        <CustomText
          style={[
            styles.title,
            {
              color: theme === "dark" ? "#ffffff" : "#000000",
              fontSize: titleFontSize,
            },
          ]}
        >
          {item.title}
        </CustomText>

        <CustomText
          style={[
            styles.description,
            {
              color: theme === "dark" ? "#cccccc" : "#555555",
              fontSize: bodyFontSize,
              lineHeight: responsiveStyles.lineHeight * bodyFontSize,
            },
          ]}
          numberOfLines={isSmallScreen ? 3 : 4}
        >
          {item.description}
        </CustomText>

        {item.callToAction && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme === "dark" ? "#424242" : "#ecebea",
                padding: isSmallScreen ? 8 : 10,
                marginTop: isSmallScreen ? 8 : 16,
              },
            ]}
            onPress={() => {
              // fire-and-forget click tracking, then execute CTA
              trackClick(item);
              handleCallToAction(item.callToAction);
            }}
          >
            <CustomText
              style={[
                styles.buttonText,
                {
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  fontSize: smallFontSize,
                },
              ]}
            >
              {item.callToAction}
            </CustomText>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      viewableItems.forEach(({ item }) => {
        const idNum = Number(item?.productId ?? item?.id);
        if (!idNum || Number.isNaN(idNum)) return;
        if (viewedImpressions.current.has(idNum)) return;
        viewedImpressions.current.add(idNum);
        trackView(item);
      });
    }
  );

  return (
    <View
      style={[
        styles.container,
        {
          width: width,
          paddingTop: isSmallScreen ? 0 : 20,
          paddingHorizontal: isLargeScreen ? 30 : 0, // Add padding on large screens
          maxWidth: isLargeScreen ? 1700 : "100%",
        },
      ]}
    >
      <FlatList
        data={officeData}
        renderItem={renderCard}
        keyExtractor={(item, index) => String(item?.productId ?? item?.id ?? index)}
        numColumns={isLargeScreen ? 2 : 1}
        columnWrapperStyle={isLargeScreen ? styles.gridWrapper : undefined}
        contentContainerStyle={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: isSmallScreen ? 10 : "10%",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={hasMore ? onEndReached : undefined}
        refreshControl={refreshControl}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              size="small"
              color={theme === "dark" ? "#ffffff" : "#0000ff"}
              style={{ marginVertical: 12 }}
            />
          ) : null
        }
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
    padding: 0,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "flex-start",
    width: "100%",
  },
  gridWrapper: {
    justifyContent: "space-around",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#00000000",
    borderRadius: 8,
    marginVertical: 20,
  },
  cardContainer: {
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    backgroundColor: "#f0f0f0", // Add a background color to show while image loads
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
  },
  button: {
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "500",
  },
});

export default B2BAds;
