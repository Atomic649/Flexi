// Secure password tests for authController register endpoint
import express from 'express';
import request from 'supertest';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Shared mock instance we'll inspect in tests
const prismaMock: {
  user: { findUnique: jest.Mock; create: jest.Mock };
  businessAcc: { findFirst: jest.Mock };
} = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  businessAcc: { findFirst: jest.fn() },
};

// Mock Prisma client used inside authController (controller imports "../src/generated/client1")
jest.mock('../src/generated/client1', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  };
});

// Import controller AFTER mocks
import { register } from '../src/controllers/authController';

const app = express();
app.use(express.json());
app.post('/register', (req, res) => register(req, res));

// Helper to build base valid payload
const basePayload = (overrides: Partial<Record<string, any>> = {}) => ({
  email: overrides.email || 'user' + Math.random().toString(16).slice(2) + '@example.com',
  username: overrides.username || 'user' + Math.random().toString(16).slice(2),
  password: overrides.password || 'Secure123!',
  firstName: overrides.firstName || 'First',
  lastName: overrides.lastName || 'Last',
  phone: overrides.phone || '0123456789'
});

describe('Register password policy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  prismaMock.user.findUnique.mockImplementation(() => Promise.resolve(null)); // No existing user
    prismaMock.user.create.mockImplementation(({ data }: any) => ({
      id: 1,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      password: data.password // hashed
    }));
  });

  test('accepts valid strong password', async () => {
    const payload = basePayload({ password: 'StrongPass9@' });
    const res = await request(app).post('/register').send(payload);
    expect(res.status).toBe(200); // controller returns 200 with status ok
    expect(res.body.status).toBe('ok');
    // Ensure password was hashed (not equal to plain) if create was called
  const createCall: any = prismaMock.user.create.mock.calls[0][0];
    expect(createCall.data.password).not.toBe(payload.password);
  });

  test('accepts password with dot (Ato.mic649)', async () => {
    const payload = basePayload({ password: 'Ato.mic649' });
    const res = await request(app).post('/register').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('rejects too short password', async () => {
    const res = await request(app).post('/register').send(basePayload({ password: 'Ab1@' }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 8 characters/i);
  });

  test('rejects missing uppercase', async () => {
    const res = await request(app).post('/register').send(basePayload({ password: 'secure123@' }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/uppercase/i);
  });

  test('rejects missing lowercase', async () => {
    const res = await request(app).post('/register').send(basePayload({ password: 'SECURE123@' }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/lowercase/i);
  });

  test('rejects missing digit', async () => {
    const res = await request(app).post('/register').send(basePayload({ password: 'Secure@@@' }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/number/i);
  });

  test('rejects missing special character', async () => {
    const res = await request(app).post('/register').send(basePayload({ password: 'Secure1234' }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/special character/i);
  });

  test('rejects existing email user', async () => {
  prismaMock.user.findUnique.mockImplementation(() => Promise.resolve({ id: 99, email: 'taken@example.com' }));
    const res = await request(app).post('/register').send(basePayload({ email: 'taken@example.com' }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/User already exists/i);
  });
});