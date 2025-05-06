const { validationResult } = require("express-validator");
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

async function createFolder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("failure", { errorMessage: errors.errors });
  } else {
    await prisma.folder.create({
      data: {
        ownerId: req.user.id,
        name: req.body.foldername,
      },
    });
    res.redirect("/");
  }
}

async function getFileList(req, res) {
  let folders = await prisma.folder.findMany();
  res.render("f");
}
module.exports = {
  createFolder,
  getFileList,
};
