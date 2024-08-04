
var subjects = require("../models/subjects");
const currentAffairs = require("../models/currentAffairs");
var { ObjectId } = require('mongodb');
var moment = require('moment');
const { s3UploadImage } = require("../helper/helper");

async function addCurrentAffairs(req, res) {
    try {
        const user_id = req.user_id
        if(user_id === undefined || user_id === ''){
            var responce = {
                status: 403,
                message: 'User not authorised.',
            }
            return res.status(403).send(responce);
        }
        const { currentAffairs_id, title, subject_id, decription } = req.body;
        if (title != '' && subject_id !='') {
            if (req.files && typeof req.files.image != undefined && req.files.image != null) {
                req.body.image = req.files.image[0].filename;
                bucketFilePath= 'currentAffairs/'+req.files.image[0].filename;
                const localFilePath = req.files.image[0].destination+req.files.image[0].filename;
                const imageUpload = await s3UploadImage(localFilePath, bucketFilePath)
                req.body.image = bucketFilePath
            }
            if (currentAffairs_id != undefined && currentAffairs_id != '') {
                var result = await currentAffairs.updateOne({ _id: new ObjectId(currentAffairs_id) }, req.body);
                var msg = 'Update '
                var results = await currentAffairs.find({ _id: new ObjectId(currentAffairs_id) });
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

                var result = await currentAffairs.create(req.body);
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
async function getCurrentAffairs(req, res) {
    try {
        const user_id = req.user_id
        if(user_id === undefined || user_id === ''){
            var responce = {
                status: 403,
                message: 'User not authorised.',
            }
            return res.status(403).send(responce);
        }
        const { limit = 400, offset = 0, subject_id, data_type, select_date, current_date, search_title } = req.body; // 1=Daily, 2=Monthly, 3=Topic Wise, Editorial 
        const startOfMonth = moment(current_date).startOf('month').format('DD-MM-YYYY');
        const endOfMonth   = moment(current_date).endOf('month').format('DD-MM-YYYY');

        const page = Math.max(0, Number(offset));
        let query = {}
        if(subject_id != undefined && subject_id!= ''){
            query.subject_id = new ObjectId(subject_id)
        }
        if (search_title != undefined && search_title != '') {
            query.title = { $regex: new RegExp(search_title, "ig") }
        }
        
        if(data_type == 2){//month
            query.date = {$gte: startOfMonth, $lt: endOfMonth}
        }
    
        const subLook = {
            $lookup: {
                from: "subjects",
                localField: "subject_id",
                foreignField: "_id",
                as: "subjects",
            }
        }
        const subUnw = {$unwind:'$subjects'}
        const subProject = {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                image: 1,
                status: 1,
                createdDate:1,
                subject_id: 1,
                date: 1,
                subject_name: "$subjects.subject_name"
            }
         }
        

        const dayWishDalyList = await currentAffairs.aggregate([{$match : query}, subLook, subUnw, subProject]).skip(Number(limit) * page).limit(Number(limit)).sort({ 'date': -1 }).exec();

        if(data_type == 1 && select_date != undefined && select_date.length > 0){
            query.date = { $in : JSON.parse(select_date)}
        }
        if(data_type == 2){//month
            query.is_important = true
        }
        const importantDate = await currentAffairs.aggregate([{$match : query}, subLook, subUnw, subProject]).skip(Number(limit) * page).limit(Number(limit)).sort({ 'date': -1 }).exec();
        
        if (importantDate.length > 0 || dayWishDalyList.length > 0) {
            const usrData = {
                day_wish_daly_list : dayWishDalyList,
                important_date : importantDate,
            }
            
            const total = await currentAffairs.count(search_title);

            var response = {
                status: 200,
                message: 'Success.',
                data: usrData,
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
async function deleteCurrentAffairs(req, res) {
    try {
        const user_id = req.user_id
        if(user_id === undefined || user_id === ''){
            var responce = {
                status: 403,
                message: 'User not authorised.',
            }
            return res.status(403).send(responce);
        }
        const { currentAffairs_id } = req.body;

        const result = await currentAffairs.deleteOne({_id: new ObjectId(currentAffairs_id)});
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
async function currentAffairsStatusUpdate(req, res) {
    try {
        const user_id = req.user_id
        if(user_id === undefined || user_id === ''){
            var responce = {
                status: 403,
                message: 'User not authorised.',
            }
            return res.status(403).send(responce);
        }
        const { currentAffairs_id, is_important } = req.body;

        const result = await currentAffairs.updateOne({_id: new ObjectId(currentAffairs_id)}, {is_important : is_important === 'true' ? true:false});
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

module.exports = { addCurrentAffairs, getCurrentAffairs, deleteCurrentAffairs, currentAffairsStatusUpdate};
