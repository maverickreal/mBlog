const db = require('./db.js'), { v4: uuid } = require('uuid'), { sign } = require('jsonwebtoken');

const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!(firstName && lastName && email && password)) {
            return res.status(400).send({ status: 'error', message: 'signup information not provided' });
        }
        const emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailPattern.test(email)) {
            return res.status(400).send({ status: 'error', message: 'invalid email address provided' });
        }
        if ((await db.verifyCredentials(email, password)) === true) {
            return res.status(400).send({ status: 'error', message: 'credentials already in use' });
        }
        const { error, user } = await db.createUser(uuid(), firstName + ' ' + lastName, email, password);
        if (error) {
            return res.status(500).send({ status: 'error', message: error });
        }
        const jwtToken = sign(user, process.env.JWTSECRETKEY);
        user.token = jwtToken;
        res.status(200).send({ status: 'ok', message: user });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ status: 'error', message: 'login information not provided' });
        }
        const { error, user } = await db.userExists(email, password);
        if (error) {
            return res.status(500).send({ status: 'error', message: error });
        }
        const jwtToken = sign(user, process.env.JWTSECRETKEY);
        user.token = jwtToken;
        res.status(200).send({ status: 'ok', message: user });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const getUser = async (req, res) => {
    try {
        const { error, profile } = await db.getUserProfile(req.user.userId);
        if(error){
            res.status(400).send({status: 'error', message: 'user not found'});
        }
        else{
            res.status(200).send({ status: 'ok', message: profile });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const createBlog = async (req, res) => {
    try {
        if (!req.body.title || !req.body.content) {
            return res.status(400).send({ status: 'error', message: 'blog content missing' });
        }
        let { blog, error } = await db.createBlog(uuid(), req.user.userId, req.body.title, req.body.content);
        if (error) {
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok', message: blog });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const deleteBlog = async (req, res) => {
    try {
        let done = await db.deleteBlog(req.user.userId, req.params['blogId']);
        if (!done) {
            res.status(500).send({ status: 'error'});
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

const getBlog = async (req, res) => {
    try {
        let { error, blog } = await db.getBlog(req.params['blogId']);
        if (error) {
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok', message: blog });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

const getUserBlogs = async (req, res) => {
    try {
        let { error, blogs } = await db.getBlogsOfUser(req.user.userId);
        if (error) {
            res.status(500).send({ status: 'error', message: error });
        }
        else {
            res.status(200).send({ status: 'ok', message: blogs });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
};

module.exports = { signIn, signUp, getUser, createBlog, deleteBlog, getBlog, getUserBlogs };