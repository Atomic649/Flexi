import express from 'express';
import request from 'supertest';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Prisma mock
const prismaMock: any = {
  member: { findUnique: jest.fn() },
  bill: { findMany: jest.fn() },
  adsCost: { findMany: jest.fn() },
  expense: { findMany: jest.fn() },
};

jest.mock('../src/generated/client1', () => {
  return { __esModule: true, PrismaClient: jest.fn().mockImplementation(() => prismaMock) };
});

import {
  dailyReport,
  monthlyReport,
  getListofAdsandExpenses,
  ReportDetailsEachDate,
  ReportDetailsEachMonth,
} from '../src/controllers/reportController';

const app = express();
app.use(express.json());
app.get('/report/daily/:memberId', (req, res) => dailyReport(req, res));
app.get('/report/monthly/:memberId', (req, res) => monthlyReport(req, res));
app.get('/report/list/:memberId', (req, res) => getListofAdsandExpenses(req, res));
app.get('/report/day/:memberId/:date', (req, res) => ReportDetailsEachDate(req, res));
app.get('/report/month/:memberId/:month', (req, res) => ReportDetailsEachMonth(req, res));

describe('reportController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dailyReport', () => {
    test('aggregates bills and adsCost per day', async () => {
      prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
      prismaMock.bill.findMany.mockResolvedValue([
        {
          purchaseAt: new Date('2025-11-20T10:00:00Z'),
          total: 100,
          discount: 5,
          billLevelDiscount: 2,
          beforeDiscount: 120,
          product: [
            { quantity: 2 },
            { quantity: 1 },
          ],
        },
        {
          purchaseAt: new Date('2025-11-20T18:00:00Z'),
          total: 50,
          discount: 0,
          billLevelDiscount: 3,
          beforeDiscount: 80,
          product: [
            { quantity: 3 },
          ],
        },
      ]);
      prismaMock.adsCost.findMany.mockResolvedValue([
        { date: new Date('2025-11-20T01:00:00Z'), adsCost: '30' },
        { date: new Date('2025-11-20T12:00:00Z'), adsCost: 20 },
      ]);

      const res = await request(app).get('/report/daily/MID-1');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const row = res.body.find((r: any) => r.date === '2025-11-20');
      expect(row).toBeTruthy();
      expect(row.amount).toBe(6); // 2+1 + 3
      expect(row.sale).toBe(150);
      expect(row.adsCost).toBe(50);
      expect(row.profit).toBe(100);
      expect(row.totalDiscount).toBe(5);
      expect(row.billLevelDiscount).toBe(5);
      expect(row.beforeDiscount).toBe(200);
      expect(row.percentageAds).toBeCloseTo(33.33, 2);
      expect(row.ROI).toBeCloseTo(2.0, 1);
    });
  });

  describe('monthlyReport', () => {
    test('aggregates by month and merges ads cost and expenses', async () => {
      prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
      prismaMock.bill.findMany.mockResolvedValue([
        {
          purchaseAt: new Date('2025-11-05T10:00:00Z'),
          total: 120,
          discount: 5,
          billLevelDiscount: 1,
          beforeDiscount: 130,
          product: [{ quantity: 2 }],
        },
        {
          purchaseAt: new Date('2025-11-10T10:00:00Z'),
          total: 80,
          discount: 0,
          billLevelDiscount: 0,
          beforeDiscount: 90,
          product: [{ quantity: 1 }],
        },
      ]);
      prismaMock.adsCost.findMany.mockResolvedValue([
        { date: new Date('2025-11-01T00:00:00Z'), adsCost: 50 },
      ]);
      prismaMock.expense.findMany.mockResolvedValue([
        { date: new Date('2025-11-02T00:00:00Z'), amount: 20 },
      ]);

      const res = await request(app).get('/report/monthly/MID-1');
      expect(res.status).toBe(200);
      const row = res.body.find((r: any) => r.month === '2025-11');
      expect(row).toBeTruthy();
      expect(row.sale).toBe(200);
      expect(row.expenses).toBe(20);
      expect(row.adsCost).toBe(50);
      expect(row.amount).toBe(3);
      expect(row.profit).toBe(180);
      expect(row.percentageAds).toBeCloseTo(25.0, 2); // 50/200*100
      expect(row.ROI).toBeCloseTo(3.6, 1); // 180/50 = 3.6
      expect(row.totalDiscount).toBe(5);
      expect(row.billLevelDiscount).toBe(1);
      expect(row.beforeDiscount).toBe(220);
    });
  });

  describe('getListofAdsandExpenses', () => {
    test('returns merged and sorted list', async () => {
      prismaMock.adsCost.findMany.mockResolvedValue([
        { date: new Date('2025-11-19T00:00:00Z'), adsCost: 30, platform: { platform: 'FB', accName: 'A' } },
        { date: new Date('2025-11-20T00:00:00Z'), adsCost: 40, platform: { platform: 'GG', accName: 'B' } },
      ]);
      prismaMock.expense.findMany.mockResolvedValue([
        { id: 1, date: new Date('2025-11-18T00:00:00Z'), amount: 10, note: 'n', sName: 's', desc: 'd', image: '' },
      ]);
      const res = await request(app).get('/report/list/MID-1');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      // Sorted desc by date -> 2025-11-20 (ads), 2025-11-19 (ads), 2025-11-18 (expense)
      expect(res.body[0].type).toBe('ads');
      expect(res.body[2].type).toBe('expense');
      expect(res.body[0]).toHaveProperty('expenses'); // numeric amount field name
    });
  });

  describe('ReportDetailsEachDate', () => {
    test('returns bills, expenses and ads for a day', async () => {
      prismaMock.bill.findMany.mockResolvedValue([
        { billId: 'INV1', purchaseAt: new Date('2025-11-20T08:00:00Z'), total: 50, discount: 0, billLevelDiscount: 0, beforeDiscount: 60, product: [] },
      ]);
      prismaMock.expense.findMany.mockResolvedValue([
        { id: 1, date: new Date('2025-11-20T12:00:00Z'), amount: 10, note: 'n', sName: 's', desc: 'd' },
      ]);
      prismaMock.adsCost.findMany.mockResolvedValue([
        { id: 2, date: new Date('2025-11-20T10:00:00Z'), adsCost: 5, platform: { platform: 'FB', accName: 'A' } },
      ]);
      const res = await request(app).get('/report/day/MID-1/2025-11-20');
      expect(res.status).toBe(200);
      expect(res.body.bills.length).toBe(1);
      expect(res.body.expenses.length).toBe(1);
      expect(res.body.ads.length).toBe(1);
    });
  });

  describe('ReportDetailsEachMonth', () => {
    test('returns bills, expenses and ads for a month', async () => {
      prismaMock.bill.findMany.mockResolvedValue([
        { billId: 'INV1', purchaseAt: new Date('2025-11-10T08:00:00Z'), total: 50, discount: 0, billLevelDiscount: 0, beforeDiscount: 60, product: [] },
      ]);
      prismaMock.expense.findMany.mockResolvedValue([
        { id: 1, date: new Date('2025-11-12T12:00:00Z'), amount: 10, note: 'n', sName: 's', desc: 'd' },
      ]);
      prismaMock.adsCost.findMany.mockResolvedValue([
        { id: 2, date: new Date('2025-11-15T10:00:00Z'), adsCost: 5, platform: { platform: 'FB', accName: 'A' } },
      ]);
      const res = await request(app).get('/report/month/MID-1/2025-11');
      expect(res.status).toBe(200);
      expect(res.body.bills.length).toBe(1);
      expect(res.body.expenses.length).toBe(1);
      expect(res.body.ads.length).toBe(1);
    });
  });
});
