
const { s3UploadImage } = require("../helper/helper");
var plan = require("../models/plan");
const reviewModal = require("../models/reviewModal");
var { ObjectId } = require('mongodb');

async function addReview(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }

        const { review, rating, review_id } = req.body;
        if (review !='' || rating !=''  ) {

            if (req.files && typeof req.files.user_profile != undefined && req.files.user_profile != null) {
                req.body.user_profile = req.files.user_profile[0].filename;
                bucketFilePath= 'profile/'+req.files.user_profile[0].filename;
                const localFilePath = req.files.user_profile[0].destination+req.files.user_profile[0].filename;
                const imageUpload = await s3UploadImage(localFilePath, bucketFilePath)
                req.body.user_profile = bucketFilePath
            }

            if (review_id != undefined && review_id != '') {
                var result = await reviewModal.updateOne({ _id: new ObjectId(review_id) }, req.body);
                if (result) {
                    var results = await reviewModal.find({ _id: new ObjectId(review_id) });
                    var response = {
                        status: 200,
                        message: `Review update Successfully`,
                        data: results[0],
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Review update Failed.`,
                    }
                    return res.status(201).send(response);
                }
            } else {
             req.body.user_id = user_id
                var result = await reviewModal.create(req.body);
                if (result) {
                    var response = {
                        status: 200,
                        message: `Review add Successfully.`,
                        data: result,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Review add Failed.`,
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
async function getReview(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 30, offset = 0, review_id} = req.body;
        const page = Math.max(0, Number(offset));
        
        // const result = await reviewModal.find().skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();
        const result = await reviewModal.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "users",
                }
             },
             {$unwind:'$users'},
             {
                $project: {
                    _id: 1,
                    review: 1,
                    rating: 1,
                    createdDate: 1,
                    createdDate:1,
                    user_id: 1,
                    name: 1,
                    user_profile: 1,
                    user_name: "$users.name",
                    profile: "$users.profile",
                }
             }
        ]).skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();

        if (result.length > 0) {
            var response = {
                status: 200,
                message: 'Success.',
                data: result,
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
async function reviewDelete(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { review_id } = req.body;
        if(review_id != ''){
                await reviewModal.deleteOne({_id: new ObjectId(review_id)});
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

module.exports = { addReview, getReview, reviewDelete };
