const db = require('./db.js'), { v4: uuid } = require('uuid'),
{checkEmail, checkPassword, assignToken, invalidate } = require('./auth.js');

const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!(firstName && lastName && email && password)) {
            return res.status(400).send({
                status: 'error',
                message: 'signup information not provided'
            });
        }
        if(!checkPassword(password)){
            return res.status(400).send({
                status: 'error',
                message: 'weak password'
            });
        }
        if (!checkEmail(email)) {
            return res.status(400).send({
                status: 'error',
                message: 'invalid email address'
            });
        }
        if ((await db.verifyCredentials(email, password)) === true) {
            return res.status(400).send({
                status: 'error',
                message: 'credentials already in use'
            });
        }
        const userId = uuid();
        const { error, user } = await db.createUser(
            userId, firstName + ' ' + lastName,
            email, password
            );
        if (error) {
            res.status(500).send({
                status: 'error', message: error
            });
        }
        else{
            assignToken(user);
            delete user.userId;
            res.status(200).send({
                status: 'ok',
                message: user
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                status: 'error',
                message: 'login information not provided'
            });
        }
        const { error, user } = await db.userExists(email, password);
        if (error) {
            return res.status(500).send({
                status: 'error',
                message: error
            });
        }
        assignToken(user);
        delete user.userId;
        res.status(200).send({
            status: 'ok',
            message: user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
};

const logOut = async (req, res)=>{
    invalidate(req.user.userId);
    res.status(200).send({
        status:'ok',
    });
}

const getUser = async (req, res) => {
    try {
        const { error, profile } = await db.getUserProfile(req.user.userId);
        if(error){
            res.status(400).send({
                status: 'error',
                message: 'user not found'
            });
        }
        else{
            res.status(200).send({
                status: 'ok',
                message: profile
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
};

const createBlog = async (req, res) => {
    try {
        if (!req.body.title || !req.body.content) {
            return res.status(400).send({
                status: 'error',
                message: 'blog content missing'
            });
        }
        let { blog, error } = await db.createBlog(uuid(), req.user.userId, req.body.title, req.body.content);
        if (error) {
            res.status(500).send({
                status: 'error',
                message: error
            });
        }
        else {
            res.status(200).send({
                status: 'ok',
                message: blog
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
};

const deleteBlog = async (req, res) => {
    try {
        let done = await db.deleteBlog(req.user.userId, req.params['blogId']);
        if (!done) {
            res.status(500).send({ status: 'error' });
        }
        else {
            res.status(200).send({ status: 'ok' });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
};

const updateBlog = async (req, res) => {
    try{
        const data = {
            title: req.body.title,
            description: req.body.content
        };
        if (!data.title && !data.description) {
            return res.status(400).send({
                status: 'error',
                message: 'no update provided'
            });
        }
        let {error, blog} = await db.updateBlog(req.user.userId, req.params['blogId'], data);
        if(error){
            res.status(404).send({
                status: 'error',
                message: error
            });
        }
        else{
            res.status(200).send({
                status: 'ok',
                message: blog
            });
        }
    }
    catch(error){
        console.log(error);
        res.status(500).send({status: 'error'});
    }
}

const getBlog = async (req, res) => {
    try {
        let { error, blog } = await db.getBlog(req.params['blogId']);
        if (error) {
            res.status(500).send({
                status: 'error',
                message: error
            });
        }
        else {
            res.status(200).send({
                status: 'ok',
                message: blog
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
};

const getUserBlogs = async (req, res) => {
    try {
        let { error, blogs } = await db.getBlogsOfUser(req.user.userId);
        if (error) {
            res.status(500).send({
                status: 'error',
                message: error
            });
        }
        else {
            res.status(200).send({
                status: 'ok',
                message: blogs
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
};

module.exports = { signIn, signUp, getUser,
                   createBlog, deleteBlog, getBlog,
                   getUserBlogs, updateBlog, logOut };