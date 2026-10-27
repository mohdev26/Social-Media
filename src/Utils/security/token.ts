import { JwtPayload, Secret, SignOptions, sign, verify } from "jsonwebtoken";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import { env } from "../../config/config.service";
import {
  UnauthorizedException,
} from "../response/error.response";
import { RoleEnum } from "../enums/user.enum";

export enum TokenTypeEnum {
  ACCESS = "access",
  REFRESH = "refresh",
}

export interface ITokenPayload extends JwtPayload {
  _id: string;
  role: RoleEnum;
}

export const generateToken = ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: Secret;
  options: SignOptions;
}): string => {
  return sign(payload, secret, options);
};

export const verifyToken = ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): ITokenPayload => {
  return verify(token, secret) as ITokenPayload;
};

const getSignature = (type: TokenTypeEnum, role: RoleEnum): string => {
  const isAdmin = role === RoleEnum.ADMIN;

  if (type === TokenTypeEnum.ACCESS) {
    return isAdmin ? env.ACCESS_ADMIN_SIGNATURE : env.ACCESS_USER_SIGNATURE;
  }

  return isAdmin ? env.REFRESH_ADMIN_SIGNATURE : env.REFRESH_USER_SIGNATURE;
};

export const createLoginCredentials = (
  user: HUserDocument,
): { accessToken: string; refreshToken: string } => {
  const payload = {
    _id: user._id.toString(),
    role: user.role,
  };

  const accessToken = generateToken({
    payload,
    secret: getSignature(TokenTypeEnum.ACCESS, user.role),
    options: { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  });

  const refreshToken = generateToken({
    payload,
    secret: getSignature(TokenTypeEnum.REFRESH, user.role),
    options: { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
  });

  return { accessToken, refreshToken };
};

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  authorization?: string|undefined;
  tokenType?: TokenTypeEnum;
}): Promise<{ user: HUserDocument; decoded: ITokenPayload }> => {
  if (!authorization) {
    throw new UnauthorizedException("Missing authorization header.");
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    throw new UnauthorizedException("Invalid authorization header format.");
  }

  let decoded: ITokenPayload;

  try {
    decoded = verifyToken({
      token,
      secret: getSignature(tokenType, RoleEnum.USER),
    });
  } catch {
    try {
      decoded = verifyToken({
        token,
        secret: getSignature(tokenType, RoleEnum.ADMIN),
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired token.");
    }
  }

  if (!decoded._id || !decoded.role) {
    throw new UnauthorizedException("Invalid token payload.");
  }

  const user = await UserModel.findById(decoded._id);

  if (!user) {
    throw new UnauthorizedException("User not found.");
  }

  return { user, decoded };
};
 