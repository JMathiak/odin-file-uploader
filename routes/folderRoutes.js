const { Router } = require("express");
const folderRouter = Router();
const folderController = require("../controllers/folderController.js");
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();
const { body } = require("express-validator");
const validateName = [
  body("foldername")
    .trim()
    .custom(async (value) => {
      const folders = prisma.folder.findMany({
        where: {
          name: {
            equals: value,
          },
        },
      });
      if (folders.length > 0) {
        throw new Error("A folder with the name " + value + " already exists.");
      }
    }),
];

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/user/login");
  }
}

folderRouter.get("/create", loggedIn, (req, res) => res.render("createFolder"));
folderRouter.post("/create", [validateName], folderController.createFolder);
folderRouter.get("/", loggedIn, folderController.getFolderList);
folderRouter.post("/delete/:id", folderController.deleteFolder);
folderRouter.get("/update/:id", folderController.getEditPage);
folderRouter.post("/update/:id", folderController.postEditPage);
module.exports = folderRouter;
