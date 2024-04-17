const jwt = require('jsonwebtoken');

const stdauthenticatetoken = (req, res, next) => {
    const token = req.cookies.jwtoken;

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.STDSECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

module.exports = stdauthenticatetoken;
