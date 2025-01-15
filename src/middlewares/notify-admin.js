const nodemailer = require("nodemailer");
const { BadRequestError } = require("../lib/errors");
module.exports = (username) => {
  try {
    main(username).then((response) => {
      if (!!response) {
        console.log("mail sent");
      } else {
        console.log("error notifying user");
        throw new BadRequestError("Bad Request");
      }
    });
  } catch (error) {
    console.log(`error notifying user: ${error}`);
  }

  async function main(username) {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_SENDER,
          pass: process.env.PASSWORD_SENDER,
        },
      });

      let info = await transporter.sendMail({
        from: `"Villa Agapi Automation Service" <${process.env.EMAIL_SENDER}>`,
        to: process.env.EMAIL_SENDER,
        subject: `New Chat request`,
        html: `
                <p style="font-size: 24px;"> <b>${username}</b> is waiting for you in the chat room </p>

                <hr style = "width: 200px">
                <div style="text-align: center;">
                    <i>Villa Agapi Automation Service</i>
                </div>
                `,
      });
      return info.messageId;
    } catch (err) {
      console.log("error sending email: ", err);
      return null;
    }
  }
};
