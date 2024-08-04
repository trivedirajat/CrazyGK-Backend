const nodemailer = require("nodemailer");
const sendemails = async (email, name, otp, type) => {
    try {

        if (type == 1) { //Send verification otp
            var sub = 'Verification code for Disital India App';
            var msg = ``;
            var mesHtml = `<div><h3 style="font-size: 17px;color: black;">Hello ${name}</h3><p style="font-size: 15px;color: black;">Welcome to the Disital India App</p><p style="margin-top: 0px;font-size: 15px;color: black;"> Your email verification code is <br></p><b>${otp}</b> </p><h4 style="margin-bottom:0px;color: black;">Thanks</h4><h4 style="margin-top: 0px;color: black;">Team Disital India App </h4></div>`;
        }
        if (type == 2) { //resent otp
            var sub = 'Resend OTP';
            var msg = '';
            var mesHtml = `<div><h3 style="font-size: 17px;color: black;">Hello ${name}</h3><p style="font-size: 15px;color: black;">Your resend OTP is <b>${otp}</b> you can verify your account with this OTP.</p><h4 style="margin-bottom:0px;color: black;">Thanks</h4><h4 style="margin-top: 0px;color: black;">Team Disital India App</h4></div>`;
        }
        if (type == 3) { //forgot otp
            var sub = 'Forgot password OTP';
            var msg = `Dear ${name}, \n
                        \n Your new otp is : \n ${otp}
                        \n Best Regards, \n Disital India App`;
            var mesHtml = `<div><h3 style="font-size: 17px;color: black;">Hello ${name}</h3><p style="font-size: 15px;color: black;">Your forgot password OTP is <b>${otp}</b> you can verify your account with this OTP and can change your password.</p><h4 style="margin-bottom:0px;color: black;">Thanks</h4><h4 style="margin-top: 0px;color: black;">Team Disital India App</h4></div>`;
        }

        this.transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASWORD
            }
        });
        this.mailOptions = {
            from: `"Disital India App" <${process.env.ADMIN_EMAIL}>`,
            to: `${email}`, //'user1@example.com, user2@example.com'
            subject: `${sub}`,
            text: `text`,
            html: `${mesHtml}`,
        };

        this.transport.sendMail(this.mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            return info.messageId;
        });
        return 0;
    } catch (error) {
        console.log('error: ', error);
        return 0;
    }
}


module.exports = sendemails;