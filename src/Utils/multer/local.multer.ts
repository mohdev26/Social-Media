import type { Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../response/error.response";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/gif", "image/jpeg"],
  videos: ["video/mp4", "video/mpeg", "video/jpeg", "video/mj2"],
  audios: ["audio/3gpp2", "audio/aac", "audio/mp3"],
  documents: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
}: {
  customPath?: string;
  validation?: string[];
} = {}) => {
  const basePath = `uploads/${customPath}`;

  const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;

      if (req.user?._id) {
        userBasePath += `/${req.user._id}`;
      }

      const fullPath = resolve(`./src/${userBasePath}`);

      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }

      cb(null, fullPath);
    },

    filename: (req, file, cb) => {
      const uniqueFilename = `${randomUUID()}-${file.originalname}`;

      file.finalPath = `${basePath}/${req.user?._id ?? "general"}/${uniqueFilename}`;

      cb(null, uniqueFilename);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (validation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      throw new BadRequestException("Invalid File Type");
    }
  };

  return multer({ storage, fileFilter });
};
