import crypto from "node:crypto";
import {env} from "../../config/config.service.js";

const IV_LENGYH = 16;
const ENCRYPTION_KEY: Buffer = Buffer.from(env.ENCRYPTION_SECRET_KEY,"utf-8");

export const encrypt = (text: string): string => {
    const iv: Buffer =crypto.randomBytes(IV_LENGYH);

    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

    let encryptedData:string = cipher.update(text, "utf-8", "hex")
     encryptedData += cipher.final("hex");

     return `${iv.toString("hex")}:${encryptedData}`;
};


export const decrypt = (encryptedData: string): string => {
    const [ivHex, encrptedText] = encryptedData.split(":");

    if (!ivHex || !encrptedText) {
        throw new Error("Invalid encrypted data format");
    }

    const iv: Buffer = Buffer.from(ivHex, "hex");

    const decipher = crypto.createCipheriv("aes-256-cbc",ENCRYPTION_KEY,iv);

    let decryptedData: string = decipher.update(encrptedText, "hex", "utf-8");
     decryptedData += decipher.final("utf8");

    return decryptedData;

};