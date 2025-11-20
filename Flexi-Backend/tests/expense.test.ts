import express from 'express';
import request from 'supertest';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock multer memory config and multer behavior
jest.mock('../src/middleware/multer_config', () => ({
	__esModule: true,
	default: {
		multerConfigImageMemory: {
			config: {},
			keyUpload: 'image',
		},
	},
}));

jest.mock('multer', () => {
	const mockMulter = () => ({
		single: () => (req: any, _res: any, cb: (err?: any) => void) => {
			// If header set, simulate a file upload
			if (req.headers && req.headers['x-mock-file'] === '1') {
				req.file = {
					buffer: Buffer.from('file-bytes'),
					mimetype: 'image/png',
					location: 'https://s3.example.com/bucket/old-key.png',
				};
			} else {
				req.file = undefined;
			}
			cb();
		},
	});
	(mockMulter as any).MulterError = class MulterError extends Error {};
	return mockMulter;
});

// Mock image service
jest.mock('../src/services/imageService', () => ({
	__esModule: true,
	uploadToS3: jest.fn(async () => 'https://s3.example.com/bucket/new-key.png'),
	deleteFromS3: jest.fn(async () => undefined),
	extractS3Key: jest.fn((url: string) => 'old-key.png'),
}));

// Mock OCR utils
jest.mock('../src/utils/ocrUtils', () => ({
	__esModule: true,
	extractTextFromImage: jest.fn(async (_buf: Buffer) => ({
		namesFound: ['บริษัท เอ', 'ร้าน บี'],
		taxIdsFound: ['1234567890123'],
		taxInvoiceIdsFound: ['INV-001'],
		vatAmountsFound: ['7.00'],
		amountsDetected: ['100.00'],
		datesDetected: ['22 กันยายน 2568'],
		addressesDetected: ['ที่อยู่ บางกอก'],
		provincesDetected: ['กรุงเทพมหานคร'],
		summary: {
			hasAtLeast2Names: true,
			hasAtLeast1TaxId: true,
			hasTaxInvoiceId: true,
			hasAmount: true,
			hasDate: true,
			hasAddress: true,
			hasReceiptTitle: true,
		},
	})),
	detectDataPresence: jest.fn(() => ({ hasData: true })),
}));

// Mock tax type keyword detection
jest.mock('../src/utils/ocrKeywords', () => ({
	__esModule: true,
	autoDetectTaxType: jest.fn((name: string) => (name?.includes('บริษัท') ? 'Juristic' : 'Individual')),
}));

// Mock PDF generator
jest.mock('../src/utils/pdfWHTTemplateThai', () => ({
	__esModule: true,
	fillWHTTemplateWithThaiFont: jest.fn(async () => Buffer.from('PDF')),
}));

// Prisma mock
const prismaMock: any = {
	businessAcc: { findFirst: jest.fn() },
	expense: {
		create: jest.fn(),
		findMany: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn(),
		aggregate: jest.fn(),
	},
	member: { findUnique: jest.fn() },
};

jest.mock('../src/generated/client1', () => {
	const taxType = { Individual: 'Individual', Juristic: 'Juristic' };
	const Bank = {};
	const ExpenseGroup = {};
	const ExpenseStatus = {};
	return {
		__esModule: true,
		PrismaClient: jest.fn().mockImplementation(() => prismaMock),
		taxType,
		Bank,
		ExpenseGroup,
		ExpenseStatus,
	};
});

import {
	createExpense,
	createExpenseWithOCR,
	getExpenses,
	getExpenseById,
	updateExpenseById,
	searchExpenseByDate,
	autoDeleteExpense,
	deleteExpenseById,
	getThisYearExpensesAPI,
	generateWHTDocument,
	updateExpenseWithOCRData,
} from '../src/controllers/expenseController';

