const app = require('./index.js'), st = require('supertest'), req = st(app), {truncate} = require('./db.js');

//jest.setTimeout(100000);

describe('running tests', () => {

    test('testing signup', async () => {
        const res = await req.post('/signup').send({
            email: 'abc@xyz.org', firstName: 'fname',
            lastName: 'lname', password: 'password'
        });
        console.log(1, res.body.message);
        expect(res.statusCode).toBe(200);
    });

    test('repeating signup test', async () => {
        const res = await req.post('/signup').send({
            email: 'abc@xyz.org', firstName: 'fname',
            lastName: 'lname', password: 'password2'
        });
        console.log(2, res.body.message);
        expect(res.statusCode).not.toBe(200);
    });

    let token='';

    test('testing signing in', async () => {
        const res = await req.post('/login').send({
            email: 'abc@xyz.org', password: 'password'
        });
        console.log(3, res.body.message);
        expect(res.statusCode).toBe(200);
        token = res.body.message.token;
    });

    test('repeating sign-in test', async () => {
        const res = await req.post('/login').send({
            email: 'abcd@xyz.org', password: 'password'
        });
        console.log(4, res.body.message);
        expect(res.statusCode).not.toBe(200);
    });

    let blogId='';

    test('inserting 2 blogs', async ()=>{
        await req.post('/api/blog').send({
            title:'title', content:'content', token
        });
        const res = await req.post('/api/blog').send({
            title:'title', content:'content', token
        });
        console.log(5, res.body.message);
        blogId = res.body.message.blogId;
        expect(res.statusCode).toBe(200);
    });

    test('repeating blog creation', async ()=>{
        const res = await req.post('/api/blog').send({
            title:'title', content:'content', token:'avb'
        });
        console.log(6, res.body.message);
        expect(res.statusCode).not.toBe(200);
    });

    test('testing blog fetching', async ()=>{
        const res = await req.get(`/api/blog/`).send({ token });
        console.log(7, res.body.message);
        expect(res.statusCode).not.toBe(200);
    });

    test('fetching all blogs', async ()=>{
        const res = await req.get(`/api/blogs`).send({ token });
        console.log(8, res.body.message);
        expect(res.statusCode).toBe(200);
        expect(res.body.message.length).toBe(2);
    });

    test('deleting the last blog', async ()=>{
        const res = await req.delete(`/api/blog/${blogId}`).send({ token });
        blogId = '';
        console.log(9, res.body.message);
        expect(res.statusCode).toBe(200);
    });

    test('repeating blog deletion', async ()=>{
        const res = await req.delete(`/api/blog/sudhf`).send({ token });
        console.log(10, res.body.message);
        expect(res.statusCode).not.toBe(200);
    });

    test('repeating blog fetching', async ()=>{
        const res = await req.get(`/api/blog/${blogId}`).send({ token });
        console.log(11, res.body.message);
        expect(res.statusCode).not.toBe(200);
    });

    test('repeating all blogs fetching', async ()=>{
        const res = await req.get(`/api/blogs`).send({ token });
        console.log(12, res.body.message);
        expect(res.statusCode).toBe(200);
        expect(res.body.message.length).toBe(1);
        blogId=res.body.message[0].blogId;
    });

    test('testing blog updation', async ()=>{
        const res = await req.put(`/api/blog/${blogId}`).send({
            token,
            title:'alphaTitle',
            content:'alphaDesc'
        });
        console.log(13, res.body.message);
        expect(res.statusCode).toBe(200);
    });

    test('repeating blog updation', async ()=>{
        const res = await req.put(`/api/blog/${blogId}`).send({ token });
        console.log(14, res.body.message);
        expect(res.statusCode).not.toBe(200);
    });
});