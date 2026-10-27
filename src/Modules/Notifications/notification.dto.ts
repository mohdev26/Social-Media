 import { z } from "zod";
import { deviceTokenSchema, listnotificationSchma, notificationParamSchema } from "./notifications.validation";

export type IDeviceTokenDTO = z.infer<typeof deviceTokenSchema.body>;
export type IListNotificationDTO = z.infer<typeof listnotificationSchma.query>;
export type INotificationParamsDTO = z.infer<typeof notificationParamSchema.params>;


