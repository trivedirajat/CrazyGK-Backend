var user = require('../models/user')
var { hashPassword, comparePassword, s3UploadImage } = require('../helper/helper')
var sendemails = require('../helper/mailSend');
const { jwtToken } = require('../helper/helper');
const { isNumber } = require('razorpay/dist/utils/razorpay-utils');
var { ObjectId } = require('mongodb');

async function checkMobile(req, res) {
    try {
        const { mobile } = req.body;
        if (mobile != '') {
            var checkemail = await user.find({ mobile: mobile }).exec();
            if (checkemail.length > 0) {
                var response = {
                    status: 201,
                    message: 'Mobile already exist.',
                }
                return res.status(201).send(response);
            } else {

                    var response = {
                        status: 200,
                        message: 'Mobile is available.',
                    }
                    return res.status(200).send(response);
            }
        } else {
            var response = {
                status: 201,
                message: 'Can not be empty value',
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
async function signup(req, res) {
    try {
        let { mobile, user_type } = req.body;
        
        if ( mobile!='' && user_type !='') {

            var title =  'mobile'
            var checkeMobile = await user.find({ mobile: mobile }).exec();
            if (checkeMobile.length === 0) {
                // let otp = Math.floor(1000 + Math.random() * 9000)
                const otp = 111111;
                req.body.otp = otp;
                var result = await user.create(req.body);
                if (result) {
                    // await sendemails(email, user_name, otp, 1);

                    var response = {
                        status: 200,
                        message: 'Registration Success',
                        data: result,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: 'Registration failed',
                    }
                    return res.status(201).send(response);
                }
            } else {
                var response = {
                    status: 201,
                    message: `This ${title} Already Registration.`,
                }
                return res.status(201).send(response);
            }
        } else {
            var response = {
                status: 201,
                message: 'Can not be empty value',
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
async function updateProfile(req, res) {
    try {
        const user_id = req.user_id
        let { user_name, password } = req.body;
        
        if (user_name != '') {

            if (req.files && typeof req.files.profile != undefined && req.files.profile != null) {
                req.body.profile = req.files.profile[0].filename;
                bucketFilePath= 'profile/'+req.files.profile[0].filename;
                const localFilePath = req.files.profile[0].destination+req.files.profile[0].filename;
                const imageUpload = await s3UploadImage(localFilePath, bucketFilePath)
                req.body.profile = bucketFilePath
            }
            if(password != undefined && password !=''){
                password = password ? password:'123456';
                req.body.password = await hashPassword(password);
            }
            var result = await user.updateOne({ _id: new ObjectId(user_id) }, req.body);
            if (result) {
                var resData = await user.findOne({ _id: new ObjectId(user_id) }).exec();
                const token = await jwtToken(resData._id, user_name, resData.email, resData.user_type, 'logged')
                var response = {
                    status: 200,
                    message: 'Update Success',
                    data: resData,
                    token: token,
                    base_url: process.env.BASEURL
                }
                return res.status(200).send(response);
            } else {
                var response = {
                    status: 201,
                    message: 'Update failed',
                }
                return res.status(201).send(response);
            }
        } else {
            var response = {
                status: 201,
                message: 'Can not be empty value',
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
async function login(req, res) {
    try {
        const { mobile, password, user_type } = req.body;
        if (mobile != '' && password!=undefined && password != '') {
            // var checkemail = await user.find({ user_name: user_name }).exec();
            // var checkemail = await user.find({$or : [{ user_name: user_name }, { email: user_name }, { mobile: user_name }]}).exec();
            var checkemail = await user.find({ mobile: mobile }).exec();
            if (checkemail.length > 0) {
                if (checkemail[0].verified) {
                if(checkemail[0].password != undefined && checkemail[0].user_name != undefined){    
                    const passChk = await comparePassword(checkemail[0].password, password);
                    if (passChk) {
                            if (checkemail[0].user_type != undefined && checkemail[0].user_type == user_type) {
                                if (checkemail[0].profile_image) {
                                    checkemail[0].profile_image = process.env.BASEURL+process.env.PROFILE + checkemail[0].profile_image;
                                }
                                const token = await jwtToken(checkemail[0]._id, checkemail[0].user_name, checkemail[0].email, checkemail[0].user_type, 'logged')
                                var response = {
                                    status: 200,
                                    message: 'Login success.',
                                    data: { userDetail: checkemail[0], token: token }
                                }
                                return res.status(200).send(response);
                            } else {
                                var response = {
                                    status: 201,
                                    message: 'Please enter currect detail.',
                                }
                                return res.status(201).send(response);
                            }
                        } else {
                            var response = {
                                status: 201,
                                message: 'Please enter currect password.',
                            }
                            return res.status(201).send(response);
                        }
                    }else{
                        var response = {
                            status: 203,
                            message: 'Please update username and password.',
                        }
                        return res.status(203).send(response);    
                    }
                } else {
                    var response = {
                        status: 202,
                        message: 'Your account is not verify.', 
                    }
                    return res.status(202).send(response);
                }
            } else {
                var response = {
                    status: 201,
                    message: 'User not available.',
                }
                return res.status(201).send(response);
            }
        } else {
            var response = {
                status: 201,
                message: 'Can not be empty value',
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
async function otpVerify(req, res) {
    try {
        const { mobile, otp } = req.body;
        if (mobile != '' && otp != '') {
            var checkemail = await user.find({ mobile: mobile }).exec();

            if (checkemail.length > 0) {
                if (checkemail[0].otp == otp) {
                    await user.updateOne({ mobile: mobile }, { otp: null, verified: true });

                    let token = null
                    if(!checkemail[0].verified){
                         token = await jwtToken(checkemail[0]._id, checkemail[0].user_name, checkemail[0].email, checkemail[0].user_type, 'logged')
                    }
                    var response = {
                        status: 200,
                        message: 'OTP verify success.',
                        data: checkemail,
                        token: token,
                    }
                    return res.status(200).send(response);
                } else {
                    var response = {
                        status: 201,
                        message: 'Incorrect OTP, please enter currect OTP.',
                    }
                    return res.status(201).send(response);
                }
            } else {
                var response = {
                    status: 201,
                    message: 'User not available.',
                }
                return res.status(201).send(response);
            }
        } else {
            var response = {
                status: 201,
                message: 'Can not be empty value',
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

async function resentOtp(req, res) {
    try {
        const { mobile } = req.body;
        if (mobile != '') {
            var title =  'mobile'
            req.body.mobile = mobile
            const result = await user.find({ "mobile": mobile }).exec();
            if (result.length > 0) {
                // let otp = Math.floor(1000 + Math.random() * 9000)
                let otp = 111111
                var query = { '_id': result[0]._id, mobile: mobile };
                const datt = { otp: otp };
                const updateDat = await user.findOneAndUpdate(query, datt)
                if (updateDat) {
                    // await sendemails(email, result[0].user_name, otp, 2);
                    var responce = {
                        status: 200,
                        message: 'OTP send success.',
                    }
                    return res.status(200).send(responce);
                } else {
                    var responce = {
                        status: 201,
                        message: 'OTP send failed.',
                    }
                    return res.status(201).send(responce);
                }
            } else {
                var responce = {
                    status: 201,
                    message: `${title} not exist. please enter right ${title}`,
                }
                return res.status(201).send(responce);
            }
        } else {
            var responce = {
                status: 201,
                message: 'Can not be empty value.',
            }
            return res.status(201).send(responce);
        }
    } catch (error) {
        console.log('error', error.message)
        var responce = {
            status: 501,
            message: 'Internal Server Error.',
        }
        return res.status(501).send(responce);
    }
}
async function forgotPassword(req, res) {
    try {
        const { mobile } = req.body;
        if (mobile != '') {
            const result = await user.find({ "mobile": mobile }).exec();
            if (result.length > 0) {
                if(result[0]?.password != undefined && result[0]?.user_name != undefined){  
                    // let otp = Math.floor(1000 + Math.random() * 9000)
                    let otp = 1111
                    var query = { '_id': result[0]._id, mobile: mobile };
                    const datt = { otp: otp };
                    const updateDat = await user.findOneAndUpdate(query, datt)
                    if (updateDat) {
                        // await sendemails(result[0].email, result[0].user_name, otp, 3);
                        var responce = {
                            status: 200,
                            message: 'OTP send success.',
                        }
                        return res.status(200).send(responce);
                    } else {
                        var responce = {
                            status: 201,
                            message: 'OTP send failed.',
                        }
                        return res.status(201).send(responce);
                    }
                }else{
                    var response = {
                        status: 203,
                        message: 'Please update username and password.',
                    }
                    return res.status(203).send(response);
                }
            } else {
                var responce = {
                    status: 201,
                    message: 'Mobile not exist. please enter right mobile',
                }
                return res.status(201).send(responce);
            }
        } else {
            var responce = {
                status: 201,
                message: 'Can not be empty value.',
            }
            return res.status(201).send(responce);
        }
    } catch (error) {
        console.log('error', error.message)
        var responce = {
            status: 501,
            message: 'Internal Server Error.',
        }
        return res.status(501).send(responce);
    }
}
async function updatePassword(req, res) {
    try {
        const { mobile, password } = req.body;
        if (mobile != '' && password != '') {
            if(isNumber(mobile)){
                var title =  'mobile'
                req.body.mobile = mobile
            }else{
                var title =  'email'
                req.body.email = mobile
            }
            const result = await user.find({ "mobile": mobile }).exec();
            if (result.length > 0) {
                if (result[0].otp == null || result[0].otp == '') {
                    const hashPass = await hashPassword(password);
                    var query = { '_id': result[0]._id, mobile: mobile };
                    const datt = { password: hashPass };
                    await user.findOneAndUpdate(query, datt)
                    var responce = {
                        status: 200,
                        message: 'Password Update success.',
                    }
                    return res.status(200).send(responce);
                } else {
                    var responce = {
                        status: 200,
                        message: 'Please verify otp.',
                    }
                    return res.status(200).send(responce);
                }
            } else {
                var responce = {
                    status: 201,
                    message: `${title} not exist. please enter right ${title}`,
                }
                return res.status(201).send(responce);
            }
        } else {
            var responce = {
                status: 201,
                message: 'Can not be empty value.',
            }
            return res.status(201).send(responce);
        }
    } catch (error) {
        console.log('error', error.message)
        var responce = {
            status: 501,
            message: 'Internal Server Error.',
        }
        return res.status(501).send(responce);
    }
}
async function changePassword(req, res) {
    try {
        const user_id = req.user_id
        if (user_id == undefined || user_id == '') {
            var responce = {
                status: 403,
                message: 'User not authorised.',
            }
            return res.status(403).send(responce);
        }
        const { old_password, new_password } = req.body;
        if (old_password != '' && new_password != '') {
            const result = await user.find({ "_id": user_id }).exec();
            if (result.length > 0) {
                const passChk = await comparePassword(result[0].password, old_password);
                if (passChk) {
                    const hashPass = await hashPassword(new_password);
                    var query = { '_id': user_id };
                    const datt = { password: hashPass };
                    await user.findOneAndUpdate(query, datt)
                    var responce = {
                        status: 200,
                        message: 'Password Update success.',
                    }
                    return res.status(200).send(responce);

                }else {
                    var responce = {
                        status: 200,
                        message: 'Old password is wrong.',
                    }
                    return res.status(200).send(responce);
                }
            } else {
                var responce = {
                    status: 201,
                    message: 'User not exist.',
                }
                return res.status(201).send(responce);
            }
        } else {
            var responce = {
                status: 201,
                message: 'Can not be empty value.',
            }
            return res.status(201).send(responce);
        }
    } catch (error) {
        console.log('error', error.message)
        var responce = {
            status: 501,
            message: 'Internal Server Error.',
        }
        return res.status(501).send(responce);
    }
}

async function getUserList(req, res) {
    try {
        const user_id = req.user_id
        if (user_id == undefined || user_id == '') {
            var responce = {
                status: 403,
                message: 'User not authorised.',
            }
            return res.status(403).send(responce);
        }
        const result = await user.find({user_type:'user'}).select({user_name: 1, email: 1,status: 1,user_type:1,address: 1,birth_date:1, city: 1, country: 1,gender: 1,mobile: 1,name: 1,pincode: 1,state: 1, profile:1})
        if (result.length > 0) {
            var responce = {
                status: 200,
                message: 'success.',
                data: result,
                base_url: process.env.BASEURL
            }
            return res.status(200).send(responce);
        } else {
            var responce = {
                status: 201,
                message: 'failed.',
            }
            return res.status(201).send(responce);
        }
    } catch (error) {
        console.log('error', error.message)
        var responce = {
            status: 501,
            message: 'Internal Server Error.',
        }
        return res.status(501).send(responce);
    }
}

module.exports = { checkMobile, login, signup, updateProfile, otpVerify, resentOtp, forgotPassword, updatePassword, changePassword,  getUserList };
