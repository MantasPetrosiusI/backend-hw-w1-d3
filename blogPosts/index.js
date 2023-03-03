import express from "express";
import fs from "fs";
import uniqid from "uniqid";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { blogPostSchema } from "./validation.js";

const blogPostsFilePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const blogPostsRouter = express.Router();

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogPostsFilePath);
    const fileAsJSON = JSON.parse(fileAsBuffer.toString());
    if (req.query && req.query.title) {
      const foundBlogPosts = fileAsJSON.filter(
        (blogPost) => blogPost.title === req.query.title
      );
      res.send(foundBlogPosts);
    } else {
      res.send(fileAsJSON);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogPostsFilePath);
    const fileAsJSON = JSON.parse(fileAsBuffer.toString());
    const author = fileAsJSON.find(
      (singleAuthor) => singleAuthor.id === req.params.blogPostId
    );
    if (!author) {
      res.status(404).send({ message: `It's 404 you know what it means :)` });
    }
    res.send(author);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

blogPostsRouter.post("/", async (req, res, next) => {
  try {
    const { error } = blogPostSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const blogPost = {
      id: uniqid(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fileAsBuffer = fs.readFileSync(blogPostsFilePath);
    const fileAsJSON = JSON.parse(fileAsBuffer.toString());
    fileAsJSON.push(blogPost);
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(fileAsJSON));
    res.status(201).send(blogPost);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogPostsFilePath);
    const fileAsJSON = JSON.parse(fileAsBuffer.toString());

    const index = fileAsJSON.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (!index == -1) {
      res.status(404).send({ message: `It's 404 you know what it means X)` });
    }
    const preEdit = fileAsJSON[index];
    const afterEdit = {
      ...preEdit,
      ...req.body,
      updatedAt: new Date(),
    };
    fileAsJSON[index] = afterEdit;
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(fileAsJSON));
    res.status(202).send(afterEdit);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogPostsFilePath);
    const fileAsJSON = JSON.parse(fileAsBuffer.toString());

    const blogPost = fileAsJSON.find(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (!blogPost) {
      res.status(404).send({ message: `It's 404 you know what it means :/` });
    }

    fileAsJSON = fileAsJSON.filter(
      (blogPost) => blogPost.id === req.params.authorId
    );
    fs.writeFileSync(blogPostsFilePath, JSON.stringify(fileAsJSON));
    res.status(204).send(fileAsJSON);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
export default blogPostsRouter;
