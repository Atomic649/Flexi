import express from "express";
import request from "supertest";
import { describe, beforeEach, test, expect, jest } from "@jest/globals";

const prismaMock: any = {
	adEvent: {
		create: jest.fn(),
	},
	boostResult: {
		findFirst: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
	$queryRaw: (jest.fn() as any).mockResolvedValue([]),
};

jest.mock("../lib/PrismaClient2", () => ({
	flexiAdsDBPrismaClient: prismaMock,
}));

// Mock node-cron so schedules execute immediately during test
jest.mock("node-cron", () => ({
	schedule: jest.fn((expr: string, fn: Function) => {
		// Do not auto-execute during import to avoid unintended calls
		return { start: jest.fn(), stop: jest.fn() };
	}),
}));

import { trackEvent, dailyKpiAggregationJob, aggregateDailyKpi } from "../src/controllers/adsEventController";

const app = express();
app.use(express.json());
app.post("/ads-tracking", trackEvent);

describe("trackEvent controller", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Ensure any incidental calls to aggregation see an iterable result
		prismaMock.$queryRaw.mockResolvedValue([]);
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

describe("dailyKpiAggregationJob", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		prismaMock.$queryRaw.mockResolvedValue([]);
	});

	test("executes KPI aggregation query for last day and persists BoostResult", async () => {
		// Arrange: mock query return
		prismaMock.$queryRaw.mockResolvedValue([
			{ campaignId: 101, impressions: 10, clicks: 2, views: 5 },
			{ campaignId: 202, impressions: 3, clicks: 0, views: 1 },
		]);
		prismaMock.boostResult.findFirst.mockResolvedValue(null);

		// Act: invoke the aggregation directly
		const result = await aggregateDailyKpi();
		console.log("KPI Aggregation Test Result:", result);

		// Assert: query was called with expected SQL fragment
		expect(prismaMock.$queryRaw).toHaveBeenCalled();
		const sqlCallArgs = prismaMock.$queryRaw.mock.calls[0][0];
		const sqlString = String(sqlCallArgs);
		expect(sqlString).toMatch(/SELECT/i);
		expect(sqlString).toMatch(/FROM\s+adEvent/i);
		expect(sqlString).toMatch(/INTERVAL '\s*1\s*day'/i);
		expect(sqlString).toMatch(/GROUP BY\s+campaignId/i);

		// And the returned result is the mocked summary
		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({ campaignId: 101, impressions: 10, clicks: 2, views: 5 });

		// Persist calls: create BoostResult entries for each row
		expect(prismaMock.boostResult.findFirst).toHaveBeenCalledTimes(2);
		expect(prismaMock.boostResult.create).toHaveBeenCalledTimes(2);
		const createArgs1 = prismaMock.boostResult.create.mock.calls[0][0];
		const createArgs2 = prismaMock.boostResult.create.mock.calls[1][0];
		expect(createArgs1.data).toMatchObject({ campaignId: 101, impressions: 10, clicks: 2 });
		expect(createArgs2.data).toMatchObject({ campaignId: 202, impressions: 3, clicks: 0 });
		// ctr computed correctly
		expect(createArgs1.data.ctr).toBeCloseTo(2 / 5, 4);
		expect(createArgs2.data.ctr).toBeCloseTo(0 / 1, 4);
	});

	test("updates existing BoostResult when present", async () => {
		prismaMock.$queryRaw.mockResolvedValue([
			{ campaignId: 999, impressions: 4, clicks: 1, views: 2 },
		]);
		prismaMock.boostResult.findFirst.mockResolvedValue({ id: 55, date: new Date(), campaignId: 999 });

		await aggregateDailyKpi();

		expect(prismaMock.boostResult.update).toHaveBeenCalledWith({
			where: { id: 55 },
			data: expect.objectContaining({ impressions: 4, clicks: 1 }),
		});
		expect(prismaMock.boostResult.create).not.toHaveBeenCalled();
	});
});
