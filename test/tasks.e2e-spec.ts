import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Task } from '../src/tasks/schemas/task.schema';
import request = require('supertest');

describe('/tasks', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const taskModel = app.get(getModelToken(Task.name));
    await taskModel.deleteMany({});

    // Signup a user
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'testuser@example.com', password: 'password123',role:'ADMIN' })
      .expect(201);

    // Login to get JWT Token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' })
      .expect(201);

    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'desc', dueDate: '2030-01-01' })
      .expect(201);

    expect(res.body.title).toBe('Test Task');
    expect(res.body.status).toBe('OPEN');
  });

  it('lists tasks with pagination and filters', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task A', status: 'OPEN' });

    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task B', status: 'DONE' });

    const res = await request(app.getHttpServer())
      .get('/tasks?status=DONE&page=1&limit=1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].status).toBe('DONE');
  });

  it('updates task status', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Update' })
      .expect(201);

    const id = created.body._id || created.body.id;
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    expect(res.body.status).toBe('IN_PROGRESS');
  });
});
