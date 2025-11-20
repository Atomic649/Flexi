import express from 'express';
import request from 'supertest';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Prisma mock
const prismaMock: any = {
	member: { findUnique: jest.fn() },
	bill: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
	expense: { findMany: jest.fn() },
};

jest.mock('../src/generated/client1', () => {
	return { __esModule: true, PrismaClient: jest.fn().mockImplementation(() => prismaMock) };
});

import {
	getMonthlyReport,
	getBillsByDateRange,
	getExpenseByDateRange,
	searchBillsByCustomer,
	generateInvoicePDF,
	searchBillById,
} from '../src/controllers/printController';

const app = express();
app.use(express.json());
app.get('/print/monthly', (req, res) => getMonthlyReport(req, res));
app.get('/print/bills-range', (req, res) => getBillsByDateRange(req, res));
app.get('/print/expenses-range', (req, res) => getExpenseByDateRange(req, res));
app.get('/print/search-customer', (req, res) => searchBillsByCustomer(req, res));
app.get('/print/invoice/:billId', (req, res) => generateInvoicePDF(req, res));
app.get('/print/search-by-id', (req, res) => searchBillById(req, res));

describe('printController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getMonthlyReport', () => {
		test('requires memberId', async () => {
			const res = await request(app).get('/print/monthly');
			expect(res.status).toBe(400);
			expect(res.body.error).toMatch(/Member ID is required/i);
		});

		test('returns aggregated monthly report', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.bill.findMany.mockResolvedValue([
				{
					id: 1,
					purchaseAt: new Date('2025-11-10T10:00:00Z'),
					cashStatus: true,
					product: [
						{ unitPrice: 100, quantity: 2, unitDiscount: 5 }, // sales 200, discount 10
					],
				},
				{
					id: 2,
					purchaseAt: new Date('2025-11-20T10:00:00Z'),
					cashStatus: false,
					product: [
						{ unitPrice: 50, quantity: 1, unitDiscount: 0 }, // sales 50, discount 0
					],
				},
			]);

			const res = await request(app)
				.get('/print/monthly')
				.query({ memberId: 'MID-1', year: '2025', month: '11' });
			expect(res.status).toBe(200);
			// totalSales = (200+50) - (10+0) = 240
			expect(res.body.totalSales).toBe(240);
			expect(res.body.totalOrders).toBe(2);
			expect(res.body.paidOrders).toBe(1);
			expect(res.body.unpaidOrders).toBe(1);
			expect(res.body.averageOrderValue).toBe(120);
			expect(Array.isArray(res.body.bills)).toBe(true);
		});
	});

	describe('getBillsByDateRange', () => {
		test('requires memberId, startDate, endDate', async () => {
			let res = await request(app).get('/print/bills-range');
			expect(res.status).toBe(400);
			res = await request(app).get('/print/bills-range').query({ memberId: 'MID-1', startDate: '2025-11-01' });
			expect(res.status).toBe(400);
		});

		test('returns bills within range', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.bill.findMany.mockResolvedValue([
				{ id: 1, purchaseAt: new Date('2025-11-10T10:00:00Z'), product: [] },
			]);
			const res = await request(app)
				.get('/print/bills-range')
				.query({ memberId: 'MID-1', startDate: '2025-11-01', endDate: '2025-11-30' });
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(1);
		});
	});

	describe('getExpenseByDateRange', () => {
		test('requires memberId, startDate, endDate', async () => {
			let res = await request(app).get('/print/expenses-range');
			expect(res.status).toBe(400);
			res = await request(app).get('/print/expenses-range').query({ memberId: 'MID-1', startDate: '2025-11-01' });
			expect(res.status).toBe(400);
		});

		test('returns expenses within range', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.expense.findMany.mockResolvedValue([
				{ id: 1, date: new Date('2025-11-10T10:00:00Z'), amount: 100 },
			]);
			const res = await request(app)
				.get('/print/expenses-range')
				.query({ memberId: 'MID-1', startDate: '2025-11-01', endDate: '2025-11-30' });
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(1);
		});
	});

	describe('searchBillsByCustomer', () => {
		test('requires memberId and customerName', async () => {
			let res = await request(app).get('/print/search-customer');
			expect(res.status).toBe(400);
			res = await request(app).get('/print/search-customer').query({ memberId: 'MID-1' });
			expect(res.status).toBe(400);
		});

		test('returns matched bills', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.bill.findMany.mockResolvedValue([
				{ id: 1, cName: 'John', cLastName: 'Doe' },
			]);
			const res = await request(app)
				.get('/print/search-customer')
				.query({ memberId: 'MID-1', customerName: 'john' });
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(1);
		});
	});

	describe('generateInvoicePDF', () => {
		test('requires billId param', async () => {
			// Calling route without param would 404; instead test not found bill
			prismaMock.bill.findUnique.mockResolvedValue(null);
			const res = await request(app).get('/print/invoice/999');
			expect(res.status).toBe(404);
		});

		test('returns 200 and message when bill exists', async () => {
			prismaMock.bill.findUnique.mockResolvedValue({ id: 7, billId: 'INV1' });
			const res = await request(app).get('/print/invoice/7');
			expect(res.status).toBe(200);
			expect(res.body.message).toMatch(/PDF generation would happen here/i);
			expect(res.body.bill.id).toBe(7);
		});
	});

	describe('searchBillById', () => {
		test('requires billId and memberId', async () => {
			let res = await request(app).get('/print/search-by-id');
			expect(res.status).toBe(400);
			res = await request(app).get('/print/search-by-id').query({ billId: 'INV1' });
			expect(res.status).toBe(400);
		});

		test('returns null when not found', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.bill.findFirst.mockResolvedValue(null);
			const res = await request(app)
				.get('/print/search-by-id')
				.query({ billId: 'INV1', memberId: 'MID-1' });
			expect(res.status).toBe(200);
			expect(res.body).toBeNull();
		});

		test('returns bill when found', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.bill.findFirst.mockResolvedValue({ id: 3, billId: 'INV2025/1' });
			const res = await request(app)
				.get('/print/search-by-id')
				.query({ billId: '2025/1', memberId: 'MID-1' });
			expect(res.status).toBe(200);
			expect(res.body.id).toBe(3);
		});
	});
});

