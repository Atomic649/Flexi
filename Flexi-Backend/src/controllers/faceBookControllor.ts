import { Request, Response } from "express";
import axios from "axios";
import cron from "node-cron";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";
import { Prisma, SocialMedia } from "../generated/client1/client";

const graphApiVersion = process.env.FACEBOOK_GRAPH_VERSION || "v20.0";
const graphApiUrl = `https://graph.facebook.com/${graphApiVersion}`;
// NOTE: access token is no longer taken from env. We resolve per-member tokens
// from the `PlatformToken` table (platform = SocialMedia.Facebook).

// Helper: find a stored Facebook token by memberId
const findFacebookTokenByMemberId = async (memberId?: string) => {
	if (!memberId) return null;
	try {
		const rec = await prisma.platformToken.findFirst({ where: { memberId, platform: SocialMedia.Facebook } });
		return rec?.token ?? null;
	} catch (err) {
		console.error("Error fetching platform token for member", memberId, err);
		return null;
	}
};

// Try to infer memberId from the authenticated request (if available)
const getMemberIdFromRequest = async (req: Request) => {
	const userObj = (req as any).user;
	const userId = userObj?.id;
	if (!userId) return null;
	try {
		const member = await prisma.member.findFirst({ where: { userId: Number(userId) } });
		return member?.uniqueId ?? null;
	} catch (err) {
		console.error("Error resolving memberId from request user", err);
		return null;
	}
};

// Resolve an access token for the incoming request. Priority:
// 1) explicit memberId in query/body
// 2) member inferred from authenticated user
// 3) first available Facebook token in DB (fallback)
const resolveFacebookAccessTokenForRequest = async (req: Request) => {
	const memberIdParam = (req.query.memberId as string) || (req.body?.memberId as string);
	if (memberIdParam) {
		const t = await findFacebookTokenByMemberId(memberIdParam);
		if (t) return t;
	}

	const inferred = await getMemberIdFromRequest(req);
	if (inferred) {
		const t = await findFacebookTokenByMemberId(inferred);
		if (t) return t;
	}

	const any = await prisma.platformToken.findFirst({ where: { platform: SocialMedia.Facebook } });
	return any?.token ?? null;
};

const prisma = flexiDBPrismaClient;

type CampaignSpendWithMeta = {
	date: string;
	campaignId: string;
	campaignName: string;
	spend: number;
	currency: string;
	platformId: number | null;
	productId: number | null;
	productName: string | null;
	memberId: string | null;
	businessAcc: number | null;
	accId?: string | null;
};

const fetchFacebookCampaignDailySpend = async (params: {
	adAccountId: string;
	since: string;
	until: string;
	campaignId?: string;
	accessToken: string;
}): Promise<CampaignSpendWithMeta[]> => {
	const { adAccountId, since, until, campaignId, accessToken } = params;
	const timeRange = { since, until };
	const { data } = await axios.get(`${graphApiUrl}/${adAccountId}/insights`, {
		params: {
			fields: "campaign_id,campaign_name,spend,account_currency,date_start,date_stop",
			time_increment: 1,
			time_range: JSON.stringify(timeRange),
			level: "campaign",
			access_token: accessToken,
			...(campaignId
				? { filterings: JSON.stringify([{ field: "campaign.id", operator: "IN", value: [campaignId] }]) }
				: {}),
		},
	});

	const rows = Array.isArray(data?.data) ? data.data : [];
	const campaignIds = rows
		.map((row: any) => row?.campaign_id)
		.filter((id: any): id is string => typeof id === "string" && id.length > 0);

	let linkedPlatforms: Record<string, { platformId: number; productId: number | null; productName: string | null; memberId: string; businessAcc: number; }>; // map by campaignId and accId
	linkedPlatforms = {};
	if (campaignIds.length > 0) {
		const platformRows = await prisma.platform.findMany({
			where: {
				platform: SocialMedia.Facebook,
				deleted: false,
				OR: [
					{ campaignId: { in: campaignIds } },
					{ accId: { in: [adAccountId, ...campaignIds] } },
				],
			},
			select: {
				id: true,
				accId: true,
				campaignId: true,
				productId: true,
				product: { select: { name: true } },
				businessAcc: true,
				memberId: true,
			},
		});

		linkedPlatforms = platformRows.reduce((acc, row) => {
			const payload = {
				platformId: row.id,
				productId: row.productId ?? null,
				productName: row.product?.name ?? null,
				memberId: row.memberId,
				businessAcc: row.businessAcc,
			};
			if (row.campaignId) acc[row.campaignId] = payload;
			if (row.accId) acc[row.accId] = payload;
			return acc;
		}, {} as Record<string, { platformId: number; productId: number | null; productName: string | null; memberId: string; businessAcc: number; }>);
	}

	return rows.map((row: any) => {
		const linked = linkedPlatforms[row?.campaign_id || ""] || linkedPlatforms[adAccountId];
		return {
			date: row?.date_start || row?.date_stop,
			campaignId: row?.campaign_id || "",
			campaignName: row?.campaign_name || "",
			spend: row?.spend ? Number(row.spend) : 0,
			currency: row?.account_currency || "",
			platformId: linked?.platformId ?? null,
			productId: linked?.productId ?? null,
			productName: linked?.productName ?? null,
			memberId: linked?.memberId ?? null,
			businessAcc: linked?.businessAcc ?? null,
			accId: adAccountId,
		} as CampaignSpendWithMeta;
	});
};



