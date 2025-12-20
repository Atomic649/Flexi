import { Request, Response } from "express";
import axios from "axios";

const graphApiVersion = process.env.FACEBOOK_GRAPH_VERSION || "v20.0";
const graphApiUrl = `https://graph.facebook.com/${graphApiVersion}`;
const accessToken = process.env.FACEBOOK_ACCESS_TOKEN ;



/**
 * GET /facebook/daily-spend
 * Query params:
 *  - adAccountId: string (e.g., "act_123456789"), optional if FACEBOOK_AD_ACCOUNT_ID env is set
 *  - date: YYYY-MM-DD, optional (defaults to today, UTC)
 */
export const getFacebookDailySpend = async (req: Request, res: Response) => {
	const adAccountId = (req.query.adAccountId as string) || process.env.FACEBOOK_AD_ACCOUNT_ID;
	const dateParam = (req.query.date as string) || new Date().toISOString().slice(0, 10);

	if (!accessToken) {
		return res.status(500).json({ message: "FACEBOOK_ACCESS_TOKEN is not configured" });
	}

	if (!adAccountId) {
		return res.status(400).json({ message: "adAccountId is required (query param or env FACEBOOK_AD_ACCOUNT_ID)" });
	}

	try {
		const timeRange = { since: dateParam, until: dateParam };
        console.log("Using time range:", timeRange);
		const { data } = await axios.get(`${graphApiUrl}/${adAccountId}/insights`, {
			params: {
				fields: "spend,account_currency",
				time_increment: 1,
				time_range: JSON.stringify(timeRange),
				level: "account",
				access_token: accessToken,
			},
		});

		const spendEntry = Array.isArray(data?.data) ? data.data[0] : undefined;
		const spend = spendEntry?.spend ? Number(spendEntry.spend) : 0;
		const currency = spendEntry?.account_currency || "";

		return res.json({
			date: dateParam,
			adAccountId,
			spend,
			currency,
			raw: data?.data ?? [],
		});
	} catch (error: any) {
		const status = error?.response?.status || 500;
		const message = error?.response?.data || error?.message || "Failed to fetch Facebook spend";
		console.error("Failed to fetch Facebook daily spend", message);
		return res.status(status).json({ message });
	}
};

/**
 * GET /facebook/daily-spend/range
 * Query params:
 *  - adAccountId: string (e.g., "act_123456789"), optional if FACEBOOK_AD_ACCOUNT_ID env is set
 *  - days: number, optional (defaults to 30). Fetches the last N days including today.
 *  - since / until: YYYY-MM-DD (optional). If provided, overrides days.
 */
