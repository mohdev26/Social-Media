import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/config.service";
import { corsOptions } from "./Utils/cors/cors";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import {
  authController,
  chatController,
  notificationController,
  postController,
} from "./Modules";

import connectDB from "./DB/connection";
import { intializeFirebase } from "./Utils/firebaser/firebase.config";
import { userController } from "./Modules/User";
import { intializeSocket } from "./Utils/socket/socket.service";

const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const bootstrap = async (): Promise<void> => {
  const app: Express = express();

  app.use(helmet(), limiter, cors(corsOptions));
  app.use(express.json());

  await connectDB();
  intializeFirebase();

  app.get("/", (req: Request, res: Response) => {
    return res
      .status(200)
      .json({ message: `Welcome to ${env.APPLICATION_NAME} APP` });
  });

  app.use("/api/v1/auth", authController);
  app.use("/api/v1/post", postController);
  app.use("/api/v1/user", userController);
  app.use("/api/v1/notification", notificationController);
  app.use("/api/v1/chat", chatController);


  app.use((req: Request, res: Response): Response => {
    throw new NotFoundException("Not Found Handler!!");
  });

  app.use(globalErrorHandler);

  const httpServer = app.listen(env.PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${env.PORT}`);
  });
   intializeSocket(httpServer);
  };
