import express from 'express';
import request from 'supertest';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock multer config and multer behavior
jest.mock('../src/middleware/multer_config', () => ({
	__esModule: true,
	default: {
		multerConfigImage: {
			config: {},
			keyUpload: 'image',
		},
	},
}));

jest.mock('multer', () => {
	const mockMulter = () => ({
		single: () => (req: any, _res: any, cb: (err?: any) => void) => {
			if (req.headers && req.headers['x-mock-file'] === '1') {
				req.file = {
					buffer: Buffer.from('file-bytes'),
					mimetype: 'image/png',
					location: 'https://s3.example.com/bucket/new-image.png',
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
	deleteFromS3: jest.fn(async () => undefined),
	extractS3Key: jest.fn((url: string) => 'old-key.png'),
}));

// Prisma mock
const prismaMock: any = {
	member: { findUnique: jest.fn() },
	product: {
		create: jest.fn(),
		findMany: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
	},
};

jest.mock('../src/generated/client1', () => {
	const ProductType = { Product: 'Product', Service: 'Service' };
	const Unit = { Piece: 'Piece', Hour: 'Hour', Kg: 'Kg' };
	return {
		__esModule: true,
		PrismaClient: jest.fn().mockImplementation(() => prismaMock),
		ProductType,
		Unit,
	};
});

import {
	createProduct,
	getProductById,
	updateProduct,
	deleteProduct,
	getProductByMemberId,
	getProductChoice,
	getProductChoiceWithPrice,
} from '../src/controllers/productController';

const app = express();
app.use(express.json());
app.post('/product', (req, res) => createProduct(req, res));
app.get('/products/:memberId', (req, res) => getProductByMemberId(req, res));
app.get('/product/:id', (req, res) => getProductById(req, res));
app.put('/product/:id', (req, res) => updateProduct(req, res));
app.delete('/product/:id', (req, res) => deleteProduct(req, res));
app.get('/product/choices/:memberId', (req, res) => getProductChoice(req, res));
app.get('/product/choices-with-price/:memberId', (req, res) => getProductChoiceWithPrice(req, res));

const basePayload = () => ({
	name: 'Prod A',
	description: 'Desc',
	barcode: '',
	image: '',
	stock: 10,
	price: 99,
	categoryId: 1,
	statusId: 1,
	memberId: 'MID-1',
	unit: 'Piece',
	productType: 'Product',
});

describe('productController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createProduct', () => {
		test('creates product (201) with optional image', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 2 });
			prismaMock.product.create.mockResolvedValue({ id: 1, name: 'Prod A' });
			const res = await request(app).post('/product').set('x-mock-file', '1').send(basePayload());
			expect(res.status).toBe(201);
			expect(res.body.id).toBe(1);
			expect(prismaMock.product.create).toHaveBeenCalled();
		});

		test('rejects invalid payload (missing name)', async () => {
			const p = basePayload();
			// @ts-ignore
			delete p.name;
			const res = await request(app).post('/product').send(p);
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/name/i);
		});
	});

	describe('getProductByMemberId', () => {
		test('returns product list for member', async () => {
			prismaMock.member.findUnique.mockResolvedValue({ businessId: 2 });
			prismaMock.product.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
			const res = await request(app).get('/products/MID-1');
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
		});
	});

	describe('getProductById', () => {
		test('returns product by id', async () => {
			prismaMock.product.findUnique.mockResolvedValue({ id: 7, name: 'X' });
			const res = await request(app).get('/product/7');
			expect(res.status).toBe(200);
			expect(res.body.id).toBe(7);
		});
	});

	describe('updateProduct', () => {
		test('returns 404 when not found', async () => {
			prismaMock.product.findUnique.mockResolvedValue(null);
			const res = await request(app).put('/product/5').send({});
			expect(res.status).toBe(404);
			expect(res.body.message).toMatch(/Product not found/i);
		});

		test('updates product and deletes old image on new upload', async () => {
			prismaMock.product.findUnique.mockResolvedValue({ id: 5, image: 'https://s3.example.com/bucket/old.png', name: 'Old', description: 'D', barcode: '', stock: 1, price: 10, unit: 'Piece', productType: 'Product' });
			prismaMock.product.update.mockResolvedValue({ id: 5, name: 'New' });
			const res = await request(app)
				.put('/product/5')
				.set('x-mock-file', '1')
				.send({ name: 'New', price: 100, stock: 3 });
			expect(res.status).toBe(200);
			expect(res.body.id).toBe(5);
			expect(prismaMock.product.update).toHaveBeenCalled();
		});
	});

	describe('deleteProduct', () => {
		test('404 when product not found', async () => {
			prismaMock.product.findUnique.mockResolvedValue(null);
			const res = await request(app).delete('/product/10');
			expect(res.status).toBe(404);
		});

		test('marks product as deleted and removes image', async () => {
			prismaMock.product.findUnique.mockResolvedValue({ image: 'https://s3.example.com/bucket/p.png' });
			prismaMock.product.update.mockResolvedValue({ id: 10, deleted: true });
			const res = await request(app).delete('/product/10');
			expect(res.status).toBe(200);
			expect(res.body.message).toBe('success');
			expect(res.body.product).toBe(true);
		});
	});

	describe('getProductChoice', () => {
		test('returns product names', async () => {
			prismaMock.product.findMany.mockResolvedValue([{ name: 'A' }, { name: 'B' }]);
			const res = await request(app).get('/product/choices/MID-1');
			expect(res.status).toBe(200);
			expect(res.body[0].name).toBe('A');
		});
	});

	describe('getProductChoiceWithPrice', () => {
		test('returns product choices with price and unit', async () => {
			prismaMock.product.findMany.mockResolvedValue([{ name: 'A', price: 10, unit: 'Piece' }]);
			const res = await request(app).get('/product/choices-with-price/MID-1');
			expect(res.status).toBe(200);
			expect(res.body[0].price).toBe(10);
			expect(res.body[0].unit).toBe('Piece');
		});
	});
});

