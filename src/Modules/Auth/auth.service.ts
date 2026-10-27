import { Request, Response } from "express";
import { IConfirmEmailDTO, ILoginDTO, ISignUpDTO } from "./auth.dto";
import { UserModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { generateOTP } from "../../Utils/generateOTP";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { emailEvents } from "../../Utils/events/email.events";
import { createLoginCredentials } from "../../Utils/security/token";

class AuthService {
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, username }: ISignUpDTO = req.body;

    const checkUserExists = await UserModel.findOne({ email }).select("email");

    if (checkUserExists) throw new ConflictException("User already exists");

    const otp = generateOTP();
    const [user] = await UserModel.create(
      [
        {
          username,
          email,
          password: await generateHash(password),
          confirmEmailOTP: await generateHash(otp),
        },
      ],
      { validateBeforeSave: true },
    );
    emailEvents.emit("confrimEmail", {
      to: email,
      username,
      otp,
    });
    return res.status(201).json({ message: "Done", user });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const user = await UserModel.findOne({
      email,
      confirmEmailOTP: { $exists: true },
      confirmedAt: { $exists: false },
    });

    if (!user || !user.confirmEmailOTP)
      throw new NotFoundException("Invalid Account");
    if (!(await compareHash(otp, user.confirmEmailOTP)))
      throw new BadRequestException("Invalid OTP");

    await UserModel.updateOne(
      {
        email,
      },
      {
        confirmedAt: new Date(),
        $unset: { confirmEmailOTP: true },
        $inc: { _v: 1 },
      },
    );

    return res.status(200).json({ message: "User confirmed successfully" });
  };

login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: ILoginDTO = req.body;

    const user = await UserModel.findOne({
      email,
          });

    if (!user ) throw new NotFoundException("Invalid Account");
    if (!(await compareHash(password, user.password)))
      throw new BadRequestException("Invalid Password");

    const credentiols = createLoginCredentials(user);
    return res.status(200).json({ message: "Done", credentiols });
  };
}

export default new AuthService();
