const express = require("express");
const path = require("node:path");
//const bcrypt = require("brcryptjs");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const baseRouter = require("./routes/baseRoutes.js");
app.use("/", baseRouter);

const userRouter = require("./routes/userRoutes.js");
app.use("/user", userRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`Express is now listening on port ${PORT}`));
