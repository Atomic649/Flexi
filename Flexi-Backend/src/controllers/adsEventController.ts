import { Request, Response } from "express";
import Joi from "joi";
import { EventType } from "../generated/client2/client";
import { flexiAdsDBPrismaClient } from "../../lib/PrismaClient2";
import cron from 'node-cron'

// Create  instance of PrismaClient
const prisma = flexiAdsDBPrismaClient;

const trackEventSchema = Joi.object({
	productId: Joi.number().integer().positive().required(),
	campaignId: Joi.number().integer().positive().allow(null).optional(),
	viewerId: Joi.string().trim().required(),
	type: Joi.string()
		.valid(...Object.values(EventType))
		.insensitive()
		.required(),
});

const trackEvent = async (req: Request, res: Response) => {
    console.log("Received ad event payload:", req.body);
	try {
		const { error, value } = trackEventSchema.validate(req.body, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			return res.status(400).json({
				message: "Invalid ad event payload",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const { productId, campaignId, viewerId, type } = value as {
			productId: number;
			campaignId?: number | null;
			viewerId: string;
			type: string;
		};

		const normalizedType = type.toUpperCase() as EventType;

		const event = await prisma.adEvent.create({
			data: {
				productId: Number(productId),
				campaignId: campaignId !== null && campaignId !== undefined ? Number(campaignId) : undefined,
				type: normalizedType,
				viewerId: viewerId.trim(),
			},
		});

		return res.status(201).json({
			message: `${normalizedType} event recorded successfully`,
			event,
		});
	} catch (error) {
		console.error("Failed to record ad event", error);
		return res.status(500).json({
			message: "Failed to record ad event",
			error: error instanceof Error ? error.message : String(error),
		});
	}
};

// Core aggregation function (exported for testing and manual triggering)
const aggregateDailyKpi = async () => {
	console.log('Running daily KPI aggregation');
	try {
		const kpiRaw = await prisma.$queryRaw`
			SELECT 
				"campaignId",
				COUNT(CASE WHEN "type" = 'IMPRESSION' THEN 1 END) AS impressions,
				COUNT(CASE WHEN "type" = 'CLICK' THEN 1 END) AS clicks,
				COUNT(CASE WHEN "type" = 'VIEW' THEN 1 END) AS views
			FROM "flexiadsdb"."AdEvent"
			WHERE "createdAt" >= NOW() - INTERVAL '1 day'
			GROUP BY "campaignId"
		`;
			// Normalize raw values to JSON-safe numbers (handle BigInt)
			const kpiSummary = (kpiRaw as any[]).map((row: any) => ({
				campaignId: Number(row.campaignId),
				impressions: Number(row.impressions ?? 0),
				clicks: Number(row.clicks ?? 0),
				views: Number(row.views ?? 0),
			}));
			const nowIso = new Date().toISOString();
			const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
			console.log(`Daily KPI Summary (as of ${nowIso}, last 24h since ${sinceIso}):`, kpiSummary);

		// Persist summary into BoostResult table
		// Determine date as start of current day (UTC). Adjust if you need local timezone.
		const today = new Date();
		const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

		for (const row of kpiSummary as any[]) {
			const campaignId = row.campaignId;
			const impressions = row.impressions || 0;
			const clicks = row.clicks || 0;
			const views = row.views || 0;
			const ctr = views > 0 ? Number((clicks / views).toFixed(4)) : 0;
			const costSpent = 0; // TODO: compute if cost data is available

			// Upsert per (date, campaignId). If a unique constraint doesn't exist, consider create/update by findFirst.
			// Assuming Prisma model BoostResult exists under flexiadsdb schema in client2
			// Try update existing record for date+campaign, else create.
			const existing = await prisma.boostResult.findFirst({
				where: { date: startOfDay, campaignId },
			});
			if (existing) {
				await prisma.boostResult.update({
					where: { id: existing.id },
					data: { impressions, clicks, views, ctr, costSpent },
				});
			} else {
				await prisma.boostResult.create({
					data: { date: startOfDay, impressions, clicks, views, ctr, costSpent, campaignId },
				});
			}
		}

		return kpiSummary as any[];
	} catch (error) {
		console.error('Error during KPI aggregation job:', error);
		throw error;
	}
};

// Cron Job ที่สรุป KPI ของแต่ละ campaign midnight
const dailyKpiAggregationJob = cron.schedule('0 0 * * *', async () => {
	console.log('Running daily KPI aggregation job at midnight');
	await aggregateDailyKpi();
});


  

// HTTP handler to trigger aggregation manually (dev/testing)
const runDailyKpiNow = async (req: Request, res: Response) => {
	try {
		const summary = await aggregateDailyKpi();
		return res.status(200).json({ message: "Daily KPI aggregated", summary });
	} catch (error) {
		console.error("Failed to aggregate daily KPI", error);
		return res.status(500).json({
			message: "Failed to aggregate daily KPI",
			error: error instanceof Error ? error.message : String(error),
		});
	}
};

export { trackEvent, dailyKpiAggregationJob, aggregateDailyKpi, runDailyKpiNow };

    
