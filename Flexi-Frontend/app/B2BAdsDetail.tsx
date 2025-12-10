import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CustomText } from "@/components/CustomText";
import CallAPIB2B from "@/api/B2B_api";
import images from "@/constants/images";
import { getResponsiveStyles } from "@/utils/responsive";
import { MOCKUP_IMAGE_URL } from "@/utils/config";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import CallAPIAdsEvent from "@/api/adsEvent_api";
import { getMemberId } from "@/utils/utility";

const B2BAdsDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);

  const responsive = getResponsiveStyles();

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

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const idNum = Number(params.id);
      if (!idNum || Number.isNaN(idNum)) {
        throw new Error(t("common.invalidParameter"));
      }
      const res = await CallAPIB2B.getB2BProductDetailsByIdAPI(idNum);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load B2B product details", err);
      const msg =
        typeof err?.message === "string"
          ? err.message
          : t("common.networkError");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [params.id, t]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#ffffff" : "#0000ff"}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CustomText
          style={{ color: "#ff4d4f", fontSize: responsive.bodyFontSize }}
        >
          {error}
        </CustomText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <CustomText
            style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
          >
            {t("common.back")}
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  }

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

  const title = data?.title ?? "";
  const description = data?.description ?? "";
  const imageUrl = data?.image;
  const callToAction = data?.callToAction;
  const details: Array<{ id: number; key: string; value: string }> =
    Array.isArray(data?.details)
      ? data.details.map((d: any) => ({
          id: d?.id,
          key: d?.key,
          value: d?.value,
        }))
      : [];

  // Resolve campaignId from data (prefer explicit, otherwise first from campaigns[])
  const resolveCampaignId = (item: any): number | null => {
    const direct = item?.campaignId ?? item?.campaign?.id;
    if (direct !== undefined && direct !== null) {
      const n = Number(direct);
      return Number.isNaN(n) ? null : n;
    }
    const campaigns = item?.campaigns;
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      const active = campaigns.find(
        (c: any) =>
          c?.status?.toString?.().toLowerCase?.() === "active" ||
          c?.isActive === true
      );
      const chosen = active ?? campaigns[0];
      const cid = chosen?.id ?? chosen?.campaignId;
      if (cid !== undefined && cid !== null) {
        const n = Number(cid);
        return Number.isNaN(n) ? null : n;
      }
    }
    return null;
  };

  const trackClick = async () => {
    try {
      if (!viewerId || !data) return;
      const productId = Number(data?.productId ?? data?.id);
      if (!productId || Number.isNaN(productId)) return;
      const campaignId = resolveCampaignId(data);
      await CallAPIAdsEvent.createAdsEvent({
        productId,
        viewerId,
        type: "CLICK",
        campaignId,
      });
    } catch (err) {
      console.error("Failed to track ad CLICK from detail", err);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      className={`h-full ${useBackgroundColorClass()}`}
    >
      <CustomText
        weight="bold"
        style={{
          fontSize: responsive.titleFontSize,
          fontWeight: "bold",
          color: theme === "dark" ? "#ffffff" : "#000000",
          marginBottom: 12,
        
        }}
      >
        {title}
      </CustomText>

      {imageUrl ? (
        <Image
          source={getImageSource(imageUrl)}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 8,
            backgroundColor: "#f0f0f0",
          }}
          resizeMode="cover"
          defaultSource={images.empty}
        />
      ) : null}

      {details.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <CustomText
            weight="bold"
            style={{
              fontSize: responsive.subtitleFontSize,
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          >
            {t("common.details")}
          </CustomText>
          {details.map((d) => (
            <View
              key={d.id}
              style={{ marginTop: 8, flexDirection: "row", gap: 4 }}
            >
              <CustomText
                weight="bold"
                style={{
                  fontSize: responsive.smallFontSize,
                  color: theme === "dark" ? "#cccccc" : "#555555",
                }}
              >
                {t(`B2B.BankDetail.${d.key}`)}:
              </CustomText>
              <CustomText
                style={{
                  fontSize: responsive.smallFontSize,
                  color: theme === "dark" ? "#cccccc" : "#555555",
                }}
              >
                {d.value}
              </CustomText>
            </View>
          ))}
        </View>
      ) : null}

      {callToAction ? (
        <TouchableOpacity
          style={{
            marginTop: 20,
            borderRadius: 5,
            alignItems: "center",
            backgroundColor: theme === "dark" ? "#424242" : "#ecebea",
            paddingVertical: 10,
            paddingHorizontal: 15,
          }}
          onPress={async () => {
            // fire-and-forget click tracking, then execute CTA
            trackClick();
            handleCallToAction(callToAction);
          }}
          activeOpacity={0.7}
        >
          <CustomText
            style={{
              fontSize: responsive.smallFontSize,
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          >
            {callToAction}
          </CustomText>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

export default B2BAdsDetailScreen;