const app = express();
app.use(express.json());
app.post('/expense', (req, res) => createExpense(req, res));
app.post('/expense/ocr', (req, res) => createExpenseWithOCR(req, res));
// Order matters: define fixed route before param route to avoid shadowing
app.get('/expenses/this-year', (req, res) => getThisYearExpensesAPI(req, res));
app.get('/expenses/:memberId', (req, res) => getExpenses(req, res));
app.get('/expense/:id', (req, res) => getExpenseById(req, res));
app.put('/expense/:id', (req, res) => updateExpenseById(req, res));
app.delete('/expense/:id', (req, res) => deleteExpenseById(req, res));
app.get('/expense/search/date/:date', (req, res) => searchExpenseByDate(req, res));
app.post('/expenses/wht/generate', (req, res) => generateWHTDocument(req, res));
app.post('/expenses/ocr/update', (req, res) => updateExpenseWithOCRData(req, res));

const baseExpensePayload = () => ({
	date: '2025-11-20T10:00:00Z',
	amount: 100,
	group: 'Others',
	memberId: 'MID-1',
});

describe('expenseController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createExpense', () => {
		test('creates an expense successfully', async () => {
			prismaMock.businessAcc.findFirst.mockResolvedValue({ id: 10 });
			prismaMock.expense.create.mockResolvedValue({ id: 1, amount: 100 });
			const res = await request(app).post('/expense').send(baseExpensePayload());
			expect(res.status).toBe(200);
			expect(res.body.id).toBe(1);
			expect(prismaMock.expense.create).toHaveBeenCalled();
		});

		test('rejects invalid payload', async () => {
			const res = await request(app).post('/expense').send({ amount: 100 });
			expect(res.status).toBe(400);
			// date is auto-filled when missing; first required failure is memberId
			expect(res.body.message).toMatch(/memberId/i);
		});

		test('returns 400 when business account not found', async () => {
			prismaMock.businessAcc.findFirst.mockResolvedValue(null);
			const res = await request(app).post('/expense').send(baseExpensePayload());
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/Business account not found/i);
		});
	});

	describe('getExpenses', () => {
		test('returns list of expenses for member', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 2 });
			prismaMock.expense.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
			const res = await request(app).get('/expenses/MID-1');
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
		});
	});

	describe('getExpenseById', () => {
		test('returns expense fields', async () => {
			prismaMock.expense.findUnique.mockResolvedValue({ id: 7, amount: 50, date: '2025-01-01' });
			const res = await request(app).get('/expense/7');
			expect(res.status).toBe(200);
			expect(res.body.id).toBe(7);
		});
	});

	describe('updateExpenseById', () => {
		test('returns 404 when expense not found', async () => {
			prismaMock.expense.findUnique.mockResolvedValue(null);
			const res = await request(app).put('/expense/10').send({ memberId: 'MID-1' });
			expect(res.status).toBe(404);
			expect(res.body.message).toMatch(/Expense not found/i);
		});

		test('updates expense and deletes old image when new file uploaded', async () => {
			prismaMock.expense.findUnique.mockResolvedValue({ id: 8, image: 'https://s3.example.com/bucket/old-key.png', group: 'Others' });
			prismaMock.expense.update.mockResolvedValue({ id: 8, amount: 120, image: 'https://s3.example.com/bucket/new-key.png' });
			const res = await request(app)
				.put('/expense/8')
				.set('x-mock-file', '1')
				.send({ memberId: 'MID-1', amount: 120, group: 'Others' });
			expect(res.status).toBe(200);
			expect(res.body.id).toBe(8);
			expect(prismaMock.expense.update).toHaveBeenCalled();
		});
	});

	describe('deleteExpenseById', () => {
		test('returns 404 when not found', async () => {
			prismaMock.expense.findUnique.mockResolvedValue(null);
			const res = await request(app).delete('/expense/50').send({ memberId: 'MID-1' });
			expect(res.status).toBe(404);
		});

		test('deletes expense and image', async () => {
			prismaMock.expense.findUnique.mockResolvedValue({ image: 'https://s3.example.com/bucket/key.png' });
			prismaMock.expense.delete.mockResolvedValue({ id: 3 });
			const res = await request(app).delete('/expense/3').send({ memberId: 'MID-1' });
			expect(res.status).toBe(200);
			expect(res.body.message).toMatch(/deleted/i);
		});
	});

	describe('searchExpenseByDate', () => {
		test('returns matched expenses', async () => {
			prismaMock.expense.findMany.mockResolvedValue([{ id: 1 }]);
			const res = await request(app).get('/expense/search/date/2025-01-01');
			expect(res.status).toBe(200);
			expect(res.body[0].id).toBe(1);
		});
	});

	describe('getThisYearExpensesAPI', () => {
		test('404 when no expenses', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.expense.aggregate.mockResolvedValue({ _sum: { amount: null } });
			const res = await request(app).get('/expenses/this-year').query({ memberId: 'MID-1' });
			expect(res.status).toBe(404);
		});

		test('returns annual expense', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
			prismaMock.expense.aggregate.mockResolvedValue({ _sum: { amount: 200.5 } });
			const res = await request(app).get('/expenses/this-year').query({ memberId: 'MID-1' });
			expect(res.status).toBe(200);
			expect(res.body.anualExpenseM).toBe('200.50');
		});
	});

	describe('createExpenseWithOCR', () => {
		test('processes OCR, uploads image, and creates expense with success alert', async () => {
			prismaMock.businessAcc.findFirst.mockResolvedValue({ id: 10, businessName: 'บริษัท ทดสอบ', taxId: '1234567890123', businessAddress: 'ที่อยู่' });
			prismaMock.expense.create.mockResolvedValue({ id: 11, amount: 100 });
			const res = await request(app)
				.post('/expense/ocr')
				.set('x-mock-file', '1')
				.send({ memberId: 'MID-1', group: 'Others', date: 'วันที่ 22 กันยายน 2568', amount: 100, sName: 'บริษัท แซมเปิล' });
			expect(res.status).toBe(200);
			// Response may include ocrAlert; ensure id present
			expect(res.body.id).toBe(11);
		});

		test('updates existing expense when ocrDataApplied=true', async () => {
			prismaMock.expense.update.mockResolvedValue({ id: 15, amount: 150, vat: false, vatAmount: 0 });
			const res = await request(app)
				.post('/expense/ocr')
				.set('x-mock-file', '1')
				.send({ memberId: 'MID-1', ocrDataApplied: 'true', expenseId: '15', group: 'Others' });
			expect(res.status).toBe(200);
			expect(res.body.id).toBe(15);
		});
	});

	describe('generateWHTDocument', () => {
		test('returns a PDF', async () => {
			prismaMock.businessAcc.findFirst.mockResolvedValue({ businessName: 'บ.ทดสอบ', taxId: '1234567890123', businessAddress: 'กทม' });
			const res = await request(app)
				.post('/expenses/wht/generate')
				.send({ sName: 'ผู้รับเงิน', sTaxId: '1234567890123', amount: 100, date: '2025-01-01', taxInvoiceNo: 'T-1', sAddress: 'บางกอก', memberId: 'MID-1', WHTAmount: 3, group: 'Others', taxType: 'Individual' });
			expect(res.status).toBe(200);
			expect(res.headers['content-type']).toMatch(/application\/pdf/);
		});
	});

	describe('updateExpenseWithOCRData', () => {
		test('updates fields and VAT based on selected data', async () => {
			prismaMock.expense.update.mockResolvedValue({ id: 21, vat: true, vatAmount: 7, taxType: 'Juristic' });
			const res = await request(app)
				.post('/expenses/ocr/update')
				.send({ expenseId: 21, selectedData: { sName: 'บริษัท เอ', vatAmount: '7', amount: '100', taxInvoiceId: 'INV-1', date: '2025-01-01', address: 'กทม' } });
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.vat).toBe(true);
		});

		test('requires expenseId and selectedData', async () => {
			const res = await request(app).post('/expenses/ocr/update').send({});
			expect(res.status).toBe(400);
		});
	});

	describe('autoDeleteExpense (unit)', () => {
		test('deletes unsaved expenses', async () => {
			prismaMock.expense.deleteMany.mockResolvedValue({ count: 2 });
			await autoDeleteExpense();
			expect(prismaMock.expense.deleteMany).toHaveBeenCalled();
		});
	});
});

