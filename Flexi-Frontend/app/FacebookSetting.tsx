import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import FacebookApi, { FacebookAdAccount, FacebookCampaign, FacebookAdSet, FacebookAd } from "@/api/facebook_api";
import PlatformApi from "@/api/platform_api";
import CallAPIProduct from "@/api/product_api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getMemberId } from "@/utils/utility";
import CustomAlert from "@/components/CustomAlert";

const FacebookSetting = () => {
	const { theme } = useTheme();
	const router = useRouter();
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
		buttons: Array<{ text: string; onPress: () => void; style?: "default" | "cancel" | "destructive" }>;
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
			setError(e?.message || "Failed to load ad accounts");
		} finally {
			setLoadingAccounts(false);
		}
	}, []);

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

	const loadCampaigns = useCallback(
		async (adAccountId: string | null) => {
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
				setError(e?.message || "Failed to load campaigns");
				setCampaigns([]);
			} finally {
				setLoadingCampaigns(false);
			}
		},
		[]
	);

	const loadAdSets = useCallback(
		async (campaignId: string | null) => {
			if (!campaignId) return;
			try {
				setAdSetError(null);
				setLoadingAdSets(true);
				const data = await FacebookApi.getAdSets(campaignId);
				setAdSets(data);
				setSelectedAdSet(data.length > 0 ? data[0].id : null);
				setAds([]);
			} catch (e: any) {
				setAdSetError(e?.message || "Failed to load ad sets");
				setAdSets([]);
				setSelectedAdSet(null);
				setAds([]);
			} finally {
				setLoadingAdSets(false);
			}
		},
		[]
	);

	const loadAds = useCallback(
		async (adSetId: string | null) => {
			if (!adSetId) return;
			try {
				setAdError(null);
				setLoadingAds(true);
				const data = await FacebookApi.getAds(adSetId);
				setAds(data);
			} catch (e: any) {
				setAdError(e?.message || "Failed to load ads");
				setAds([]);
			} finally {
				setLoadingAds(false);
			}
		},
		[]
	);

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
				onPress={() => setSelectedAccount(item.id)}
				style={[styles.card, active ? cardActive(theme) : cardInactive(theme)]}
			>
				<CustomText weight="medium">{item.name || item.id}</CustomText>
				<CustomText className="text-xs" weight="regular">
					{displayId}
				</CustomText>
				<CustomText className="text-sm" weight="regular">
					{item.currency || ""}
				</CustomText>
			</Pressable>
		);
	};

	const renderCampaign = ({ item }: { item: FacebookCampaign }) => {
		const active = selectedCampaign === item.id;
		const linkedPlatform = linkedPlatforms.find((p: any) => p.accId === item.id);
		const linkedProductName = linkedPlatform?.product?.name || linkedPlatform?.productName;
		return (
			<View style={[styles.row, active ? cardActive(theme) : cardInactive(theme), styles.campaignRow]}>
				<Pressable onPress={() => setSelectedCampaign(item.id)} style={{ flex: 1 }}>
					<CustomText weight="medium">{item.name}</CustomText>
					<CustomText className="text-sm" weight="regular">
						{item.objective || ""}
					</CustomText>
					<CustomText className="text-xs" weight="regular">
						{item.status || item.effectiveStatus || ""}
					</CustomText>
					{linkedProductName ? (
						<CustomText className="text-xs" weight="regular">
							Linked: {linkedProductName}
						</CustomText>
					) : null}
				</Pressable>
				<Ionicons
					name="link"
					size={22}
					color={linkedProductName ? "#0ee9c5" : theme === "dark" ? "#ffffff" : "#000000"}
					onPress={linkingPlatform ? undefined : () => handleLinkPlatform(item.id)}
					style={linkingPlatform ? { opacity: 0.5, paddingLeft: 12 } : { paddingLeft: 12 }}
				/>
			</View>
		);
	};

	const renderAdSet = ({ item }: { item: FacebookAdSet }) => (
		<Pressable
			onPress={() => setSelectedAdSet(item.id)}
			style={[styles.row, selectedAdSet === item.id ? cardActive(theme) : cardInactive(theme)]}
		>
			<CustomText weight="medium">{item.name}</CustomText>
			<CustomText className="text-sm" weight="regular">
				{item.status || item.effectiveStatus || ""}
			</CustomText>
			<CustomText className="text-xs" weight="regular">
				{item.optimizationGoal || ""}
			</CustomText>
			{(item.dailyBudget || item.lifetimeBudget) && (
				<CustomText className="text-xs" weight="regular">
					{item.dailyBudget ? `Daily budget: ${item.dailyBudget}` : ""}
					{item.dailyBudget && item.lifetimeBudget ? " • " : ""}
					{item.lifetimeBudget ? `Lifetime budget: ${item.lifetimeBudget}` : ""}
				</CustomText>
			)}
		</Pressable>
	);

	const renderAd = ({ item }: { item: FacebookAd }) => (
		<View style={[styles.row, cardInactive(theme)]}>
			<CustomText weight="medium">{item.name}</CustomText>
			<CustomText className="text-sm" weight="regular">
				{item.status || item.effectiveStatus || ""}
			</CustomText>
			{item.creative?.name && (
				<CustomText className="text-xs" weight="regular">
					Creative: {item.creative.name}
				</CustomText>
			)}
			{(item.dailyBudget || item.lifetimeBudget) && (
				<CustomText className="text-xs" weight="regular">
					{item.dailyBudget ? `Daily budget: ${item.dailyBudget}` : ""}
					{item.dailyBudget && item.lifetimeBudget ? " • " : ""}
					{item.lifetimeBudget ? `Lifetime budget: ${item.lifetimeBudget}` : ""}
				</CustomText>
			)}
		</View>
	);

	const showAlert = useCallback(
		(title: string, message: string) => {
			setAlertConfig({
				visible: true,
				title,
				message,
				buttons: [
					{
						text: "OK",
						onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
					},
				],
			});
		},
		[]
	);

	const linkCampaignWithProduct = useCallback(
		async (campaign: FacebookCampaign, memberId: string, productId: number) => {
			try {
				setLinkingPlatform(true);
				await PlatformApi.createPlatformAPI({
					platform: "Facebook",
					accName: campaign.name,
					accId: campaign.id,
					memberId,
					productId,
				});

				showAlert("Linked", "Campaign linked to platform successfully.");
                router.replace("/ads");
			} catch (err: any) {
				const message = err?.message || err?.data?.message || "Failed to link platform";
				showAlert("Error", message);
			} finally {
				setLinkingPlatform(false);
			}
		},
		[showAlert]
	);

	const handleLinkPlatform = useCallback(async (campaignIdParam?: string) => {
		if (linkingPlatform) return;

		const targetCampaignId = campaignIdParam || selectedCampaign;

		if (!targetCampaignId) {
			showAlert("Select a campaign", "Please select a campaign to link.");
			return;
		}

		const campaign = campaigns.find((c) => c.id === targetCampaignId);
		if (!campaign) {
			showAlert("Campaign not found", "Please try selecting the campaign again.");
			return;
		}

		try {
			const memberId = await getMemberId();
			if (!memberId) {
				showAlert("Missing member", "Could not find memberId. Please re-login.");
				return;
			}

			const products = await CallAPIProduct.getProductChoiceIdAPI(memberId);
			if (!Array.isArray(products) || products.length === 0) {
				showAlert("No products", "Please create a product before linking.");
				return;
			}

			const normalizedProducts = products
				.map((product: any) => ({
					id: product?.id ?? product?.productId,
					name: product?.name,
				}))
				.filter((p: any) => p.name);

			if (normalizedProducts.length === 0) {
				showAlert("No products", "Products could not be read. Please try again.");
				return;
			}

			setAlertConfig({
				visible: true,
				title: "Select product",
				message: "Choose a product to associate with this campaign.",
				buttons: [
					...normalizedProducts.map((product: any) => ({
						text: product.name,
						onPress: () => {
							setAlertConfig((prev) => ({ ...prev, visible: false }));
							if (product.id === undefined || product.id === null) {
								showAlert("Error", "Selected product has no id.");
								return;
							}
							linkCampaignWithProduct(campaign, memberId, Number(product.id));
						},
					})),
					{
						text: "Cancel",
						style: "cancel",
						onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
					},
				],
			});
		} catch (err: any) {
			const message = err?.message || err?.data?.message || "Failed to load products";
			showAlert("Error", message);
		}
	}, [selectedCampaign, campaigns, linkingPlatform, linkCampaignWithProduct, showAlert]);

	return (
		<View style={[styles.container, { backgroundColor: theme === "dark" ? "#0f172a" : "#fff" }]}> 
			<CustomText weight="bold" className="text-xl mb-3">
				Facebook Ad Accounts
			</CustomText>

			{loadingAccounts ? (
				<ActivityIndicator />
			) : error ? (
				<CustomText className="text-red-500">{error}</CustomText>
			) : (
				<FlatList
					data={accounts}
					keyExtractor={(item) => item.id}
					renderItem={renderAccount}
					horizontal
					ItemSeparatorComponent={() => <View style={{ width: 12}} />}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingVertical: 8 }}
				/>
			)}

			<View style={{ height: 16 }} />
            {campaigns.length >= 1 && (
                <View className='flex-row justify-between'>
					<CustomText weight="bold" className="text-lg mb-2">
						Campaigns
					</CustomText>
                </View>
            )}

			{loadingCampaigns ? (
				<ActivityIndicator />
			) : campaigns.length === 0 ? (
				<CustomText>No campaigns found.</CustomText>
			) : (
				<FlatList
					data={campaigns}
					keyExtractor={(item) => item.id}
					renderItem={renderCampaign}
					ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
					contentContainerStyle={{ paddingVertical: 8 }}
				/>
			)}

			<View style={{ height: 16 }} />

			<CustomText weight="bold" className="text-lg mb-2">
				Ad Sets
			</CustomText>

			{loadingAdSets ? (
				<ActivityIndicator />
			) : adSetError ? (
				<CustomText className="text-red-500">{adSetError}</CustomText>
			) : adSets.length === 0 ? (
				<CustomText>No ad sets found.</CustomText>
			) : (
				<FlatList
					data={adSets}
					keyExtractor={(item) => item.id}
					renderItem={renderAdSet}
					ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
					contentContainerStyle={{ paddingVertical: 8 }}
				/>
			)}

			<View style={{ height: 16 }} />

			<CustomText weight="bold" className="text-lg mb-2">
				Ads
			</CustomText>

			{loadingAds ? (
				<ActivityIndicator />
			) : adError ? (
				<CustomText className="text-red-500">{adError}</CustomText>
			) : ads.length === 0 ? (
				<CustomText>No ads found.</CustomText>
			) : (
				<FlatList
					data={ads}
					keyExtractor={(item) => item.id}
					renderItem={renderAd}
					ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
					contentContainerStyle={{ paddingVertical: 8 }}
				/>
			)}

			<CustomAlert
				visible={alertConfig.visible}
				title={alertConfig.title}
				message={alertConfig.message}
				buttons={alertConfig.buttons}
				onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	card: {
		padding: 12,
		borderRadius: 12,
		minWidth: 160,
        maxHeight: 150,
	},
	row: {
		padding: 12,
		borderRadius: 10,
	},
	campaignRow: {
		flexDirection: "row",
		alignItems: "center",
	},
});

const cardActive = (theme: string) => ({
	backgroundColor: theme === "dark" ? "#0ee9c5" : "#d0f7f0",
});

const cardInactive = (theme: string) => ({
	backgroundColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
});

export default FacebookSetting;
