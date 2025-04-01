import { MediaType, PrismaClient } from "@prisma/client";
import Joi from "joi";
import { Request, Response } from "express";

//Create  instance of PrismaClient
const prisma = new PrismaClient();

interface CommentInput {
  id?: number;
  createdAt?: Date;
  content: string;
  userId: number;
  postId: number;
}

// validate the request body
const schema = Joi.object({
  content: Joi.string().required(),
  userId: Joi.number().required(),
  postId : Joi.number().required()
  
});



// Create Comment for a post by authorId
export const createComment = async (req: Request, res: Response) => {
  const { content, userId, postId } = req.body as CommentInput;


  const { error } = schema.validate({ content, userId, postId });
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // Convert type of userId and postId to number
  const userIdNumber = Number(userId);
  const postIdNumber = Number(postId);
  // convert content to string
  const contentString = String(content);

  try {
    const newComment = await prisma.comment.create({
      data: {
        content: contentString,
        userId: userIdNumber,
        postId: postIdNumber,
      },
    });
    res.json({status : "ok", message: "Comment created successfully", data:
      newComment});
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create comment" });
  }}

    // Get all comments by postId
export const getComments = async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: Number(postId),
      },
    });
    res.json(comments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to retrieve comments" });
  }
}