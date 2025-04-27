const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

async function createTestUser(req, res) {
  await prisma.user.create({
    data: {
      email: "test@prisma.io",
      username: "shua",
      password: "test123",
    },
  });
  res.redirect("/");
}

module.exports = {
  createTestUser,
};
