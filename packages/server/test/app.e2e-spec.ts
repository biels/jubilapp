import {HttpServer, INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';
import {AuthModule} from '../src/auth/auth.module';
import {expand} from "rxjs/operators";
import {User} from "../src/model/user/user.entity";

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let token;
    // @ts-ignore
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
        const name = 'name';
        const surname = 'surname';
        const phone = '+3468384853';

        it('Register a non existing user', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name,
                    surname,
                    email,
                    password,
                    phone
                })
                .expect(201);
        });
        it('Register an existing user', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name,
                    surname,
                    email,
                    password,
                    phone
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
                    token = res.body.token;
                    return token.length > 0;
                });
        });

        it('Getting default km of an existing user', () => {
            return request(app.getHttpServer())
                .get('/auth/distance')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect("15")
        });

        it('Adding km to an existing user', () => {
            console.log(token)

            return request(app.getHttpServer())
                .patch('/auth/distance')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    km: 20,
                })
                .expect(200)
        });

        it('Getting modified km of an existing user', () => {
            return request(app.getHttpServer())
                .get('/auth/distance')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect("20")
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
    describe('Events', () => {
        it('creates an event', () => {

            let eventInput = {
                name: 'sample',
                description: 'description',
                startDate: new Date(2018, 11, 7, 15, 30),
                endDate: new Date(2018, 11, 7, 18, 0),
                location: 'Casal'
            }
            return request(app.getHttpServer())
                .post('/event')
                .set('Authorization', `Bearer ${token}`)
                .send(eventInput)
                .expect(201)
        });
        it('lists my events', () => {
            return request(app.getHttpServer())
                .get('/event/created')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect(res => {
                    let events = res.body.events
                    expect(events).toBeDefined()
                    expect(events).toHaveLength(1)
                })
        });
    });
});
