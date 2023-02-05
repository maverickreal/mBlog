const express = require('express'), { auth } = require('./auth.js'),
      router = require('./routes.js'), app = express();

app.use(express.json()), require('./db.js').init(process.env.ENV==='test'); // connect to the database

app.post('/signup', router.signUp);

app.post('/login', router.signIn);

app.post('/logout', auth, router.logOut);

app.get('/api/user', auth, router.getUser);

app.post('/api/blog', auth, router.createBlog);

app.delete('/api/blog/:blogId', auth, router.deleteBlog);

app.put('/api/blog/:blogId', auth, router.updateBlog);

app.get('/api/blog/:blogId', auth, router.getBlog);

app.get('/api/blogs', auth, router.getUserBlogs);

if (process.env.ENV === 'test') {
    module.exports = app;
}
else {
    app.listen(process.env.PORT || 8080);
}