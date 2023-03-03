import express from "express";
import uniqid from "uniqid";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const authorsFilePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json"
);

const authorsRouter = express.Router();

authorsRouter.get("/", async (req, res) => {
  try {
    const fileAsBuffer = fs.readFileSync(authorsFilePath);
    const fileAsJSONArray = JSON.parse(fileAsBuffer.toString());
    res.send(fileAsJSONArray);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

authorsRouter.get("/:authorId", async (req, res) => {
  try {
    const fileAsBuffer = fs.readFileSync(authorsFilePath);
    const fileAsJSONArray = JSON.parse(fileAsBuffer.toString());
    const author = fileAsJSONArray.find(
      (author) => author._id === req.params.authorId
    );
    if (!author) {
      res.status(404).send({
        message: `Author with that id was not found! (${req.params.authorId})`,
      });
    }
    res.send(author);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

authorsRouter.post("/", async (req, res) => {
  try {
    const { name, surname, email, dob, avatar } = req.body;

    const author = {
      _id: uniqid(),
      name,
      surname,
      email,
      dob,
      avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fileAsBuffer = fs.readFileSync(authorsFilePath);
    const fileAsJSONArray = JSON.parse(fileAsBuffer.toString());
    fileAsJSONArray.push(author);
    fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
    res.send(author);
  } catch (error) {
    res.send(500).send({ message: `Nope!` });
  }
});

authorsRouter.put("/:authorId", async (req, res) => {
  try {
    const fileAsBuffer = fs.readFileSync(authorsFilePath);
    const fileAsJSONArray = JSON.parse(fileAsBuffer.toString());
    const index = fileAsJSONArray.findIndex(
      (author) => author._id === req.params.authorId
    );
    if (!index == -1) {
      res.status(404).send({
        message: `Author with that id was not found! (${req.params.authorId})`,
      });
    }
    const preEdit = fileAsJSONArray[index];
    const afterEdit = {
      ...preEdit,
      ...req.body,
      updatedAt: new Date(),
    };
    fileAsJSONArray[index] = afterEdit;

    fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
    res.send(afterEdit);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

authorsRouter.delete("/:authorId", async (req, res) => {
  try {
    const fileAsBuffer = fs.readFileSync(authorsFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const author = fileAsJSONArray.find(
      (author) => author._id === req.params.authorId
    );
    if (!author) {
      res.status(404).send({
        message: `Author with this id was not found! (${req.params.authorId})`,
      });
    }
    fileAsJSONArray = fileAsJSONArray.filter(
      (author) => author._id !== req.params.authorId
    );
    fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
    res.status(204).send();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

authorsRouter.post("/checkEmail", async (req, res) => {
  try {
    const { name, surname, email, dob, avatar } = req.body;
    const fileAsBuffer = fs.readFileSync(authorsFilePath);
    const fileAsJSONArray = JSON.parse(fileAsBuffer.toString());
    console.log(email);
    const index = fileAsJSONArray.findIndex((author) => author.email === email);
    console.log(index);
    if (index === -1) {
      const author = {
        _id: uniqid(),
        name,
        surname,
        email,
        dob,
        avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fileAsJSONArray.push(author);
      fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
      res.send(author);
    } else {
      res.status(404).send({ message: `Matching email found!` });
    }
  } catch (error) {
    res.status(500).send({ message: `Nope!` });
  }
});
export default authorsRouter;
