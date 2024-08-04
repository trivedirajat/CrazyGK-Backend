
const studyMaterialModal = require("../models/studyMaterialModal");
const subjectTopics = require("../models/subjectTopics");
var { ObjectId } = require('mongodb');

async function addStudyMaterial(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { title, description, subject_id, material_id } = req.body;
        if (title !='' && subject_id !='' ) {
            if (material_id != undefined && material_id != '') {
                var result = await studyMaterialModal.updateOne({ _id: material_id }, req.body);
                if (result) {
                    var results = await studyMaterialModal.find({ _id: material_id });
                    var response = {
                        status: 200,
                        message: `Study material update Successfully`,
                        data: results,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Study material update Failed.`,
                    }
                    return res.status(201).send(response);
                }
            } else {
                var chkPln = await studyMaterialModal.find({ title: title });
                if (chkPln.length > 0) {
                    var response = {
                        status: 201,
                        message: `This study material already available.`,
                    }
                    return res.status(201).send(response);
                }
                var result = await studyMaterialModal.create(req.body);
                if (result) {
                    var response = {
                        status: 200,
                        message: `Study material add Successfully.`,
                        data: result,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Study material add Failed.`,
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

async function getStudyMaterial(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 30, offset = 0, search_title} = req.body;
        const page = Math.max(0, Number(offset));
        let query = {}
        if (search_title != undefined && search_title != '') {
            query.title = { $regex: new RegExp(search_title, "ig") }
        }
        const result = await studyMaterialModal.aggregate([
            {$match:query},
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
                    subject_id: 1,
                    status: 1,
                    subject_name: "$subjects.subject_name"
                }
             }
             ])
            //  .skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();
        
        if (result.length > 0) {

            var response = {
                status: 200,
                message: 'Success.',
                data: result,
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
async function deleteStudyMaterial(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { stadymaterial_id } = req.body;
        if(stadymaterial_id != undefined){
        const result = await studyMaterialModal.deleteOne({_id: new ObjectId(stadymaterial_id)})        
        if (result) {

            var response = {
                status: 200,
                message: 'Success.',
            }
            return res.status(200).send(response);
        } else {
            var response = {
                status: 201,
                message: 'Failed.',
            }
            return res.status(201).send(response);
        }
    }else{
        var response = {
            status: 201,
            message: 'Can not be empty valuee.',
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


async function addSubjectTopics(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { topic_name, containt, subject_id, material_id, topic_id } = req.body;
        console.log('req.body: ', req.body);
        if (topic_name !='' && subject_id !='' ) {
            if (topic_id != undefined && topic_id != '') {
                var result = await subjectTopics.updateOne({ _id: new ObjectId(topic_id)  }, req.body);
                if (result) {
                    var results = await subjectTopics.find({ _id: new ObjectId(topic_id) });
                    var response = {
                        status: 200,
                        message: `Subject topics update Successfully`,
                        data: results,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Subject topics update Failed.`,
                    }
                    return res.status(201).send(response);
                }
            } else {
                var chkPln = await subjectTopics.find({ topic_name: topic_name });
                if (chkPln.length > 0) {
                    var response = {
                        status: 201,
                        message: `This subject topics already available.`,
                    }
                    return res.status(201).send(response);
                }
                var result = await subjectTopics.create(req.body);
                if (result) {
                    var response = {
                        status: 200,
                        message: `Subject topics add Successfully.`,
                        data: result,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Study material add Failed.`,
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

async function getSubjectTopics(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { limit = 30, offset = 0, subject_id, topic_name } = req.body;
        const page = Math.max(0, Number(offset));
        let query = {}
        if(subject_id!= undefined && subject_id != ''){
            query = {subject_id: new ObjectId(subject_id)}
        }
        if (topic_name != undefined && topic_name != '') {
            query.topic_name = { $regex: new RegExp(topic_name, "ig") }
        }
        const result = await subjectTopics.aggregate([
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
                    topic_name: 1,
                    containt: 1,
                    subject_id: 1,
                    status: 1,
                    subject_name: "$subjects.subject_name",
                }
             }
             ])
            //  .skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();
        
        if (result.length > 0) {

            var response = {
                status: 200,
                message: 'Success.',
                data: result,
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

async function deleteSubjectTopics(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }
        const { topic_id } = req.body;
        if(topic_id != undefined){
        const result = await subjectTopics.deleteOne({_id: new ObjectId(topic_id)})        
        if (result) {

            var response = {
                status: 200,
                message: 'Success.',
            }
            return res.status(200).send(response);
        } else {
            var response = {
                status: 201,
                message: 'Failed.',
            }
            return res.status(201).send(response);
        }
    }else{
        var response = {
            status: 201,
            message: 'Can not be empty valuee.',
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
module.exports = { addStudyMaterial, getStudyMaterial, deleteStudyMaterial, addSubjectTopics, getSubjectTopics, deleteSubjectTopics };
