const { Router } = require("express");
const userRouter = Router();
const userController = require("../controllers/userController.js");
userRouter.post("/register", userController.createTestUser);

module.exports = userRouter;
