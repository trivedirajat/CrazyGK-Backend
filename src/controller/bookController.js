
var subjects = require("../models/subjects");
const bookModal = require("../models/bookModal");
var { ObjectId } = require('mongodb');
const { s3UploadImage } = require("../helper/helper");

async function addBook(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { book_id, pdf_link } = req.body;
        if (pdf_link != '') {
            if (req.files && typeof req.files.image != undefined && req.files.image != null) {
                req.body.image = req.files.image[0].filename;

                bucketFilePath= 'book/'+req.files.image[0].filename;
                const localFilePath = req.files.image[0].destination+req.files.image[0].filename;
                const imageUpload = await s3UploadImage(localFilePath, bucketFilePath)
                req.body.image = bucketFilePath
            }
            if (book_id != undefined && book_id != '') {
                var result = await bookModal.updateOne({ _id: new ObjectId(book_id) }, req.body);
                var msg = 'Update '
                var results = await bookModal.find({ _id: new ObjectId(book_id) });
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

                var result = await bookModal.create(req.body);
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
async function getBooks(req, res) {
    try {
        
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 400, offset = 0, is_active } = req.body;
        const page = Math.max(0, Number(offset));

        let query = {}
        if(is_active != undefined && is_active != ''){
            query.is_active = is_active
        }

        const result = await bookModal.find(query).skip(Number(limit) * page).limit(Number(limit)).exec();
        if (result.length > 0) {
            const total = await bookModal.count();

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
async function deleteBook(req, res) {
    try {
        // const user_id = req.user_id
        // if(user_id === undefined || user_id === ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { book_id } = req.body;

        const result = await bookModal.deleteOne({_id: new ObjectId(book_id)});
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

module.exports = { addBook, getBooks, deleteBook};
