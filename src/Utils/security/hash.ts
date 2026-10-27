import { env } from "../../config/config.service";
import {compare, hash} from "bcrypt";

export const generateHash = async(
  plaintext: string,
  saltRounds: number = Number(env.SALT),
): Promise<string> => {
  return await hash(plaintext, saltRounds);
};


export const compareHash = async(
  plaintext: string,
  hashValue: string,
): Promise<boolean> => {
  return await compare(plaintext, hashValue);
};