export const getFacebookDailySpendRange = async (req: Request, res: Response) => {
	const adAccountId = (req.query.adAccountId as string) || process.env.FACEBOOK_AD_ACCOUNT_ID;
	const daysParam = Number(req.query.days) || 30;
	const until = (req.query.until as string) || new Date().toISOString().slice(0, 10);
	const since = (req.query.since as string) || new Date(Date.now() - (daysParam - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

	if (!accessToken) {
		return res.status(500).json({ message: "FACEBOOK_ACCESS_TOKEN is not configured" });
	}

	if (!adAccountId) {
		return res.status(400).json({ message: "adAccountId is required (query param or env FACEBOOK_AD_ACCOUNT_ID)" });
	}

	try {
		const timeRange = { since, until };
		const { data } = await axios.get(`${graphApiUrl}/${adAccountId}/insights`, {
			params: {
				fields: "spend,account_currency",
				time_increment: 1,
				time_range: JSON.stringify(timeRange),
				level: "account",
				access_token: accessToken,
			},
		});

		const rows = Array.isArray(data?.data) ? data.data : [];
		const daily = rows.map((row: any) => ({
			date: row?.date_start || row?.date_stop,
			spend: row?.spend ? Number(row.spend) : 0,
			currency: row?.account_currency || "",
		}));

		return res.json({
			adAccountId,
			since,
			until,
			days: daysParam,
			daily,
		});
	} catch (error: any) {
		const status = error?.response?.status || 500;
		const message = error?.response?.data || error?.message || "Failed to fetch Facebook spend range";
		console.error("Failed to fetch Facebook daily spend range", message);
		return res.status(status).json({ message });
	}
};

/**
 * GET /facebook/daily-spend/campaign
 * Daily spend grouped by campaign over a date range (default last 30 days).
 * Query params:
 *  - adAccountId: string (e.g., "act_123"), optional if FACEBOOK_AD_ACCOUNT_ID is set
 *  - days: number, optional (defaults to 30) when since/until not provided
 *  - since / until: YYYY-MM-DD, optional explicit range (overrides days)
 *  - campaignId: string, optional; if provided, filters to that campaign
 */
export const getFacebookCampaignDailySpend = async (req: Request, res: Response) => {
    console.log("Fetching Facebook campaign daily spend with params:", req.query);
	const adAccountId = (req.query.adAccountId as string) || process.env.FACEBOOK_AD_ACCOUNT_ID;
	const daysParam = Number(req.query.days) || 30;
	const until = (req.query.until as string) || new Date().toISOString().slice(0, 10);
	const since = (req.query.since as string) || new Date(Date.now() - (daysParam - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
	const campaignId = req.query.campaignId as string | undefined;

	if (!accessToken) {
		return res.status(500).json({ message: "FACEBOOK_ACCESS_TOKEN is not configured" });
	}

	if (!adAccountId) {
		return res.status(400).json({ message: "adAccountId is required (query param or env FACEBOOK_AD_ACCOUNT_ID)" });
	}

	try {
		const timeRange = { since, until };
		const { data } = await axios.get(`${graphApiUrl}/${adAccountId}/insights`, {
			params: {
				fields: "campaign_id,campaign_name,spend,account_currency,date_start,date_stop",
				time_increment: 1,
				time_range: JSON.stringify(timeRange),
				level: "campaign",
				access_token: accessToken,
				...(campaignId ? { filterings: JSON.stringify([{ field: "campaign.id", operator: "IN", value: [campaignId] }]) } : {}),
			},
		});

		const rows = Array.isArray(data?.data) ? data.data : [];
		const daily = rows.map((row: any) => ({
			date: row?.date_start || row?.date_stop,
			campaignId: row?.campaign_id || "",
			campaignName: row?.campaign_name || "",
			spend: row?.spend ? Number(row.spend) : 0,
			currency: row?.account_currency || "",
		}));

		return res.json({
			adAccountId,
			since,
			until,
			days: daysParam,
			daily,
		});
	} catch (error: any) {
		const status = error?.response?.status || 500;
		const message = error?.response?.data || error?.message || "Failed to fetch Facebook campaign spend";
		console.error("Failed to fetch Facebook campaign daily spend", message);
		return res.status(status).json({ message });
	}
};

/**
 * GET /facebook/ad-accounts
 * Lists accessible ad accounts for the token (optionally via a business id).
 * Query params:
 *  - businessId: string (optional). If provided, fetches that business's ad accounts; otherwise uses /me/adaccounts.
 */
export const getFacebookAdAccounts = async (req: Request, res: Response) => {
	const businessId = req.query.businessId as string | undefined;

	if (!accessToken) {
		return res.status(500).json({ message: "FACEBOOK_ACCESS_TOKEN is not configured" });
	}

	try {
		const endpoint = businessId ? `${graphApiUrl}/${businessId}/adaccounts` : `${graphApiUrl}/me/adaccounts`;
		const { data } = await axios.get(endpoint, {
			params: {
				access_token: accessToken,
				fields: "id,name,account_status,currency,business_name",
				limit: 200,
			},
		});

		const accounts = Array.isArray(data?.data) ? data.data.map((acct: any) => ({
			id: acct?.id || "",
			name: acct?.name || "",
			status: acct?.account_status,
			currency: acct?.currency || "",
			businessName: acct?.business_name || "",
		})) : [];

		return res.json({
			source: businessId ? "business" : "me",
			businessId: businessId || null,
			count: accounts.length,
			accounts,
			raw: data?.data ?? [],
		});
	} catch (error: any) {
		const status = error?.response?.status || 500;
		const message = error?.response?.data || error?.message || "Failed to fetch ad accounts";
		console.error("Failed to fetch Facebook ad accounts", message);
		return res.status(status).json({ message });
	}
};

/**
 * GET /facebook/campaigns
 * Lists campaigns for a given ad account.
 * Query params:
 *  - adAccountId: string (e.g., "act_123"), required
 *  - status: comma-separated statuses (e.g., ACTIVE,PAUSED), optional
 */
export const getFacebookCampaigns = async (req: Request, res: Response) => {
	const adAccountId = (req.query.adAccountId as string) || process.env.FACEBOOK_AD_ACCOUNT_ID;
	const statusParam = req.query.status as string | undefined;

	if (!accessToken) {
		return res.status(500).json({ message: "FACEBOOK_ACCESS_TOKEN is not configured" });
	}

	if (!adAccountId) {
		return res.status(400).json({ message: "adAccountId is required (query param or env FACEBOOK_AD_ACCOUNT_ID)" });
	}

	try {
		const { data } = await axios.get(`${graphApiUrl}/${adAccountId}/campaigns`, {
			params: {
				access_token: accessToken,
				fields: "id,name,status,effective_status,objective,start_time,stop_time",
				limit: 200,
				...(statusParam ? { filtering: JSON.stringify([{ field: "campaign.effective_status", operator: "IN", value: statusParam.split(",") }]) } : {}),
			},
		});

		const campaigns = Array.isArray(data?.data)
			? data.data.map((c: any) => ({
					id: c?.id || "",
					name: c?.name || "",
					status: c?.status,
					effectiveStatus: c?.effective_status,
					objective: c?.objective,
					startTime: c?.start_time,
					stopTime: c?.stop_time,
				}))
			: [];

		return res.json({
			adAccountId,
			count: campaigns.length,
			campaigns,
			raw: data?.data ?? [],
		});
	} catch (error: any) {
		const status = error?.response?.status || 500;
		const message = error?.response?.data || error?.message || "Failed to fetch Facebook campaigns";
		console.error("Failed to fetch Facebook campaigns", message);
		return res.status(status).json({ message });
	}
};

/**
 * GET /facebook/adsets
 * Lists ad sets for a given campaign.
 * Query params:
 *  - campaignId: string (required)
 */
export const getFacebookAdSets = async (req: Request, res: Response) => {
	const campaignId = req.query.campaignId as string;

	if (!accessToken) {
		return res.status(500).json({ message: "FACEBOOK_ACCESS_TOKEN is not configured" });
	}

	if (!campaignId) {
		return res.status(400).json({ message: "campaignId is required (query param)" });
	}

	try {
		const { data } = await axios.get(`${graphApiUrl}/${campaignId}/adsets`, {
			params: {
				access_token: accessToken,
				fields: "id,name,status,effective_status,optimization_goal,daily_budget,lifetime_budget,start_time,end_time",
				limit: 200,
			},
		});

		const adSets = Array.isArray(data?.data)
			? data.data.map((adset: any) => ({
					id: adset?.id || "",
					name: adset?.name || "",
					status: adset?.status,
					effectiveStatus: adset?.effective_status,
					optimizationGoal: adset?.optimization_goal,
					dailyBudget: adset?.daily_budget ? Number(adset.daily_budget) : null,
					lifetimeBudget: adset?.lifetime_budget ? Number(adset.lifetime_budget) : null,
					startTime: adset?.start_time,
					endTime: adset?.end_time,
				}))
			: [];

		return res.json({
			campaignId,
			count: adSets.length,
			adSets,
			raw: data?.data ?? [],
		});
	} catch (error: any) {
		const status = error?.response?.status || 500;
		const message = error?.response?.data || error?.message || "Failed to fetch Facebook ad sets";
		console.error("Failed to fetch Facebook ad sets", message);
		return res.status(status).json({ message });
	}
};

/**
 * GET /facebook/ads
 * Lists ads for a given ad set.
 * Query params:
 *  - adSetId: string (required)
 */
export const getFacebookAds = async (req: Request, res: Response) => {
	const adSetId = req.query.adSetId as string;

	if (!accessToken) {
		return res.status(500).json({ message: "FACEBOOK_ACCESS_TOKEN is not configured" });
	}

	if (!adSetId) {
		return res.status(400).json({ message: "adSetId is required (query param)" });
	}

	try {
		const { data } = await axios.get(`${graphApiUrl}/${adSetId}/ads`, {
			params: {
				access_token: accessToken,
				fields: "id,name,status,effective_status,creative{id,name},bid_strategy,daily_budget,lifetime_budget,adset_id,campaign_id",
				limit: 200,
			},
		});

		const ads = Array.isArray(data?.data)
			? data.data.map((ad: any) => ({
					id: ad?.id || "",
					name: ad?.name || "",
					status: ad?.status,
					effectiveStatus: ad?.effective_status,
					adSetId: ad?.adset_id,
					campaignId: ad?.campaign_id,
					bidStrategy: ad?.bid_strategy,
					dailyBudget: ad?.daily_budget ? Number(ad.daily_budget) : null,
					lifetimeBudget: ad?.lifetime_budget ? Number(ad.lifetime_budget) : null,
					creative: ad?.creative ? { id: ad.creative.id, name: ad.creative.name } : null,
				}))
			: [];

		return res.json({
			adSetId,
			count: ads.length,
			ads,
			raw: data?.data ?? [],
		});
	} catch (error: any) {
		const status = error?.response?.status || 500;
		const message = error?.response?.data || error?.message || "Failed to fetch Facebook ads";
		console.error("Failed to fetch Facebook ads", message);
		return res.status(status).json({ message });
	}
};

export default { getFacebookDailySpend, getFacebookDailySpendRange, getFacebookCampaignDailySpend, getFacebookAdAccounts, getFacebookCampaigns, getFacebookAdSets, getFacebookAds };