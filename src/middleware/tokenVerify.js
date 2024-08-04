var jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
    const { token } = req.headers;
    // console.log('token: ', token);
    if (!token) {
        // var responseErr = {
        //     status: 400,
        //     message: 'Token not provided.'
        // };
        // return res.status(400).send(responseErr);
        next();
    }

    const tokens = jwt.verify(token, 'CRAZYGKTRICKSAPI', function (err, decoded) {
        if (decoded) {
            if (decoded.type === 'logged') {

                req['user_id'] = decoded.user_id;
                req['email'] = decoded.email;
                req['name'] = decoded.name;
                req['user_type'] = decoded.user_type;
                req['type'] = decoded.type;
                next();
            } else {
                req.user = {
                    user_id: decoded.user_id,
                    email: decoded.email,
                    name: decoded.name,
                    user_type: decoded.user_type,
                    type: decoded.type
                };
                next();
            }
        }
    });
}

module.exports = { verifyToken };
