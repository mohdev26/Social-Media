import { Request, Response } from "express";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import {
  ICommentIdParamsDTO,
  ICreateCommentDTO,
  ICreatePostDTO,
  IPostIParamdDTO,
  IUpdateCommentDTO,
  IUpdatePostDTO,
} from "./post.dto";
import { PostModel } from "../../DB/Models/post.model";
import { CommentModel } from "../../DB/Models/comment.model copy";
import { notificationEvent } from "../../Utils/events/notification.event";
import { Types } from "mongoose";

class PostService {
  constructor() {}

  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content }: ICreatePostDTO = req.body;
    const file = req.files as Express.Multer.File[] | undefined;

    if (!content && !file?.length)
      throw new BadRequestException("post must have content or attachments");

    const post = await PostModel.create({
      ...(content && { content }),
      ...(file?.length && {
        attachments: file.map((file) => file.path),
      }),
      createdBy: req.user!._id,
    });

    return res
      .status(201)
      .json({ message: "post created Successfully", data: { post } });
  };

  getSpecificPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIParamdDTO = req.params as { postId: string };
    const post = await PostModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    }).populate("createdBy", "firstName lastName, email-_id");
    if (!post) throw new NotFoundException("post not found");

    return res.status(200).json({ message: "Post found", data: { post } });
  };

  toggleLikePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIParamdDTO = req.params as { postId: string };
    const userId = req.user!._id;

    const post = await PostModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException("post not found");
    const alreadyLiked = post.likes?.some((id) => id.equals(userId));
    const update = await PostModel.findByIdAndUpdate(
      postId,
      alreadyLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!alreadyLiked) {
      notificationEvent.emit("postLike", {
        to: post.createdBy,
        sender: req.user!,
        postId: post._id,
      });
    }

    return res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      data: { update },
    });
  };

  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIParamdDTO = req.params as { postId: string };
    const { content }: IUpdatePostDTO = req.body;

    const post = await PostModel.findOneAndUpdate(
      { _id: postId, createdBy: req.user!._id },
      { content, $inc: { __v: 1 } },
      { new: true },
    );

    if (!post) throw new ForbiddenException("post not found");

    return res.status(200).json({
      message: "Post updated successfully",
      data: { post },
    });
  };

  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIParamdDTO = req.params as { postId: string };

    const post = await PostModel.findByIdAndDelete({
      _id: postId,
      createdBy: req.user!._id,
    });

    if (!post) throw new ForbiddenException("post not found");

    return res.status(200).json({
      message: "Post Deleted successfully",
      data: { post },
    });
  };

  creatComments = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIParamdDTO = req.params as { postId: string };
    const { content, parentId }: ICreateCommentDTO = req.body;

    const post = await PostModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException("Post Not Found");

    let parentAuthor: Types.ObjectId | undefined;
    if (parentId) {
      const parent = await CommentModel.findOne({ _id: parentId, postId });
      if (!parent) throw new NotFoundException("Parent Comment not exists");
      parentAuthor = parent.createdBy;
    }
    const comment = await CommentModel.create({
      postId,
      ...(parentId && { parentId }),
      content,
      createdBy: req.user!._id,
    });
    if (parentAuthor) {
      notificationEvent.emit("commentReply", {
        to: parentAuthor,
        sender: req.user!,
        postId: post._id,
        commentId: comment._id,
        content,
      });
    }else{
       notificationEvent.emit("postComment", {
        to: post.createdBy,
        sender: req.user!,
        postId: post._id,
        commentId: comment._id,
        content,
      });
    }
    return res.status(201).json({
      message: "Comment Created successfully",
      data: { comment },
    });
  };

  updateComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: ICommentIdParamsDTO = req.params as {
      commentId: string;
    };
    const { content }: IUpdateCommentDTO = req.body;
    const comment = await CommentModel.findOneAndUpdate(
      {
        _id: commentId,
        createdBy: req.user!._id,
      },
      { content },
      { new: true },
    );
    if (!comment)
      throw new ForbiddenException(
        "Comment not found or you are not the author",
      );

    return res.status(200).json({
      message: "Comment Created successfully",
      data: { comment },
    });
  };

  deleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: ICommentIdParamsDTO = req.params as {
      commentId: string;
    };
    const comment = await CommentModel.findById(commentId);
    if (!comment) throw new NotFoundException("Comment Not Found");

    const post = await PostModel.findById(comment.postId);
    const isCommentAuthor = comment.createdBy.equals(req.user!._id);
    const isPostOwner = post?.createdBy.equals(req.user!._id);

    if (!isCommentAuthor && !isPostOwner)
      throw new ForbiddenException(" not authorized to delete comment");
    await Promise.all([
      CommentModel.deleteOne({ _id: commentId }),
      CommentModel.deleteMany({ parentId: commentId }),
    ]);

    return res.status(200).json({
      message: "Comment deleted successfully",
      data: { comment },
    });
  };
}

export default new PostService();
