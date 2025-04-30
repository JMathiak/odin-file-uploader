const { Router } = require("express");
const userRouter = Router();
const userController = require("../controllers/userController.js");
const { body } = require("express-validator");
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 4, max: 16 })
    .withMessage(
      "Username must be at least 4 characters and no longer than 16 characters"
    )
    .custom(async (value) => {
      const users = await prisma.user.findMany({
        where: {
          username: {
            equals: value,
          },
        },
      });
      if (users.length > 0) {
        throw new Error(
          "A user with the username " + value + " already exists."
        );
        console.log(users);
      }
    }),
];

userRouter.post("/register", userController.createTestUser);
module.exports = userRouter;
