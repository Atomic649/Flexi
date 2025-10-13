import express from 'express';
import request from 'supertest';
import { expect, test } from '@jest/globals';

const app = express()
app.get(`/test`, (_, res) => {
  res.send("whatever it takes 🔥 ");
});

test('GET /test', async () => {
  const response = await request(app).get('/test');
  expect(response.status).toBe(200);
  expect(response.text).toBe('whatever it takes 🔥 ');
});
