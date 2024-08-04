
const { s3UploadImage } = require("../helper/helper");
const whatsNewModal = require("../models/whatsNewModal");
var { ObjectId } = require('mongodb');

async function addWhatsNew(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { whatsNew_id, title, decription } = req.body;
        if (title != '') {
            if (req.files && typeof req.files.image != undefined && req.files.image != null) {
                req.body.image = req.files.image[0].filename;
                bucketFilePath= 'whats_new/'+req.files.image[0].filename;
                const localFilePath = req.files.image[0].destination+req.files.image[0].filename;
                const imageUpload = await s3UploadImage(localFilePath, bucketFilePath)
                req.body.image = bucketFilePath
            }
            if (whatsNew_id != undefined && whatsNew_id != '') {
                var result = await whatsNewModal.updateOne({ _id: new ObjectId(whatsNew_id) }, req.body);
                var msg = 'Update '
                var results = await whatsNewModal.find({ _id: new ObjectId(whatsNew_id) });
                if (result) {
                    result = results != undefined ? results : result

                    var response = {
                        status: 200,
                        message: `${msg} Successfully`,
                        data: result,
                        base_url: process.env.BASEURL
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `${msg} Failed.`,
                    }
                    return res.status(201).send(response);
                }
            } else {

                var result = await whatsNewModal.create(req.body);
                var msg = 'Add '
                if (result) {
                    result = results != undefined ? results : result

                    var response = {
                        status: 200,
                        message: `${msg} Successfully`,
                        data: result,
                        base_url: process.env.BASEURL
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `${msg} Failed.`,
                    }
                    return res.status(201).send(response);
                }
            }
        } else {
            var response = {
                status: 201,
                message: 'Can not be empty value.',
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
async function getWhatsNew(req, res) {
    try {
       
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 400, offset = 0, search_title } = req.body;
        const page = Math.max(0, Number(offset));

        let query = {}
        if (search_title != undefined && search_title != '') {
            query.title = { $regex: new RegExp(search_title, "ig") }
        }
        const result = await whatsNewModal.find(query).sort({_id : -1}).skip(Number(limit) * page).limit(Number(limit)).exec();
        if (result.length > 0) {
            const total = await whatsNewModal.count(query);

            var response = {
                status: 200,
                message: 'Success.',
                data: result,
                total_data: total,
                base_url: process.env.BASEURL
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
async function deleteWhatsNew(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { whatsNew_id } = req.body;

        const result = await whatsNewModal.deleteOne({_id: new ObjectId(whatsNew_id)});
        var response = {
            status: 200,
            message: 'Success.',
        }
        return res.status(200).send(response);
    } catch (error) {
        console.log("error", error.message);
        var responce = {
            status: 501,
            message: "Internal Server Error",
        };
        return res.status(501).send(responce);
    }
}

module.exports = { addWhatsNew, getWhatsNew, deleteWhatsNew};
