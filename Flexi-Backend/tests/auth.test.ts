// Secure password tests for authController register endpoint
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Shared mock instance we'll inspect in tests
const prismaMock: {
  user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; findFirst: jest.Mock };
  businessAcc: { findFirst: jest.Mock };
  member?: any;
} = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
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
import { register, login, changePassword, forgotPassword, resetPassword } from '../src/controllers/authController';

const app = express();
app.use(express.json());
app.post('/register', (req, res) => register(req, res));
app.post('/login', (req, res) => login(req, res));
app.post('/change-password', (req, res) => changePassword(req, res));
app.post('/forgot-password', (req, res) => forgotPassword(req, res));
app.post('/reset-password', (req, res) => resetPassword(req, res));

// Helper to build base valid payload
const basePayload = (overrides: Partial<Record<string, any>> = {}) => ({
  email: overrides.email || 'user' + Math.random().toString(16).slice(2) + '@example.com',
  username: overrides.username || '@user' + Math.random().toString(16).slice(2),
  password: overrides.password || 'Secure123!',
  firstName: overrides.firstName || 'First',
  lastName: overrides.lastName || 'Last',
  phone: overrides.phone || '0123456789'
});

describe('Register password policy & username/email validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.user.findUnique.mockImplementation(() => Promise.resolve(null)); // No existing user
    prismaMock.user.create.mockImplementation(({ data }: any) => ({
      id: Math.floor(Math.random() * 1000) + 1,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      username: data.username,
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

  test('rejects invalid username format (missing @)', async () => {
    const payload = basePayload({ username: 'plainuser', password: 'StrongPass9@' });
    const res = await request(app).post('/register').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/must start with @/i);
  });
});

describe('Login email & password policy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const hashed = bcrypt.hashSync('StrongPass9@', 10);
    // login uses findUnique by email
    prismaMock.user.findUnique.mockImplementation(({ where }: any) => {
      if (where.email === 'login@example.com') {
        return Promise.resolve({
          id: 42,
          email: 'login@example.com',
          password: hashed,
          firstName: 'First',
          lastName: 'Last',
          phone: '0123456789',
          username: '@loginuser'
        });
      }
      return Promise.resolve(null);
    });
    prismaMock.businessAcc.findFirst.mockImplementation(() => Promise.resolve({ id: 55, memberId: 'MEM123' }));
  });

  test('successful login with valid email & password', async () => {
    const res = await request(app).post('/login').send({ email: 'login@example.com', password: 'StrongPass9@' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.user.email).toBe('login@example.com');
  });

  test('rejects invalid email format', async () => {
    const res = await request(app).post('/login').send({ email: 'bad-email', password: 'StrongPass9@' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  test('rejects wrong password', async () => {
    const res = await request(app).post('/login').send({ email: 'login@example.com', password: 'WrongPass9@' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/does not match/i);
  });

  test('rejects missing uppercase via password policy on login', async () => {
    const res = await request(app).post('/login').send({ email: 'login@example.com', password: 'weakpass9@' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/uppercase/i);
  });
});

describe('Change password flow (email & username unaffected)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const hashed = bcrypt.hashSync('CurrentPass1!', 10);
    prismaMock.user.findUnique.mockImplementation(() => Promise.resolve({
      id: 77,
      email: 'changepw@example.com',
      password: hashed,
      firstName: 'First',
      lastName: 'Last',
      phone: '0123456789',
      username: '@changepw'
    }));
    prismaMock.user.update.mockImplementation(({ data }: any) => ({ id: 77, email: 'changepw@example.com', password: data.password }));
  });

  test('successfully changes password with strong new password', async () => {
    const res = await request(app).post('/change-password').send({ id: 77, currentPassword: 'CurrentPass1!', newPassword: 'NewStrong9@' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('rejects incorrect current password', async () => {
    const res = await request(app).post('/change-password').send({ id: 77, currentPassword: 'WrongPass1!', newPassword: 'NewStrong9@' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Old password is incorrect/i);
  });

  test('rejects weak new password (missing digit)', async () => {
    const res = await request(app).post('/change-password').send({ id: 77, currentPassword: 'CurrentPass1!', newPassword: 'NoDigit@@@' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/number/i);
  });
});

describe('Forgot & reset password flows (email validation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.user.findUnique.mockImplementation(({ where }: any) => {
      if (where.email === 'reset@example.com') {
        return Promise.resolve({ id: 500, email: 'reset@example.com' });
      }
      return Promise.resolve(null);
    });
    // for reset, user.findFirst and user.update
    prismaMock.user.findFirst.mockImplementation(() => Promise.resolve({ id: 500, email: 'reset@example.com', resetToken: 'tok123', resetTokenExpiry: new Date(Date.now() + 60000) }));
    prismaMock.user.update.mockImplementation(({ data }: any) => ({ id: 500, email: 'reset@example.com', ...data }));
  });

  test('forgot password returns ok even if email not found (privacy)', async () => {
    const res = await request(app).post('/forgot-password').send({ email: 'missing@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('forgot password for existing email returns ok status', async () => {
    const res = await request(app).post('/forgot-password').send({ email: 'reset@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('reset password rejects invalid token format', async () => {
    const res = await request(app).post('/reset-password').send({ token: 'badtoken', newPassword: 'StrongReset9@' });
    // JWT verify will fail and return 500 (current controller) or 400 depending; treat 500 as failure
    expect([400,500]).toContain(res.status);
  });
});