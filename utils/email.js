import nodemailer from 'nodemailer';
class emailClass{
    constructor(from, to, subject, text, html){
        this.transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASWORD
            }
        });
        this.mailOptions = {
            from: `"Carrot Cake Team" <${from}>`,
            to: `${to}`, //'user1@example.com, user2@example.com'
            subject: `${subject}`,
            text: `${text}`,
            html: `${html}`,
            // attachments: [
            //     {
            //         filename: 'mailtrap.png',
            //         path: __dirname + '/mailtrap.png',
            //         cid: 'uniq-mailtrap.png' 
            //     }
            // ]
        };
    }

    send_mail = async (req, res)=>{
        this.transport.sendMail(this.mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            return info.messageId;
        });
    }
}

export default emailClass