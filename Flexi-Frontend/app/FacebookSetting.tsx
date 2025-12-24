import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import FacebookApi, {
  FacebookAdAccount,
  FacebookCampaign,
  FacebookAdSet,
  FacebookAd,
} from "@/api/facebook_api";
import PlatformApi from "@/api/platform_api";
import CallAPIProduct from "@/api/product_api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getMemberId } from "@/utils/utility";
import CustomAlert from "@/components/CustomAlert";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";

const FacebookSetting = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<FacebookAdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([]);
  const [adSets, setAdSets] = useState<FacebookAdSet[]>([]);
  const [ads, setAds] = useState<FacebookAd[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<string | null>(null);
  const [linkingPlatform, setLinkingPlatform] = useState(false);
  const [linkedPlatforms, setLinkedPlatforms] = useState<any[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAdSets, setLoadingAdSets] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adSetError, setAdSetError] = useState<string | null>(null);
  const [adError, setAdError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      setError(null);
      setLoadingAccounts(true);
      const data = await FacebookApi.getAdAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (e: any) {
      setError(e?.message || t("facebook.errors.loadAccounts"));
    } finally {
      setLoadingAccounts(false);
    }
  }, [t]);

  const loadLinkedPlatforms = useCallback(async () => {
    try {
      const memberId = await getMemberId();
      if (!memberId) return;
      const data = await PlatformApi.getPlatformsAPI(memberId);
      setLinkedPlatforms(data || []);
    } catch (e) {
      console.error("Failed to load linked platforms", e);
      setLinkedPlatforms([]);
    }
  }, []);

  const loadCampaigns = useCallback(async (adAccountId: string | null) => {
    if (!adAccountId) return;
    try {
      setError(null);
      setLoadingCampaigns(true);
      setSelectedCampaign(null);
      setAdSets([]);
      setSelectedAdSet(null);
      setAds([]);
      const data = await FacebookApi.getCampaigns(adAccountId);
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0].id);
      }
    } catch (e: any) {
      setError(e?.message || t("facebook.errors.loadCampaigns"));
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [t]);

  const loadAdSets = useCallback(async (campaignId: string | null) => {
    if (!campaignId) return;
    try {
      setAdSetError(null);
      setLoadingAdSets(true);
      const data = await FacebookApi.getAdSets(campaignId);
      setAdSets(data);
      setSelectedAdSet(data.length > 0 ? data[0].id : null);
      setAds([]);
    } catch (e: any) {
      setAdSetError(e?.message || t("facebook.errors.loadAdSets"));
      setAdSets([]);
      setSelectedAdSet(null);
      setAds([]);
    } finally {
      setLoadingAdSets(false);
    }
  }, [t]);

  const loadAds = useCallback(async (adSetId: string | null) => {
    if (!adSetId) return;
    try {
      setAdError(null);
      setLoadingAds(true);
      const data = await FacebookApi.getAds(adSetId);
      setAds(data);
    } catch (e: any) {
      setAdError(e?.message || t("facebook.errors.loadAds"));
      setAds([]);
    } finally {
      setLoadingAds(false);
    }
  }, [t]);

  useEffect(() => {
    loadAccounts();
    loadLinkedPlatforms();
  }, [loadAccounts, loadLinkedPlatforms]);

  useEffect(() => {
    loadCampaigns(selectedAccount);
  }, [selectedAccount, loadCampaigns]);

  useEffect(() => {
    setAdSets([]);
    loadAdSets(selectedCampaign);
  }, [selectedCampaign, loadAdSets]);

  useEffect(() => {
    setAds([]);
    loadAds(selectedAdSet);
  }, [selectedAdSet, loadAds]);

  const renderAccount = ({ item }: { item: FacebookAdAccount }) => {
    const active = selectedAccount === item.id;
    const displayId = item.id?.replace(/^act_/, "") || item.id;
    return (
      <Pressable
        key={item.id}
        onPress={() => setSelectedAccount(item.id)}
        style={{
          backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
          borderColor: active
            ? theme === "dark"
              ? "#00fad9"
              : "#09ddc1"
            : theme === "dark"
            ? "#3f3f42"
            : "#e5e7eb",
          borderWidth: active ? 2 : 1,
          borderRadius: 16,
          padding: 16,
          marginRight: 12,
          minWidth: 160,
          shadowColor: theme === "dark" ? "#000" : "#ccc",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}
      >
        <CustomText weight="medium">{item.name || item.id}</CustomText>
        <CustomText className="text-xs opacity-70" weight="regular">
          {displayId}
        </CustomText>
        <CustomText className="text-sm mt-1" weight="regular">
          {item.currency || ""}
        </CustomText>
      </Pressable>
    );
  };

  const renderCampaign = ({ item }: { item: FacebookCampaign }) => {
    const active = selectedCampaign === item.id;
    const linkedPlatform = linkedPlatforms.find(
      (p: any) => p.accId === item.id
    );
    const linkedProductName =
      linkedPlatform?.product?.name || linkedPlatform?.productName;
    return (
      <View
        key={item.id}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
          borderColor: active
            ? theme === "dark"
              ? "#00fad9"
              : "#09ddc1"
            : theme === "dark"
            ? "#3f3f42"
            : "#e5e7eb",
          borderWidth: active ? 2 : 1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: theme === "dark" ? "#000" : "#ccc",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}
      >
        <Pressable
          onPress={() => setSelectedCampaign(item.id)}
          style={{ flex: 1 }}
        >
          <CustomText weight="medium">{item.name}</CustomText>
          <CustomText className="text-sm opacity-70" weight="regular">
            {item.objective || ""}
          </CustomText>
          <CustomText className="text-xs opacity-50" weight="regular">
            {item.status || item.effectiveStatus || ""}
          </CustomText>
          {linkedProductName ? (
            <CustomText className="text-xs" style={{ color: "#0ee9c5" }} weight="regular">
              {t("facebook.linked")}: {linkedProductName}
            </CustomText>
          ) : null}
        </Pressable>
        <Ionicons
          name="link"
          size={22}
          color={
            linkedProductName
              ? "#0ee9c5"
              : theme === "dark"
              ? "#ffffff"
              : "#000000"
          }
          onPress={
            linkingPlatform ? undefined : () => handleLinkPlatform(item.id)
          }
          style={
            linkingPlatform
              ? { opacity: 0.5, paddingLeft: 12 }
              : { paddingLeft: 12 }
          }
        />
      </View>
    );
  };

  const renderAdSet = ({ item }: { item: FacebookAdSet }) => {
    const active = selectedAdSet === item.id;
    return (
      <Pressable
        key={item.id}
        onPress={() => setSelectedAdSet(item.id)}
        style={{
          backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
          borderColor: active
            ? theme === "dark"
              ? "#00fad9"
              : "#09ddc1"
            : theme === "dark"
            ? "#3f3f42"
            : "#e5e7eb",
          borderWidth: active ? 2 : 1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: theme === "dark" ? "#000" : "#ccc",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}
      >
        <CustomText weight="medium">{item.name}</CustomText>
        <CustomText className="text-sm opacity-70" weight="regular">
          {item.status || item.effectiveStatus || ""}
        </CustomText>
        <CustomText className="text-xs opacity-50" weight="regular">
          {item.optimizationGoal || ""}
        </CustomText>
        {(item.dailyBudget || item.lifetimeBudget) && (
          <CustomText className="text-xs opacity-50" weight="regular">
            {item.dailyBudget ? `${t("facebook.dailyBudget")}: ${item.dailyBudget}` : ""}
            {item.dailyBudget && item.lifetimeBudget ? " • " : ""}
            {item.lifetimeBudget
              ? `${t("facebook.lifetimeBudget")}: ${item.lifetimeBudget}`
              : ""}
          </CustomText>
        )}
      </Pressable>
    );
  };

  const renderAd = ({ item }: { item: FacebookAd }) => (
    <View
      key={item.id}
      style={{
        backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
        borderColor: theme === "dark" ? "#3f3f42" : "#e5e7eb",
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: theme === "dark" ? "#000" : "#ccc",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
    >
      <CustomText weight="medium">{item.name}</CustomText>
      <CustomText className="text-sm opacity-70" weight="regular">
        {item.status || item.effectiveStatus || ""}
      </CustomText>
      {item.creative?.name && (
        <CustomText className="text-xs opacity-50" weight="regular" numberOfLines={2}>
          {t("facebook.creative")}: {item.creative.name}
        </CustomText>
      )}
      {(item.dailyBudget || item.lifetimeBudget) && (
        <CustomText className="text-xs opacity-50" weight="regular">
          {item.dailyBudget ? `${t("facebook.dailyBudget")}: ${item.dailyBudget}` : ""}
          {item.dailyBudget && item.lifetimeBudget ? " • " : ""}
          {item.lifetimeBudget ? `${t("facebook.lifetimeBudget")}: ${item.lifetimeBudget}` : ""}
        </CustomText>
      )}
    </View>
  );

  const showAlert = useCallback((title: string, message: string) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: [
        {
          text: t("common.ok"),
          onPress: () =>
            setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
      ],
    });
  }, [t]);

  const linkCampaignWithProduct = useCallback(
    async (campaign: FacebookCampaign, memberId: string, productId: number) => {
      if (!selectedAccount) {
        showAlert(t("facebook.errors.missingAccount"), t("facebook.errors.missingAccountMsg"));
        return;
      }
      try {
        setLinkingPlatform(true);
        await PlatformApi.createPlatformAPI({
          platform: "Facebook",
          accName: campaign.name,
          accId: selectedAccount,
          campaignId: campaign.id,
          memberId,
          productId,
        });

        // After linking, ingest AdsCost for the last 60 days (including today).
        // Fire-and-forget: we don't want to block the user if ingestion is slow.
        // Backend expects query params: since/until (YYYY-MM-DD).
        (async () => {
          try {
            const today = new Date();
            const until = today.toISOString().slice(0, 10);
            const sinceDate = new Date(today);
            sinceDate.setDate(sinceDate.getDate() - 59);
            const since = sinceDate.toISOString().slice(0, 10);

            await FacebookApi.ingestAdsCostRange({ since, until });
          } catch (e: any) {
            // Linking succeeded, so keep UX positive; just inform about ingestion failure.
            const msg =
              e?.message ||
              e?.data?.message ||
              t("facebook.errors.linkSuccess");
            showAlert(t("common.error"), `AdsCost ingest failed: ${msg}`);
          }
        })();

        showAlert(t("facebook.linked"), t("facebook.errors.linkSuccess"));
        router.replace("/ads");
      } catch (err: any) {
        const message =
          err?.message || err?.data?.message || t("facebook.errors.linkFailed");
        showAlert(t("common.error"), message);
      } finally {
        setLinkingPlatform(false);
      }
    },
    [showAlert, selectedAccount, t]
  );

  const handleLinkPlatform = useCallback(
    async (campaignIdParam?: string) => {
      if (linkingPlatform) return;

      const targetCampaignId = campaignIdParam || selectedCampaign;

      if (!targetCampaignId) {
        showAlert(t("facebook.errors.selectCampaign"), t("facebook.errors.selectCampaignMsg"));
        return;
      }

      const campaign = campaigns.find((c) => c.id === targetCampaignId);
      if (!campaign) {
        showAlert(
          t("facebook.errors.campaignNotFound"),
          t("facebook.errors.campaignNotFoundMsg")
        );
        return;
      }

      try {
        const memberId = await getMemberId();
        if (!memberId) {
          showAlert(
            t("facebook.errors.missingMember"),
            t("facebook.errors.missingMemberMsg")
          );
          return;
        }

        const products = await CallAPIProduct.getProductChoiceIdAPI(memberId);
        if (!Array.isArray(products) || products.length === 0) {
          showAlert(t("facebook.errors.noProducts"), t("facebook.errors.createProductMsg"));
          return;
        }

        const normalizedProducts = products
          .map((product: any) => ({
            id: product?.id ?? product?.productId,
            name: product?.name,
          }))
          .filter((p: any) => p.name);

        if (normalizedProducts.length === 0) {
          showAlert(
            t("facebook.errors.noProducts"),
            t("facebook.errors.productsReadError")
          );
          return;
        }

        setAlertConfig({
          visible: true,
          title: t("facebook.errors.selectProduct"),
          message: t("facebook.errors.selectProductMsg"),
          buttons: [
            ...normalizedProducts.map((product: any) => ({
              text: product.name,
              onPress: () => {
                setAlertConfig((prev) => ({ ...prev, visible: false }));
                if (product.id === undefined || product.id === null) {
                  showAlert(t("common.error"), t("facebook.errors.productNoId"));
                  return;
                }
                linkCampaignWithProduct(campaign, memberId, Number(product.id));
              },
            })),
            {
              text: t("common.cancel"),
              style: "cancel",
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      } catch (err: any) {
        const message =
          err?.message || err?.data?.message || t("facebook.errors.loadProducts");
        showAlert(t("common.error"), message);
      }
    },
    [
      selectedCampaign,
      campaigns,
      linkingPlatform,
      linkCampaignWithProduct,
      showAlert,
      t,
    ]
  );

  return (
    <View className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <CustomText weight="bold" className="text-xl mb-3">
          {t("facebook.adAccounts")}
        </CustomText>

        {loadingAccounts ? (
          <ActivityIndicator />
        ) : error ? (
          <CustomText className="text-red-500">{error}</CustomText>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {accounts.map((item) => renderAccount({ item }))}
          </ScrollView>
        )}

        <View style={{ height: 16 }} />
        <View className="flex-row justify-between">
          <CustomText weight="bold" className="text-lg mb-2">
            {t("facebook.campaigns")}
          </CustomText>
        </View>

      {loadingCampaigns ? (
        <ActivityIndicator />
      ) : campaigns.length === 0 ? (
        <CustomText>{t("facebook.noCampaigns")}</CustomText>
      ) : (
        <View style={{ paddingVertical: 8 }}>
          {campaigns.map((item) => renderCampaign({ item }))}
        </View>
      )}

      <View style={{ height: 16 }} />

      <CustomText weight="bold" className="text-lg mb-2">
        {t("facebook.adSets")}
      </CustomText>

      {loadingAdSets ? (
        <ActivityIndicator />
      ) : adSetError ? (
        <CustomText className="text-red-500">{adSetError}</CustomText>
      ) : adSets.length === 0 ? (
        <CustomText>{t("facebook.noAdSets")}</CustomText>
      ) : (
        <View style={{ paddingVertical: 8 }}>
          {adSets.map((item) => renderAdSet({ item }))}
        </View>
      )}

      <View style={{ height: 16 }} />

      <CustomText weight="bold" className="text-lg mb-2">
        {t("facebook.ads")}
      </CustomText>

      {loadingAds ? (
        <ActivityIndicator />
      ) : adError ? (
        <CustomText className="text-red-500">{adError}</CustomText>
      ) : ads.length === 0 ? (
        <CustomText>{t("facebook.noAds")}</CustomText>
      ) : (
        <View style={{ paddingVertical: 8 }}>
          {ads.map((item) => renderAd({ item }))}
        </View>
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
      </ScrollView>
    </View>
  );
};

export default FacebookSetting;
