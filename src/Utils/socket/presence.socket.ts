import { Server } from "socket.io";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import {
  addConnection,
  getOnlineUserOnline,
  removeConnection,
} from "./connected.users";
import { AuthedSocket } from "./socket.service";
import { handleEvent } from "./socket.helper";
import { emptySchema } from "../../Modules/chat/chat.validation";
import { ZodType } from "zod";

const getOnlineFriendsIds = (user: HUserDocument): string[] => {
  const onlineIds = getOnlineUserOnline();

  return (user.friends ?? [])
    .map((friendId) => friendId.toString())
    .filter((friendId) => onlineIds.includes(friendId));
};

const notifyFriends = (
  io: Server,
  user: HUserDocument,
  event: string,
  payload: Record<string, unknown>,
): void => {
  (user.friends ?? []).forEach((friendId) => {
    io.to(friendId.toString()).emit(event, payload);
  });
};

export const registerPresenceEvent = (
  io: Server,
  socket: AuthedSocket,
): void => {
  const user = socket.user!;
  const userId = user?._id.toString();
  const isFirstDevice = addConnection(userId, socket.id);
  if (isFirstDevice) {
    notifyFriends(io, user, "userOnline", {
      userId,
      firstName: user?.firstName,
      lastName: user?.lastName,
    });
  }

  socket.emit("onlineFriends", {friend: getOnlineFriendsIds});

  socket.on(
    "getOnlineFriends",
  handleEvent(socket, "getOnlineFriendsIds", emptySchema as ZodType, () => {
    socket.emit("onlineFriends",{ friend: getOnlineFriendsIds});
  }),
);

  socket.on("disconnect", async () => {
    console.log(`[Socket] disconnected: ${user.firstName} (${socket.id})`);
    const islastDevice = removeConnection(userId, socket.id);
    if (!islastDevice) return;
    const lastSeen = new Date();
    await UserModel.updateOne({ _id: userId }, { lastSeen });

    notifyFriends(io, user, "useroffline", { userId, lastSeen }); 
  });
};
