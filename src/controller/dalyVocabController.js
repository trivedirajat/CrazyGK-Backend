
const dalyVocabModal = require("../models/dalyVocabModal");
var { ObjectId } = require('mongodb');

async function addDalyVocab(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { dalyVocab_id, title, decription } = req.body;
        if (title != '') {
            if (dalyVocab_id != undefined && dalyVocab_id != '') {
                var result = await dalyVocabModal.updateOne({ _id: new ObjectId(dalyVocab_id) }, req.body);
                var msg = 'Update '
                var results = await dalyVocabModal.find({ _id: new ObjectId(dalyVocab_id) });
                if (result) {
                    result = results != undefined ? results : result

                    var response = {
                        status: 200,
                        message: `${msg} Successfully`,
                        data: result,
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

                var result = await dalyVocabModal.create(req.body);
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
async function getDalyVocab(req, res) {
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

        const result = await dalyVocabModal.find(query).sort({_id : -1}).skip(Number(limit) * page).limit(Number(limit)).exec();
        if (result.length > 0) {
            const total = await dalyVocabModal.count(query);

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
async function deleteDalyVocab(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { dalyVocab_id } = req.body;

        const result = await dalyVocabModal.deleteOne({_id: new ObjectId(dalyVocab_id)});
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

module.exports = { addDalyVocab, getDalyVocab, deleteDalyVocab};
