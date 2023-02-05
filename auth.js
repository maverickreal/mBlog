const { verify, sign } = require('jsonwebtoken');

let uidToJwt = {};
const emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const assignToken = user => {
    const jwtToken = sign(user,
        process.env.JWTSECRETKEY,
        { expiresIn: '7d' }
        );
    user.token = jwtToken;
    uidToJwt[user.userId] = jwtToken;
}

const invalidate = userId => {
    delete uidToJwt[userId];
}

const auth = (req, res, next) => {
    try {
        const jwtToken = req.body.token || req.query.token || req.headers['x-access-token'];
        req.user = verify(jwtToken, process.env.JWTSECRETKEY);
        const realToken = uidToJwt[req.user.userId];
        if(realToken!==jwtToken){
            res.status(401).send({ status: 'error', message: 'authentication failed' });
        }
        else{
            next();
        }
    }
    catch (error) {
        console.log(error);
        res.status(401).send({ status: 'error', message: 'authentication failed' });
    }
};

const checkEmail = email =>{
    return emailPattern.test(email);
}

const checkPassword = password => {
    if (password.length < 6) {
        return false;
    }
    let strength = 1;
    if (password.length >= 8){
        strength += 1;
    }
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)){
        strength += 2;
    }
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)){
        strength += 3;
    }
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)){
        strength += 3;
    }
    if (password.length > 12){
        strength += 1;
    }
    return ( strength>=3 );
}


module.exports = {
    assignToken, auth,
    checkEmail, checkPassword,
    invalidate
};