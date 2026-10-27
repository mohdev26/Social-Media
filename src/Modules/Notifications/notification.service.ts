import { Request, Response } from "express-serve-static-core";
import {
  IDeviceTokenDTO,
  IListNotificationDTO,
  INotificationParamsDTO,
} from "./notification.dto";
import { UserModel } from "../../DB/Models/user.model";
import { NotificationModel } from "../../DB/Models/notification.model";
import { NotFoundException } from "../../Utils/response/error.response";

class NotificationService {
  deviceToken = async (req: Request, res: Response) => {
    const { token }: IDeviceTokenDTO = req.body;
    await UserModel.updateOne(
      { _id: req.user!._id },
      { $addToSet: { deviceTokens: token } },
    );
    return res.status(200).json({ message: "Device Registerad Successefully" });
  };

  removeDeviceToken = async (req: Request, res: Response) => {
    const { token }: IDeviceTokenDTO = req.body;

    await UserModel.updateOne(
      { _id: req.user!._id },
      { $pull: { deviceTokens: token } },
    );
    return res.status(200).json({ message: "Device Registerad Successefully" });
  };
  listAllNotification = async (req: Request, res: Response) => {
    const { page, limit, unreadOnly }: IListNotificationDTO =
      req.query as unknown as {
        page: number;
        limit: number;
        unreadOnly: boolean;
      };

    const skip = (page - 1) * limit;

    const filter = {
      userId: req.user!._id,
      ...(unreadOnly && { readAt: { $exists: false } }),
    };

    const [notiification, total, unread] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(filter),
      NotificationModel.countDocuments({
        userId: req.user!._id,
        readAt: { $exists: false },
      }),
    ]);
    return res.status(200).json({
      message: "Done",
      data: {
        notiification,
        unread,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  };

  unreadCount = async (req: Request, res: Response) => {
    const unread = await NotificationModel.countDocuments({
      userId: req.user!._id,
      readAt: { $exists: false },
    });

    return res.status(200).json({
      message: "Done",
      data: { unread },
    });
  };

  markAsRread = async (req: Request, res: Response) => {
    const { notificationId }: INotificationParamsDTO = req.params as {
      notificationId: string;
    };

    const notification = await NotificationModel.findByIdAndUpdate(
      {
        _id: notificationId,
        userId: req.user!._id,
      },
      { readAt: new Date() },
      { new: true },
    );
    if(!notification) throw new NotFoundException("Notification Not Found")

    return res.status(200).json({
      message: "Done",
      data: { notification },
    });
  };

  markAllAsRread = async (req: Request, res: Response) => {
    await NotificationModel.updateMany(

      {
        userId: req.user!._id,
        readAt:{$exists:false}
      },
      { readAt: new Date() },
    );

    return res.status(200).json({
      message: "All Notification marked as read",
    });
  };

   deleteNotification = async (req: Request, res: Response) => {
    const { notificationId }: INotificationParamsDTO = req.params as {
      notificationId: string;
    };
    const deleted = await NotificationModel.findOneAndDelete({
        _id: notificationId,
        userId: req.user!._id,
      });
      if(!deleted) throw new NotFoundException("Notification Not Found")
    
    return res.status(200).json({
      message: " Notification deleted",
    });
  };
   
   clearAll = async (req: Request, res: Response) => {
    
     await NotificationModel.deleteMany({
        userId: req.user!._id,
      });
    
    return res.status(200).json({
      message: "  All Notification deleted",
    });
  };
}

export default new NotificationService();
