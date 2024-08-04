
var subjects = require("../models/subjects");
const blogModal = require("../models/blogModal");
var { ObjectId } = require('mongodb');
const { s3UploadImage } = require("../helper/helper");

async function addBlog(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { blog_id, title, decription } = req.body;
        if (title != '') {
            if (req.files && typeof req.files.image != undefined && req.files.image != null) {
                req.body.image = req.files.image[0].filename;
                bucketFilePath= 'blog/'+req.files.image[0].filename;
                const localFilePath = req.files.image[0].destination+req.files.image[0].filename;
                const imageUpload = await s3UploadImage(localFilePath, bucketFilePath)
                req.body.image = bucketFilePath
            }
            if (blog_id != undefined && blog_id != '') {
                var result = await blogModal.updateOne({ _id: new ObjectId(blog_id) }, req.body);
                var msg = 'Update '
                var results = await blogModal.find({ _id: new ObjectId(blog_id) });
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

                var result = await blogModal.create(req.body);
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
async function getBlogs(req, res) {
    try {
       
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 400, offset = 0, subject_id, search_title} = req.body;
        const page = Math.max(0, Number(offset));

        let query = {}
        if(subject_id != undefined && subject_id!= ''){
            query.subject_id = new ObjectId(subject_id)
        }
        if (search_title != undefined && search_title != '') {
            query.title = { $regex: new RegExp(search_title, "ig") }
        }
        const result = await blogModal.aggregate([
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
                    image: 1,
                    status: 1,
                    createdDate:1,
                    subject_id: 1,
                    subject_name: "$subjects.subject_name"
                }
             }
        ]).skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();

        if (result.length > 0) {
            const total = await blogModal.count(query);

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
async function deleteBlog(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { blog_id } = req.body;

        const result = await blogModal.deleteOne({_id: new ObjectId(blog_id)});
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

module.exports = { addBlog, getBlogs, deleteBlog};
