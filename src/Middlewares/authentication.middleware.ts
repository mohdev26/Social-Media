import { NextFunction, Request, Response } from "express";
import { decodedToken, TokenTypeEnum } from "../Utils/security/token";
import { RoleEnum } from "../Utils/enums/user.enum";
import { ForbiddenException } from "../Utils/response/error.response.js";

export const authentication = (
  tokenType = TokenTypeEnum.ACCESS,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { user, decoded } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    req.user = user;
    req.decoded = decoded;

    return next();
  };
};

export const authorization = (roles: RoleEnum[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenException(
        "You do not have permission to access this resource.",
      );
    }

    next();
  };
};