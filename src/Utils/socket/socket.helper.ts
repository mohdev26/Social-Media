import { Socket } from "socket.io";
import { ZodType } from "zod";

export const handleEvent = (
  socket: Socket,
  event: string,
  schema: ZodType,
  callback: (data: any) => void | Promise<void>,
) => {
  return async (data: unknown) => {
    try {
      const validatedData = schema.parse(data);
      await callback(validatedData);
    } catch (error) {
      socket.emit(`${event}Error`, {
        message: (error as Error).message || "Something went wrong",
      });
    }
  };
};