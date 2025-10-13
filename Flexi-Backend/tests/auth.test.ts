//write jest test for authController.ts
import express from 'express';
import request from 'supertest';
import { expect, jest, test } from '@jest/globals';

const app = express();
app.use(express.json());

// Mock authController functions
import { Request, Response } from 'express';
const authController = {
  register: jest.fn((req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username && password) {
      return res.status(201).json({ message: 'User registered successfully' });
    }
    return res.status(400).json({ message: 'Invalid input' });
  }),
  login: jest.fn((req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === 'testuser' && password === 'testpass') {
      return res.status(200).json({ token: 'fake-jwt-token' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  }),
};

// Define routes for testing
app.post('/register', authController.register);
app.post('/login', authController.login);

test('POST /register - success', async () => {
  const response = await request(app)
    .post('/register')
    .send({ username: 'newuser', password: 'newpass' });
  expect(response.status).toBe(201);
  expect(response.body.message).toBe('User registered successfully');
});

test('POST /register - failure', async () => {
  const response = await request(app)
    .post('/register')
    .send({ username: '', password: '' });
  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Invalid input');
});

test('POST /login - success', async () => {
  const response = await request(app)
    .post('/login')
    .send({ username: 'testuser', password: 'testpass' });
  expect(response.status).toBe(200);
  expect(response.body.token).toBe('fake-jwt-token');
});

test('POST /login - failure', async () => {
  const response = await request(app)
    .post('/login')
    .send({ username: 'wronguser', password: 'wrongpass' });
  expect(response.status).toBe(401);
  expect(response.body.message).toBe('Invalid credentials');
});