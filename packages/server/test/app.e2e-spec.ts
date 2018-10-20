import { HttpServer, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthModule } from '../src/auth/auth.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (Healthcheck)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Jubilapp application running');
  });
  describe('Authentication', () => {
    const email = 'username@gmail.com';
    const password = '12345';
    const name = 'username';
    let token;
    it('Register a non existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name,
          email,
          password,
        })
        .expect(201);
    });
    it('Register an existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name,
          email,
          password,
        })
        .expect(400)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: `A user with email ${email} already exists`,
        });
    });

    it('Login without credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(401)
    });
    it('Login with empty credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: '',
        })
        .expect(401)
    });
    it('Login with non existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'missingemail@gmail.com',
          password,
        })
        .expect(401)
    });
    it('Login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'wrongpassword',
        })
        .expect(401)
    });
    it('Login with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        })
        .expect(201)
        .ok(res => {
          token = res.text;
          return token.length > 0;
        });
    });
    it('Access a private endpoint without token', () => {
      return request(app.getHttpServer())
        .get('/private')
        .expect(401);
    });
    it('Access a private endpoint', () => {
      return request(app.getHttpServer())
        .get('/private')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(`Private data for ${email}`)
    });

  });
});
