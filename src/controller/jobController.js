
const jobModal = require("../models/jobModal");
var { ObjectId } = require('mongodb');

async function addJob(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { job_id, title, decription, apply_date } = req.body;
        if (title != '') {
            if (job_id != undefined && job_id != '') {
                var result = await jobModal.updateOne({ _id: new ObjectId(job_id) }, req.body);
                var msg = 'Update '
                var results = await jobModal.find({ _id: new ObjectId(job_id) });
                if (result) {
                    result = results != undefined ? results : result

                    var response = {
                        status: 200,
                        message: `${msg} Successfully`,
                        data: result,
                        base_url: process.env.BASEURL+'/'+process.env.BLOG
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

                var result = await jobModal.create(req.body);
                var msg = 'Add '
                if (result) {
                    result = results != undefined ? results : result

                    var response = {
                        status: 200,
                        message: `${msg} Successfully`,
                        data: result,
                        base_url: process.env.BASEURL+'/'+process.env.BLOG
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
async function getJob(req, res) {
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

        const result = await jobModal.find(query).sort({_id : -1}).skip(Number(limit) * page).limit(Number(limit)).exec();
        if (result.length > 0) {
            const total = await jobModal.count(query);

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
async function deleteJob(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { job_id } = req.body;

        const result = await jobModal.deleteOne({_id: new ObjectId(job_id)});
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

module.exports = { addJob, getJob, deleteJob};
