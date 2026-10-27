import { Request, Response } from "express";
import { IRequestIdParamsDTO, IUserIdParamsDTO } from "./user.dto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { UserModel } from "../../DB/Models/user.model";
import { FriendRequestModel } from "../../DB/Models/friendRequst.model.ts";
import { notificationEvent } from "../../Utils/events/notification.event";

class UserService {
  constructor() {}
  sendFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const senderId = req.user!._id;

    if (userId === senderId.toString())
      throw new BadRequestException("you cant add yourself");

    const target = await UserModel.findById({ userId });
    if (!target) throw new NotFoundException("User Not Found");
    if (
      target.blockedUsers?.some((id) => id.equals(senderId)) ||
      req.user!.blockedUsers?.some((id) => id.equals(target._id))
    )
      throw new ForbiddenException("Cannot send requst to this user");

    if (target.friends?.some((id) => id.equals(senderId)))
      throw new ConflictException("you are already friends");

    const existing = await FriendRequestModel.findOne({
      $or: [
        { sendBy: senderId, sendTo: userId },
        { sendBy: userId, sendTo: senderId },
      ],
    });
    if (existing) throw new ConflictException("Friend Requset already exists");
    const friendRequest = await FriendRequestModel.create({
      sendBy: senderId,
      sendTo: userId,
    });

    notificationEvent.emit("friendRequest", {
      to: target._id,
      sendBy: req.user!,
      requstId: friendRequest._id,
    });
    return res
      .status(201)
      .json({ message: "Friend Request sent", data: { friendRequest } });
  };

  listFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const friendRequest = await FriendRequestModel.find({
      sendeTo: req.user!._id,
    })
      .populate("sendBy", "firstName lastName email -_id")
      .lean();

    return res
      .status(200)
      .json({ message: "Friend Request sent", data: { friendRequest } });
  };

  acceptFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDTO = req.params as {
      requestId: string;
    };
    const friendRequest = await FriendRequestModel.findOne({
      _id: requestId,
      sendTo: req.user!._id,
    });
    if (!friendRequest) throw new NotFoundException("Friend Request not found");

    await Promise.all([
      UserModel.updateOne(
        { _id: friendRequest.sendBy },
        { $addToSet: { friends: friendRequest.sendTo } },
      ),
      UserModel.updateOne(
        { _id: friendRequest.sendTo },
        { $addToSet: { friends: friendRequest.sendBy } },
      ),
    ]);
    await FriendRequestModel.deleteOne({ _d: requestId });

    notificationEvent.emit("friendAccepted", {
      to: friendRequest.sendBy,
      sendBy: req.user!,
    });

    return res.status(200).json({ message: "FDOne", data: { friendRequest } });
  };

  rejectFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDTO = req.params as {
      requestId: string;
    };
    const friendRequest = await FriendRequestModel.findByIdAndDelete({
      _id: requestId,
      $or: [{ sendTo: req.user!._id }, { sendBy: req.user!._id }],
    });
    if (!friendRequest) throw new NotFoundException("Friend Request not found");

    return res.status(200).json({ message: "Frien Request removed" });
  };

  removeFriend = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const myId = req.user!._id;
    await Promise.all([
      UserModel.updateOne({ _id: myId }, { $pull: { friends: userId } }),
      UserModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
    ]);

    return res.status(200).json({ message: "Friend removed successfuly" });
  };

  blockUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const myId = req.user!._id;

    if (userId === myId.toString())
      throw new BadRequestException("You cannot block yourself");

    const target = await UserModel.findById(userId);
    if (!target) throw new NotFoundException("User Not Found");
    await Promise.all([
      UserModel.updateOne(
        { _id: myId },
        { $addToSet: { blockedUsers: userId }, $pull: { friends: userId } },
      ),
      UserModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
      FriendRequestModel.deleteMany({
        $or: [
          { sendBy: myId, sendTo: userId },
          { sendBy: userId, sendTo: myId },
        ],
      }),
    ]);

    return res.status(200).json({ message: "User Blocked successfuly" });
  };

  unBlockUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdParamsDTO = req.params as { userId: string };
    const update = await UserModel.updateOne(
      { _id: req.user!._id },
      { $pull: { blockedUsers: userId } },
    );
    if (!update)
      throw new BadRequestException("User Not Found or invalid unblock user");

    return res.status(200).json({ message: "User unbBlocked successfuly" });
  };
}
export default new UserService();
