const supabase = require("../supabase");
const { decode } = require("base64-arraybuffer");
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

async function postImage(req, res) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "Please upload a file" });
      return;
    }
    const fileBase64 = decode(file.buffer.toString("base64"));
    let path =
      req.user.username + "/" + req.body.folder + "/" + file.originalname;
    console.log(path);
    const { data, error } = await supabase.storage
      .from("images")
      .upload(file.originalname, fileBase64, {
        contentType: "image/jpg",
      });
    if (error) {
      throw error;
    }

    const { date: image } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);
    console.log(file);
    res.status(200).json({ image: image.getPublicUrl });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

async function getUploadPage(req, res) {
  let folders = await prisma.folder.findMany({
    where: {
      ownerId: req.user.id,
    },
  });
  console.log(folders);
  res.render("upload", { folders: folders });
}

module.exports = {
  postImage,
  getUploadPage,
};
