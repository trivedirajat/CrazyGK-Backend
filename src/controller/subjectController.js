
var subjects = require("../models/subjects");
var { ObjectId } = require('mongodb');
const { s3UploadImage, fileRemovePath } = require("../helper/helper");

async function addSubjects(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { subject_name, subject_id, description } = req.body;
        if (subject_name != '') {
            if (req.files && typeof req.files.image != undefined && req.files.image != null) {
                req.body.image = req.files.image[0].filename;
                bucketFilePath= 'subject/'+req.files.image[0].filename;
                const localFilePath = req.files.image[0].destination+req.files.image[0].filename;
                const imageUpload = await s3UploadImage(localFilePath, bucketFilePath)
                console.log("🚀 ~ addSubjects ~ imageUpload:", imageUpload)
                req.body.image = bucketFilePath
            }

            if (subject_id != undefined && subject_id != '') {
                var result = await subjects.updateOne({ _id: new ObjectId(subject_id) }, req.body);
                var msg = 'Update '
                var results = await subjects.find({ _id: new ObjectId(subject_id) });
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

                var chkCat = await subjects.find({ subject_name: subject_name });
                if (chkCat.length > 0) {
                    var response = {
                        status: 201,
                        message: `This subject already available.`,
                    }
                    return res.status(201).send(response);
                }
                var result = await subjects.create(req.body);
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
async function getSubjects(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 400, offset = 0, subject_name, subject_id } = req.body;
        const page = Math.max(0, Number(offset));

        let query = {}
        if (subject_name != undefined && subject_name != '') {
            query.subject_name = { $regex: new RegExp(subject_name, "ig") }
        }
        if (subject_id != undefined && subject_id != '') {
            query._id = subject_id
        }

        const result = await subjects.find(query).skip(Number(limit) * page).limit(Number(limit)).sort({ 'subject_name': 'asc' }).exec();
        if (result.length > 0) {
            const total = await subjects.count(query);

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
async function deleteSubjects(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { subject_id } = req.body;

        const result = await subjects.deleteOne({_id: new ObjectId(subject_id)});
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

module.exports = { addSubjects, getSubjects, deleteSubjects};
