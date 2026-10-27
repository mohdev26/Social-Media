import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer";
import postService from "./post.service";
import * as validators from "./post.validation";
import { Router } from "express";

const router = Router();

router.use(authentication());
router.post(
  "/",
  localFileUpload({
    validation: fileValidation.images,
    customPath: "posts",
  }).array("attachments", 20),
  validation(validators.createPostSchema),
  postService.createPost,
);

router.get(
  "/:postId",
  validation(validators.postIdParamsSchema),
  postService.getSpecificPost,
);

router.patch(
  "/:postId/like",
  validation(validators.postIdParamsSchema),
  postService.toggleLikePost,
);

router.patch(
  "/:postId/update",
  validation(validators.postIdParamsSchema),
  postService.toggleLikePost,
);

router.delete(
  "/:postId/delete",
  validation(validators.postIdParamsSchema),
  postService.deletePost,
);

router.post(
  "/:post/comment",
  validation(validators.creatCommentSchema),
  postService.creatComments,
);

router.post(
  "/:comment/:commentId",
  validation(validators.updateCommentSchema),
  postService.updateComment,
);

router.delete(
  "/:comment/:commentId",
validation(validators.CommentIdParamsSchema),
  postService.deleteComment,
);

export default router;
