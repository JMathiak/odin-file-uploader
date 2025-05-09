const { Router } = require("express");
const userRouter = Router();
const userController = require("../controllers/userController.js");
const { body } = require("express-validator");
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();
const passport = require("passport");
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
      }
    }),
  body("password")
    .trim()
    .isLength({ min: 8, max: 16 })
    .withMessage(
      "Password must be at least 8 characters and no longer than 16 characters"
    ),
  body("conf_password")
    .trim()
    .custom(async (conf_password, { req }) => {
      const password = req.body.password;
      if (password !== conf_password) {
        throw new Error("Passwords must be the same");
      }
    }),
  body("email")
    .trim()
    .isEmail()
    .custom(async (value) => {
      const users = await prisma.user.findMany({
        where: {
          email: {
            equals: value,
          },
        },
      });
      if (users.length > 0) {
        throw new Error("A user with the email " + value + " already exists.");
      }
    }),
];

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
}
userRouter.post("/register", [validateSignup], userController.createUser);
userRouter.get("/register", (req, res) => res.render("register"));
userRouter.get("/login", (req, res) => res.render("login"));
userRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

userRouter.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});
module.exports = userRouter;
