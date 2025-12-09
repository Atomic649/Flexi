import express from "express";
import request from "supertest";
import { describe, beforeEach, test, expect, jest } from "@jest/globals";

const prismaMock = {
	adEvent: {
		create: jest.fn(),
	},
} as { adEvent: { create: jest.Mock } };

jest.mock("../lib/PrismaClient2", () => ({
	flexiAdsDBPrismaClient: prismaMock,
}));

import { trackEvent } from "../src/controllers/adsEventController";

const app = express();
app.use(express.json());
app.post("/ads-tracking", trackEvent);

describe("trackEvent controller", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("records a valid impression event payload", async () => {
		prismaMock.adEvent.create.mockImplementation(async () => ({
			id: 1,
			productId: 10,
			campaignId: 5,
			type: "IMPRESSION",
			viewerId: "viewer-123",
			createdAt: new Date().toISOString(),
		}));

		const response = await request(app)
			.post("/ads-tracking")
			.send({
				productId: 10,
				campaignId: 5,
				viewerId: "viewer-123",
				type: "impression",
			});

		expect(response.status).toBe(201);
		expect(response.body.message).toMatch(/IMPRESSION/);
		expect(prismaMock.adEvent.create).toHaveBeenCalledWith({
			data: {
				productId: 10,
				campaignId: 5,
				type: "IMPRESSION",
				viewerId: "viewer-123",
			},
		});
	});

	test("records a valid click event payload", async () => {
		prismaMock.adEvent.create.mockImplementation(async () => ({
			id: 2,
			productId: 11,
			campaignId: null,
			type: "CLICK",
			viewerId: "viewer-click",
			createdAt: new Date().toISOString(),
		}));

		const response = await request(app)
			.post("/ads-tracking")
			.send({
				productId: 11,
				viewerId: "viewer-click",
				type: "Click",
			});

		expect(response.status).toBe(201);
		expect(response.body.message).toMatch(/CLICK/);
		expect(prismaMock.adEvent.create).toHaveBeenCalledWith({
			data: {
				productId: 11,
				campaignId: undefined,
				type: "CLICK",
				viewerId: "viewer-click",
			},
		});
	});

	test("records a valid view event payload", async () => {
		prismaMock.adEvent.create.mockImplementation(async () => ({
			id: 3,
			productId: 12,
			campaignId: 8,
			type: "VIEW",
			viewerId: "viewer-view",
			createdAt: new Date().toISOString(),
		}));

		const response = await request(app)
			.post("/ads-tracking")
			.send({
				productId: 12,
				campaignId: 8,
				viewerId: "viewer-view",
				type: "VIEW",
			});

		expect(response.status).toBe(201);
		expect(response.body.message).toMatch(/VIEW/);
		expect(prismaMock.adEvent.create).toHaveBeenCalledWith({
			data: {
				productId: 12,
				campaignId: 8,
				type: "VIEW",
				viewerId: "viewer-view",
			},
		});
	});

	test("rejects payload missing productId", async () => {
		const response = await request(app)
			.post("/ads-tracking")
			.send({
				viewerId: "viewer-123",
				type: "CLICK",
			});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid ad event payload");
		expect(response.body.errors.join(" ")).toMatch(/productId/i);
		expect(prismaMock.adEvent.create).not.toHaveBeenCalled();
	});

	test("rejects payload with unsupported type", async () => {
		const response = await request(app)
			.post("/ads-tracking")
			.send({
				productId: 9,
				viewerId: "viewer-abc",
				type: "like",
			});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid ad event payload");
		expect(response.body.errors.join(" ")).toMatch(/must be one of/i);
		expect(prismaMock.adEvent.create).not.toHaveBeenCalled();
	});
});
