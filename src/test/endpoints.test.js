import {
    afterAll,
    beforeAll,
    describe,
    it
} from '@jest/globals';
import supertest from 'supertest';
import { app } from '../app.js';
import {
    createSchema,
    dropSchema, end, insertData
} from '../lib/db';



describe('menu', () => {
    beforeAll(async () => {
        await dropSchema();
        await createSchema();
        await insertData();
    });

    afterAll(async () => {
        await end();
    });

    it('Fetches all menu items', async () => {
        await supertest(app)
            .get('/menu')
            .expect(200);
    });

    it('logs in', async () => {
        const sendObject = {
            username: 'admin',
            password: '123',
        };
        await supertest(app)
            .post('/users/login')
            .send(sendObject)
            .expect(200);
    });

    it('logs in and fetches users', async () => {
        const sendObject = {
            username: 'admin',
            password: '123',
        };

        const res = await supertest(app)
            .post('/users/login')
            .send(sendObject)
            .expect(200);

        const { token } = res.body;

        await supertest(app)
            .get('/users')
            .set('Authorization', 'Bearer ' + token)
            .expect(200);
    });
});