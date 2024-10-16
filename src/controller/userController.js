
let user = require("../models/user");
let { ObjectId } = require('mongodb');
const { jwtToken } = require('../helper/helper');

async function getUserList(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }

        const { user_name, limit = 30, offset = 0 } = req.body;
        const page = Math.max(0, Number(offset));
        let query = { user_type: 'user' };
        if (user_name != undefined && user_name != '') {
            query.user_name = { $regex: new RegExp(user_name, "ig") };
        }
        const result = await user.find(query).skip(Number(limit) * page).limit(Number(limit)).sort({ 'createdDate': 'desc' }).exec();
        if (result.length > 0) {
            const total = await user.find(query).count();

            var response = {
                status: 200,
                message: 'Success.',
                data: result,
                total_data: total,
            }
            return res.status(200).send(response);
        } else {
            var response = {
                status: 201,
                message: 'Failed.',
            }
            return res.status(201).send(response);
        }
    } catch (error) {
        console.log("error", error.message);
        var responce = {
            status: 501,
            message: "Internal Server Error",
        };
        return res.status(501).send(responce);
    }

}

async function updateUser(req, res) {
    try {
        const user_id = req.user_id
        if (user_id === undefined || user_id === '') {
            var responce = {
                status: 403,
                message: 'User not authorised.',
            }
            return res.status(403).send(responce);
        }
        if (req.files && typeof req.files.profile_image != undefined && req.files.profile_image != null) {
            req.body.profile_image = req.files.profile_image[0].filename;
        }
        let chkUser = await user.find({ _id: new ObjectId(user_id) }).exec();
        if (chkUser.length > 0) {
            let updt = await user.updateOne({ _id: new ObjectId(user_id) }, req.body);
            if (updt.acknowledged) {
                let updateUser = await user.findOne({ _id: new ObjectId(user_id) }).exec();
                if (updateUser.profile_image) {
                    updateUser.profile_image = process.env.BASEURL+process.env.PROFILE + updateUser.profile_image;
                }
                const token = await jwtToken(updateUser._id, updateUser.user_name, updateUser.email, updateUser.user_type, 'logged')
                let response = {
                    status: 200,
                    message: `User update success.`,
                    data: { userDetail: updateUser, token: token }
                }
                return res.status(200).send(response);
            } else {
                let response = {
                    status: 201,
                    message: `User update Failed.`,
                }
                return res.status(201).send(response);
            }
        } else {
            let response = {
                status: 201,
                message: `User not available.`,
            }
            return res.status(201).send(response);
        }
    } catch (error) {
        console.log("error", error.message);
        var responce = {
            status: 501,
            message: "Internal Server Error",
        };
        return res.status(501).send(responce);
    }

}

module.exports = { getUserList,updateUser };
