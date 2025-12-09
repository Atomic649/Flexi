import { Request, Response } from "express";
import Joi from "joi";
import { EventType } from "../generated/client2/client";
import { flexiAdsDBPrismaClient } from "../../lib/PrismaClient2";

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


  

export { trackEvent };

    
