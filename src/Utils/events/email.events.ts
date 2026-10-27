import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "../email/send.email";
import { template } from "../email/verify.email.template";

export const emailEvents = new EventEmitter();

interface IEmail extends Mail.Options {
    otp: string;
    username: string;
}

emailEvents.on("confrimEmail",async (data: IEmail)=> {
    try{
        data.subject = "Confrim Your Email";
        data.html = template(data.otp, data.username, data.subject);
        await sendEmail(data);
    } catch (error) {
        console.error("Fail to send email", error);
    }
});