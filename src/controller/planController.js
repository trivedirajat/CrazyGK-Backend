
var plan = require("../models/plan");


async function addPlan(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }

        const { title, description, price, features, duration, plan_id } = req.body;
        if (title !='' && price !='' ) {

            if (plan_id != undefined && plan_id != '' && duration !='') {
                var result = await plan.updateOne({ _id: plan_id }, req.body);
                if (result) {
                    var results = await plan.find({ _id: plan_id });
                    var response = {
                        status: 200,
                        message: `Plan update Successfully`,
                        data: results,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Plan update Failed.`,
                    }
                    return res.status(201).send(response);
                }
            } else {

                var chkPln = await plan.find({ title: title });
                if (chkPln.length > 0) {
                    var response = {
                        status: 201,
                        message: `This plan already available.`,
                    }
                    return res.status(201).send(response);
                }
                var result = await plan.create(req.body);
                if (result) {
                    var response = {
                        status: 200,
                        message: `Plan add Successfully.`,
                        data: result,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: `Plan add Failed.`,
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
async function getPlan(req, res) {
    try {
        const user_id = req.user_id
        // if(user_id != undefined || user_id != ''){
        //     var responce = {
        //         status: 403,
        //         message: 'User not authorised.',
        //     }
        //     return res.status(403).send(responce);
        // }

        const result = await plan.find().exec();
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

module.exports = { addPlan, getPlan };
