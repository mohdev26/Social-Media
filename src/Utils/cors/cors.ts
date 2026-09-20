import { CorsOptions } from "cors";
import { env } from "../../config/config.service";

const whiteList: string[] = env.WHITELIST.split(",");

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (whiteList.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not Allowed By CORS"));
  },
};
