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

async function getFolderList(req, res) {
  let folders = await prisma.folder.findMany({
    where: {
      ownerId: req.user.id,
    },
  });
  // [ { id: 1, ownerId: 2, name: 'Hockey' } ]
  res.render("folderlist", { folders: folders, user: req.user });
}

async function deleteFolder(req, res) {
  let fId = parseInt(req.params.id);
  await prisma.folder.delete({
    where: {
      id: fId,
    },
  });

  res.redirect("/folder");
}
module.exports = {
  createFolder,
  getFolderList,
  deleteFolder,
};
