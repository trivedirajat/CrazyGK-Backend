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

    jwt.verify(token, process.env.JWTKEY, function (err, decoded) {
        console.log("decoded",decoded)
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

async function verifyRole(req, res, next) {
  const user_id = req?.user_id || req?.user?.user_id;
  if (!user_id) {
    var responseErr = {
      status: 403,
      message: 'Unauthorized access.',
    };
    return res.status(403).send(responseErr);
  }
  next();
}

module.exports = { verifyToken, verifyRole };