/**
 * GET /facebook/daily-spend
 * Query params:
 *  - adAccountId: string (e.g., "act_123456789"), optional if FACEBOOK_AD_ACCOUNT_ID env is set
 *  - date: YYYY-MM-DD, optional (defaults to today, UTC)
 */
export const getFacebookDailySpend = async (req: Request, res: Response) => {
	const adAccountId = (req.query.adAccountId as string) || process.env.FACEBOOK_AD_ACCOUNT_ID;
	const dateParam = (req.query.date as string) || new Date().toISOString().slice(0, 10);

	const token = await resolveFacebookAccessTokenForRequest(req);
	if (!token) return res.status(500).json({ message: "Facebook access token not found; please save token for a member via /facebook/token" });

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
				access_token: token,
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

	const token = await resolveFacebookAccessTokenForRequest(req);
	if (!token) return res.status(500).json({ message: "Facebook access token not found; please save token for a member via /facebook/token" });

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
				access_token: token,
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

	const token = await resolveFacebookAccessTokenForRequest(req);
	if (!token) return res.status(500).json({ message: "Facebook access token not found; please save token for a member via /facebook/token" });

	if (!adAccountId) {
		return res.status(400).json({ message: "adAccountId is required (query param or env FACEBOOK_AD_ACCOUNT_ID)" });
	}

	try {
		const daily = await fetchFacebookCampaignDailySpend({ adAccountId, since, until, campaignId, accessToken: token });

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

	const token = await resolveFacebookAccessTokenForRequest(req);
	if (!token) return res.status(500).json({ message: "Facebook access token not found; please save token for a member via /facebook/token" });

	try {
		const endpoint = businessId ? `${graphApiUrl}/${businessId}/adaccounts` : `${graphApiUrl}/me/adaccounts`;
		const { data } = await axios.get(endpoint, {
			params: {
				access_token: token,
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

	const token = await resolveFacebookAccessTokenForRequest(req);
	if (!token) return res.status(500).json({ message: "Facebook access token not found; please save token for a member via /facebook/token" });

	if (!adAccountId) {
		return res.status(400).json({ message: "adAccountId is required (query param or env FACEBOOK_AD_ACCOUNT_ID)" });
	}

	try {
		const { data } = await axios.get(`${graphApiUrl}/${adAccountId}/campaigns`, {
			params: {
				access_token: token,
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

	const token = await resolveFacebookAccessTokenForRequest(req);
	if (!token) return res.status(500).json({ message: "Facebook access token not found; please save token for a member via /facebook/token" });

	if (!campaignId) {
		return res.status(400).json({ message: "campaignId is required (query param)" });
	}

	try {
		const { data } = await axios.get(`${graphApiUrl}/${campaignId}/adsets`, {
			params: {
				access_token: token,
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

	const token = await resolveFacebookAccessTokenForRequest(req);
	if (!token) return res.status(500).json({ message: "Facebook access token not found; please save token for a member via /facebook/token" });

	if (!adSetId) {
		return res.status(400).json({ message: "adSetId is required (query param)" });
	}

	try {
		const { data } = await axios.get(`${graphApiUrl}/${adSetId}/ads`, {
			params: {
				access_token: token,
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

const normalizeDateOnly = (dateStr: string, fallback: Date) => {
	if (!dateStr) return fallback;
	const parsed = new Date(`${dateStr}T00:00:00Z`);
	return isNaN(parsed.getTime()) ? fallback : parsed;
};

const dedupeAdsCostRows = (rows: Prisma.AdsCostCreateManyInput[]) => {
	const normalizeKeyDate = (value: Date | string) => {
		const parsed = typeof value === "string" ? new Date(value) : value;
		return isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
	};

	const map = new Map<string, Prisma.AdsCostCreateManyInput>();
	for (const row of rows) {
		const dateKey = normalizeKeyDate(row.date);
		const key = `${dateKey}-${row.platformId}-${row.product}`;
		if (!map.has(key)) map.set(key, row);
	}
	return Array.from(map.values());
};

const buildAdsCostRowsFromSpend = (daily: CampaignSpendWithMeta[], targetDate: Date) => {
	return daily
		.filter((row) => row.platformId && row.productName && row.memberId && row.businessAcc !== null && row.businessAcc !== undefined)
		.map((row) => ({
			date: normalizeDateOnly(row.date, targetDate),
			adsCost: new Prisma.Decimal(row.spend || 0),
			memberId: row.memberId as string,
			platformId: row.platformId as number,
			businessAcc: row.businessAcc as number,
			product: row.productId as number,
		})) as Prisma.AdsCostCreateManyInput[];
};

const makeUtcDayKey = (value: Date | string) => {
	const parsed = typeof value === "string" ? new Date(value) : value;
	return isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const startOfUtcDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addUtcDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

// Range ingestion (API): defaults to last 30 days, loops day-by-day per ad account
const ingestFacebookSpendRangeToAdsCosts = async (options?: { since?: string; until?: string }) => {

	const todayUtc = new Date();
	const defaultUntil = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate()));
	const until = options?.until ? new Date(`${options.until}T00:00:00Z`) : defaultUntil;
	const since = options?.since ? new Date(`${options.since}T00:00:00Z`) : new Date(until.getTime() - 29 * 24 * 60 * 60 * 1000);

	const makeDateKey = (d: Date) => d.toISOString().slice(0, 10);
	const dates: Date[] = [];
	for (let ts = since.getTime(); ts <= until.getTime(); ts += 24 * 60 * 60 * 1000) {
		dates.push(new Date(ts));
	}

	// Discover distinct Facebook ad accounts from platform table
	const platformAccounts = await prisma.platform.findMany({
		where: {
			platform: SocialMedia.Facebook,
			deleted: false,
			accId: { notIn: ["", "null"] },
		},
		select: { accId: true },
		distinct: ["accId"],
	});

	const adAccountIds = Array.from(
		new Set(platformAccounts.map((p) => p.accId).filter((id): id is string => !!id && id.length > 0))
	);

	const rowsToInsert: Prisma.AdsCostCreateManyInput[] = [];
	for (const adAccountId of adAccountIds) {
		// Find a platform row for this ad account to identify the member who owns it
		const platformRow = await prisma.platform.findFirst({ where: { accId: adAccountId, platform: SocialMedia.Facebook, deleted: false }, select: { memberId: true } });
		const memberIdForAccount = platformRow?.memberId;
		// Resolve token for this ad account's member (fallback to any Facebook token)
		let tokenForAccount: string | null = null;
		if (memberIdForAccount) tokenForAccount = await findFacebookTokenByMemberId(memberIdForAccount);
		if (!tokenForAccount) {
			const any = await prisma.platformToken.findFirst({ where: { platform: SocialMedia.Facebook } });
			tokenForAccount = any?.token ?? null;
		}

		if (!tokenForAccount) {
			console.warn(`No Facebook token found for ad account ${adAccountId}; skipping`);
			continue;
		}

		for (const date of dates) {
			const dateStr = makeDateKey(date);
			try {
				const daily = await fetchFacebookCampaignDailySpend({ adAccountId, since: dateStr, until: dateStr, accessToken: tokenForAccount });
				rowsToInsert.push(...buildAdsCostRowsFromSpend(daily, date));
			} catch (error) {
				console.error(`Failed to ingest spend for ad account ${adAccountId} on ${dateStr}`, error);
			}
		}
	}

	const deduped = dedupeAdsCostRows(rowsToInsert);
	if (deduped.length === 0) {
		console.log("Facebook ads cost ingestion: no rows to insert");
		return { inserted: 0, message: "no rows" };
	}

	// Replace/Update strategy (requested): if an AdsCost row already exists for the same UTC day + platform,
	// update it (and delete any accidental duplicates). Otherwise, create a new row.
	const rangeStart = startOfUtcDay(since);
	const rangeEndExclusive = addUtcDays(startOfUtcDay(until), 1);
	const platformIds = Array.from(new Set(deduped.map((r) => r.platformId).filter((v): v is number => typeof v === "number")));
	const existing = platformIds.length
		? await prisma.adsCost.findMany({
				where: {
					platformId: { in: platformIds },
					date: { gte: rangeStart, lt: rangeEndExclusive },
				},
				select: { id: true, date: true, platformId: true },
		  })
		: [];

	const existingByKey = new Map<string, number[]>();
	for (const row of existing) {
		const dayKey = makeUtcDayKey(row.date);
		if (!dayKey) continue;
		const key = `${dayKey}-${row.platformId}`;
		const list = existingByKey.get(key);
		if (list) list.push(row.id);
		else existingByKey.set(key, [row.id]);
	}

	let inserted = 0;
	let updated = 0;
	let deletedDuplicates = 0;
	for (const row of deduped) {
		const dayKey = makeUtcDayKey(row.date);
		if (!dayKey) continue;
		const key = `${dayKey}-${row.platformId}`;
		const existingIds = existingByKey.get(key) ?? [];

		if (existingIds.length === 0) {
			await prisma.adsCost.create({ data: row as Prisma.AdsCostUncheckedCreateInput });
			inserted += 1;
			continue;
		}

		const [keepId, ...dupIds] = existingIds;
		await prisma.adsCost.update({
			where: { id: keepId },
			data: {
				date: row.date as Date,
				adsCost: row.adsCost as Prisma.Decimal,
				memberId: row.memberId as string,
				platformId: row.platformId as number,
				businessAcc: row.businessAcc as number,
				product: row.product as number,
			},
		});
		updated += 1;

		if (dupIds.length > 0) {
			const del = await prisma.adsCost.deleteMany({ where: { id: { in: dupIds } } });
			deletedDuplicates += del.count;
		}
	}

	console.log(
		`Facebook ads cost ingestion finished: inserted=${inserted}, updated=${updated}, deletedDuplicates=${deletedDuplicates} (${makeDateKey(since)}..${makeDateKey(until)})`
	);
	return {
		inserted,
		updated,
		deletedDuplicates,
		since: makeDateKey(since),
		until: makeDateKey(until),
	};
};

// Single-day ingestion (Cron): target yesterday only
const ingestFacebookSpendYesterdayToAdsCosts = async () => {
	const todayUtc = new Date();
	const yesterday = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate() - 1));
	const dateStr = yesterday.toISOString().slice(0, 10);
	return ingestFacebookSpendRangeToAdsCosts({ since: dateStr, until: dateStr });
};

export const runFacebookAdsCostIngestion = async (req: Request, res: Response) => {
	try {
		const { since, until } = req.query;
		const result = await ingestFacebookSpendRangeToAdsCosts({
			since: since ? String(since) : undefined,
			until: until ? String(until) : undefined,
		});
		return res.status(200).json({ status: "ok", ...result });
	} catch (error: any) {
		console.error("Failed to run Facebook ads cost ingestion", error);
		return res.status(500).json({ message: "Failed to ingest Facebook ads costs", error: error?.message || String(error) });
	}
};

export const facebookAdsCostCronJob = cron.schedule("9 0 * * *", async () => {
	console.log("Running Facebook ads cost ingestion cron (00:09)");
	await ingestFacebookSpendYesterdayToAdsCosts();
});

/**
 * POST /facebook/token
 * Body: { memberId: string, token: string, expiresAt: string|number }
 * Stores or updates the Facebook access token for a member in PlatformToken table.
 */
export const saveFacebookToken = async (req: Request, res: Response) => {
	try {
		const { memberId, token, expiresAt } = req.body as { memberId?: string; token?: string; expiresAt?: string | number };

		if (!memberId || !token || !expiresAt) {
			return res.status(400).json({ message: "memberId, token and expiresAt are required" });
		}

		const expiresDate = typeof expiresAt === "number" ? new Date(Number(expiresAt)) : new Date(String(expiresAt));
		if (isNaN(expiresDate.getTime())) {
			return res.status(400).json({ message: "expiresAt must be a valid date or timestamp" });
		}

		// Try to find existing token record for this member + platform
		const existing = await prisma.platformToken.findFirst({ where: { memberId, platform: SocialMedia.Facebook } });

		if (existing) {
			const updated = await prisma.platformToken.update({ where: { id: existing.id }, data: { token, expiresAt: expiresDate } });
			return res.status(200).json({ status: "updated", token: updated });
		}

		const created = await prisma.platformToken.create({ data: { memberId, platform: SocialMedia.Facebook, token, expiresAt: expiresDate } });
		return res.status(201).json({ status: "created", token: created });
	} catch (err: any) {
		// Handle unique constraint or other Prisma errors gracefully
		const code = err?.code || err?.response?.status || 500;
		console.error("Failed to save Facebook token", err?.message || err);
		if (err?.code === "P2002") {
			return res.status(409).json({ message: "Token already exists" });
		}
		return res.status(Number(code) || 500).json({ message: err?.message || "Failed to save token" });
	}
};

/**
 * POST /facebook/exchange
 * Body: { accessToken: string }
 * Exchanges a short-lived Facebook token for a long-lived token using the app secret.
 * Requires server env vars: FACEBOOK_APP_ID and FACEBOOK_APP_SECRET
 */
export const exchangeFacebookToken = async (req: Request, res: Response) => {
	try {
		const { accessToken: shortLived } = req.body as { accessToken?: string };
		if (!shortLived) return res.status(400).json({ message: "accessToken is required" });

		const appId = process.env.FACEBOOK_APP_ID;
		const appSecret = process.env.FACEBOOK_APP_SECRET;
		if (!appId || !appSecret) {
			console.error("Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET env vars");
			return res.status(500).json({ message: "Facebook app credentials not configured on server" });
		}

		const url = `${graphApiUrl}/oauth/access_token`;
		const params = {
			grant_type: "fb_exchange_token",
			client_id: appId,
			client_secret: appSecret,
			fb_exchange_token: shortLived,
		};

		const r = await axios.get(url, { params });
		const longToken = r.data?.access_token;
		const expiresIn = Number(r.data?.expires_in || 0);
		const expiresAt = Date.now() + expiresIn * 1000;

		if (!longToken) return res.status(500).json({ message: "Failed to obtain long-lived token from Facebook", details: r.data });

		return res.json({ accessToken: longToken, expiresAt });
	} catch (err: any) {
		console.error("Failed to exchange facebook token", err?.message || err);
		const status = err?.response?.status || 500;
		const details = err?.response?.data || err?.message;
		return res.status(status).json({ message: "Failed to exchange token", details });
	}
};

export default { getFacebookDailySpend, getFacebookDailySpendRange, getFacebookCampaignDailySpend, getFacebookAdAccounts, getFacebookCampaigns, getFacebookAdSets, getFacebookAds, saveFacebookToken, exchangeFacebookToken };