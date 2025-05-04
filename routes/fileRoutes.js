const { Router } = require("express");
const fileRouter = Router();
const multer = require("multer");
const path = require("node:path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be stored in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/user/login");
  }
}

fileRouter.get("/upload", loggedIn, (req, res) => res.render("upload"));
fileRouter.post("/upload", upload.single("avatar"), (req, res) =>
  res.redirect("/")
);

module.exports = fileRouter;
