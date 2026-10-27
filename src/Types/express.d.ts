import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "../DB/Models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
      decoded?: JwtPayload;
    }
  }
}

export {};