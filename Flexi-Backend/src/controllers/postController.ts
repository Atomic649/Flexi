import { MediaType, PrismaClient } from "@prisma/client";
import Joi from "joi";
import { Request, Response } from "express";

//Create  instance of PrismaClient
const prisma = new PrismaClient();

// Interface for request body from client
interface PostInput {
  id?: number;
  createdAt?: Date;
  hashtag?: string[] | undefined;
  content: string;
  published: boolean;
  authorId: number;
}

// validate the request body
const schema = Joi.object({
  hashtag:  Joi.array().items(Joi.string()).optional(),
  content: Joi.string().required(),
  published: Joi.boolean().required(),
  authorId: Joi.number().required(),
 
});

// Create Post
export const createPost = async (req: Request, res: Response) => {
  const postInput: PostInput = req.body;
  const { error } = schema.validate(postInput);

 // console.log(postInput);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // convert authorId to integer
  postInput.authorId = parseInt(postInput.authorId.toString());
  // convert published to boolean
  postInput.published = Boolean(postInput.published);
  // convert createdAt to Date
  postInput.createdAt = new Date();
  // convert content to string
  postInput.content = postInput.content.toString();

  try {
    const post = await prisma.post.create({
      data: {
        hashtag: postInput.hashtag,
        content: postInput.content,
        published: postInput.published,
        authorId: postInput.authorId,
        
        
      },
    });
    return res.json({ status: "ok",
       post });
      
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Get all Posts by AuthorId 
export const getPostsByAuthorId = async (req: Request, res: Response) => {
  const authorId = parseInt(req.params.authorId);

  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: authorId,
      },
      orderBy: {
        createdAt: "desc",
      },
      
      take: 20, // Limit the number of posts to retrieve

      select: {     
        id: true,   
        createdAt: true,
        hashtag: true,
        content: true,
        published: true,
        comments: true,
        reactions: true,
        authorId: true,
        mediaType: true,        
      },
    });
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};