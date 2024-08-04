
const { jwtToken } = require('../helper/helper');
async function tokenGenrate(req, res){

    const token = await jwtToken(0, 'test', 'test@getMaxListeners.com', 'Public');

    var response = {
        status : 200,
        message : 'Success',
        data : {token : token},
    }
    return res.status(200).send(response);
}

module.exports = {tokenGenrate};
