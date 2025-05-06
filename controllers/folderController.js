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
        name: req.body.name,
      },
    });
    res.redirect("/");
  }
}

module.exports = {
  createFolder,
};
