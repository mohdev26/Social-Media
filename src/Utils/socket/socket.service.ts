import { Server, Socket } from "socket.io";
import { HUserDocument } from "../../DB/Models/user.model";
import { Server as HttpServer } from "node:http";
import { decodedToken } from "../security/token";
import { registerPresenceEvent } from "./presence.socket";
import { registerChatEvents } from "./chat.socket";

export interface AuthedSocket extends Socket {
  user?: HUserDocument;
}

let io: Server | null = null;

export const getIo = (): Server | null => io;

export const intializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket: AuthedSocket, next) => {
    try {
      const authorization = socket.handshake.auth?.token as string | undefined;

      const { user } = await decodedToken({ authorization });

      socket.user = user;

      next();
    } catch (error) {
      next(new Error((error as Error).message) || " unauthorized socket");
    }
  });
  io.on("connection", (socket: AuthedSocket) => {
    const user = socket.user;
    const userId = user?._id.toString() as string;

    console.log(`Socket connected: ${user?.firstName} (${socket.id})`);

    socket.join(userId);

    registerPresenceEvent(io!, socket);
    registerChatEvents(io!, socket);
  });

  console.log("[Socket] Socket.Io Server is ready");
  return io;
};
