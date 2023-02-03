const app = require('./index.js'), st = require('supertest'), req = st(app), { db } = require('./db.js');

jest.setTimeout(100000);

describe('running tests', () => {

    afterAll(async () => {
        await db.collection('users').drop();
        await db.collection('blogs').drop();
    });

    test('testing signup', async () => {
        const res = await req.post('/api/signup').send({
            email: 'abc@xyz.org', firstName: 'fname',
            lastName: 'lname', password: 'password'
        });
        console.log(res.body);
        expect(res.statusCode).toBe(200);
    });

    test('repeating signup test', async () => {
        const res = await req.post('api/signup').send({
            email: 'abc@xyz.org', firstName: 'fname',
            lastName: 'lname', password: 'password2'
        });
        console.log(res.body);
        expect(res.statusCode).not.toBe(200);
    });

    let token='';

    test('testing signing in', async () => {
        const res = await req.post('/signin').send({
            email: 'abc@xyz.org', password: 'password'
        });
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        token = res.body.token;
    });

    test('testing signing in', async () => {
        const res = await req.post('/signin').send({
            email: 'abcd@xyz.org', password: 'password'
        });
        console.log(res.body);
        expect(res.body.message).toBe("user could not be found");
    });
});