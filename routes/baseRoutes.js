const { Router } = require("express");
const baseRouter = Router();

baseRouter.get("/", (req, res) => res.render("index", { user: req.user }));

module.exports = baseRouter;
