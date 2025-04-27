const { Router } = require("express");
const baseRouter = Router();

baseRouter.get("/", (req, res) => res.render("index"));

module.exports = baseRouter;
