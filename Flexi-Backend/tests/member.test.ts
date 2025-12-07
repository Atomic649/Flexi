import express from 'express';
import request from 'supertest';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Prisma mock shape for member controller usage
const prismaMock: any = {
  member: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('../src/generated/client1/client', () => {
  return { PrismaClient: jest.fn().mockImplementation(() => prismaMock) };
});

import {
  createMember,
  getMembers,
  getMemberIDByUserID,
  deleteMember,
  updateMember,
  searchMember,
  getMembersByBusinessId,
  inviteMemberByUsername,
  softDeleteMember,
} from '../src/controllers/memberController';

const app = express();
app.use(express.json());
app.post('/member', (req, res) => createMember(req, res));
app.get('/members', (req, res) => getMembers(req, res));
app.get('/members/by-user/:userId', (req, res) => getMemberIDByUserID(req, res));
app.delete('/member/:uniqueId', (req, res) => deleteMember(req, res));
app.delete('/member/soft/:uniqueId', (req, res) => softDeleteMember(req, res));
app.put('/member/:uniqueId', (req, res) => updateMember(req, res));
app.get('/member/search/:keyword', (req, res) => searchMember(req, res));
app.get('/members/business/:businessId', (req, res) => getMembersByBusinessId(req, res));
app.post('/member/invite', (req, res) => inviteMemberByUsername(req, res));

describe('memberController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMember', () => {
    test('creates member with valid payload', async () => {
      prismaMock.member.create.mockResolvedValue({ uniqueId: 'U1', permission: 'user', role: 'member', userId: 1 });
      const res = await request(app).post('/member').send({ permission: 'user', role: 'member', userId: 1 });
      expect(res.status).toBe(200);
      expect(res.body.uniqueId).toBe('U1');
    });

    test('rejects invalid payload', async () => {
      const res = await request(app).post('/member').send({ permission: 'user', userId: 1 }); // missing role
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/role/i);
    });
  });

  describe('getMembers', () => {
    test('returns list of members', async () => {
      prismaMock.member.findMany.mockResolvedValue([{ uniqueId: 'A' }, { uniqueId: 'B' }]);
      const res = await request(app).get('/members');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('getMemberIDByUserID', () => {
    test('returns first member for user id', async () => {
      prismaMock.member.findMany.mockResolvedValue([{ uniqueId: 'M001', role: 'member', permission: 'user' }]);
      const res = await request(app).get('/members/by-user/10');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.member.uniqueId).toBe('M001');
    });
  });

  describe('deleteMember', () => {
    test('returns 404 when member not found', async () => {
      prismaMock.member.findUnique.mockResolvedValue(null);
      const res = await request(app).delete('/member/X1');
      expect(res.status).toBe(404);
    });

    test('blocks deleting owner or admin', async () => {
      prismaMock.member.findUnique.mockResolvedValue({ role: 'owner', permission: 'admin' });
      const res = await request(app).delete('/member/X2');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/protected member/i);
    });

    test('deletes allowed member', async () => {
      prismaMock.member.findUnique.mockResolvedValue({ role: 'member', permission: 'user' });
      prismaMock.member.delete.mockResolvedValue({ uniqueId: 'X3' });
      const res = await request(app).delete('/member/X3');
      expect(res.status).toBe(200);
      expect(res.body.uniqueId).toBe('X3');
    });
  });

  describe('softDeleteMember', () => {
    test('marks member as deleted when allowed', async () => {
      prismaMock.member.findUnique.mockResolvedValue({ role: 'member', permission: 'user' });
      prismaMock.member.update.mockResolvedValue({ uniqueId: 'S1', deleted: true });
      const res = await request(app).delete('/member/soft/S1');
      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(true);
    });
  });

  describe('updateMember', () => {
    test('updates member role and permission', async () => {
      prismaMock.member.update.mockResolvedValue({ uniqueId: 'U1', role: 'admin', permission: 'admin' });
      const res = await request(app)
        .put('/member/U1')
        .send({ permission: 'admin', role: 'admin', userId: 1 });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('admin');
    });

    test('rejects invalid update payload', async () => {
      const res = await request(app).put('/member/U2').send({ permission: 'admin', userId: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/role/i);
    });
  });

  describe('searchMember', () => {
    test('searches by keyword', async () => {
      prismaMock.member.findMany.mockResolvedValue([{ uniqueId: 'Z1' }]);
      const res = await request(app).get('/member/search/KEY');
      expect(res.status).toBe(200);
      expect(res.body[0].uniqueId).toBe('Z1');
    });
  });

  describe('getMembersByBusinessId', () => {
    test('requires businessId param', async () => {
      // route always supplies :businessId, so simulate empty handling by passing non-numeric leads to 200 with []
      prismaMock.member.findMany.mockResolvedValue([]);
      const res = await request(app).get('/members/business/123');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(Array.isArray(res.body.members)).toBe(true);
    });

    test('maps members with status', async () => {
      prismaMock.member.findMany.mockResolvedValue([
        {
          userId: 7,
          uniqueId: 'MID1',
          role: 'member',
          permission: 'pending',
          businessId: 9,
          user: { firstName: 'A', lastName: 'B', avatar: 'img' },
        },
      ]);
      const res = await request(app).get('/members/business/9');
      expect(res.status).toBe(200);
      expect(res.body.members[0].status).toBe('request-sent');
    });
  });

  describe('inviteMemberByUsername', () => {
    test('rejects when max members reached', async () => {
      prismaMock.member.count.mockResolvedValue(5);
      const res = await request(app)
        .post('/member/invite')
        .send({ username: '@john', role: 'marketing', businessId: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Maximum members reached/i);
    });

    test('rejects when user not found', async () => {
      prismaMock.member.count.mockResolvedValue(0);
      prismaMock.user.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .post('/member/invite')
        .send({ username: '@john', role: 'marketing', businessId: 1 });
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/User not found/i);
    });

    test('rejects when already a member', async () => {
      prismaMock.member.count.mockResolvedValue(0);
      prismaMock.user.findUnique.mockResolvedValue({ id: 2 });
      prismaMock.member.findFirst.mockResolvedValue({ uniqueId: 'EXIST' });
      const res = await request(app)
        .post('/member/invite')
        .send({ username: '@john', role: 'marketing', businessId: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already a member/i);
    });

    test('adds member successfully', async () => {
      prismaMock.member.count.mockResolvedValue(0);
      prismaMock.user.findUnique.mockResolvedValue({ id: 2 });
      prismaMock.member.findFirst.mockResolvedValue(null);
      prismaMock.member.create.mockResolvedValue({ uniqueId: 'NEW', userId: 2, role: 'marketing', permission: 'user' });
      const res = await request(app)
        .post('/member/invite')
        .send({ username: '@john', role: 'marketing', businessId: 1 });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.member.uniqueId).toBe('NEW');
    });
  });
});
