import Mail from "nodemailer/lib/mailer";
import { BadRequestException } from "../response/error.response";

export const sendEmail = async (data:Mail.Options) : Promise<void> => {
    if (!data.html && !data.attachments?.length && !data.text) {
        throw new BadRequestException("Missing Email Content");
    }

    const transporter = createTransport({
        service: "gmail",
        auth: {
            user: env.EMAIL_USERNAME,
            pass: env.EMAIL_PASSWORD,
        },
    });
    await transporter.sendMail({
        ...data,
        from: `"Route Academy" <${env.EMAIL_USERNAME}>`,
    });
};