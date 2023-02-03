const { verify } = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const jwtToken = req.body.token || req.query.token || req.headers['x-access-token'];
        req.user = verify(jwtToken, process.env.JWTSECRETKEY);
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).send({ status: 'error', message: 'authentication failed' });
    }
};

module.exports = { auth };