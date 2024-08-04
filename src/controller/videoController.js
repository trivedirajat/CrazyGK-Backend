
var plan = require("../models/plan");
const videoModal = require("../models/videoModal");
const video = require("../models/videoModal");
var { ObjectId } = require('mongodb');

async function addVideo(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }

        const { title, description, video_url, video_id, is_trending, subject_id } = req.body;
        if (title !='' && video_url !='' && subject_id != '' ) {
            if (video_id != undefined && video_id != '') {
                var result = await videoModal.updateOne({ _id: new ObjectId(video_id) }, req.body);
                if (result) {
                    var results = await videoModal.find({ _id: new ObjectId(video_id) });
                    var response = {
                        status: 200,
                        message: `Video update Successfully`,
                        data: results,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Video update Failed.`,
                    }
                    return res.status(201).send(response);
                }
            } else {
                var chkPln = await videoModal.find({ title: title });
                if (chkPln.length > 0) {
                    var response = {
                        status: 201,
                        message: `This video already available.`,
                    }
                    return res.status(201).send(response);
                }
                var result = await videoModal.create(req.body);
                if (result) {
                    var response = {
                        status: 200,
                        message: `Video add Successfully.`,
                        data: result,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Video add Failed.`,
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
async function getvideo(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 30, offset = 0, subject_id, is_trending, search_title} = req.body;
        const page = Math.max(0, Number(offset));
        let query = {}
        if(subject_id != undefined && subject_id!= ''){
            query.subject_id = new ObjectId(subject_id)
        }
        if (search_title != undefined && search_title != '') {
            query.title = { $regex: new RegExp(search_title, "ig") }
        }
        if(is_trending != undefined && is_trending!= ''){
            query.is_trending = is_trending == 'true' ? true:false
        }
        const result = await videoModal.aggregate([
            {$match : query},
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject_id",
                    foreignField: "_id",
                    as: "subjects",
                }
             },
             {$unwind:'$subjects'},
             {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    video_url: 1,
                    status: 1,
                    createdDate:1,
                    is_trending:1,
                    subject_id: 1,
                    subject_name: "$subjects.subject_name"
                }
             }
        ]).skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();

        if (result.length > 0) {
            const total = await videoModal.count(query);

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
async function videoDelete(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { video_id } = req.body;
        if(video_id != ''){
            const result = await videoModal.deleteOne({_id: new ObjectId(video_id)});
                var response = {
                    status: 200,
                    message: 'Success.',
                }
                return res.status(200).send(response);
        }else{
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

module.exports = { addVideo, getvideo, videoDelete };
