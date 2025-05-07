const { Router } = require("express");
const fileRouter = Router();
const multer = require("multer");
//const { supabase } = require("../supabase");
const { decode } = require("base64-arraybuffer");
const path = require("node:path");
const fileController = require("../controllers/fileController.js");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Files will be stored in the 'uploads' folder
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/user/login");
  }
}

fileRouter.get("/upload", loggedIn, (req, res) => res.render("upload"));
fileRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "Please upload a file" });
      return;
    }
    const fileBase64 = decode(file.buffer.toString("base64"));
    const { data, error } = await supabase.storage
      .from("images")
      .upload(file.originalname, fileBase64, {
        contentType: "image/jpg",
      });
    if (error) {
      throw error;
    }

    const { data: image } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);
    console.log(file);
    res.status(200).json({ image: image.publicUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = fileRouter;
