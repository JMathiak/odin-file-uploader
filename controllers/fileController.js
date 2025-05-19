const supabase = require("../supabase");
const { decode } = require("base64-arraybuffer");
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();
const request = require("superagent");

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

async function getDetails(req, res) {
  let folderID = parseInt(req.params.folderId);
  let fileID = req.params.fileId;

  let folder = await prisma.folder.findFirst({
    where: {
      id: folderID,
    },
  });

  const { data, error } = await supabase.storage
    .from(req.user.username)
    .list(folder.name);

  const file = data.filter((file) => file.id === fileID);

  res.render("fileDetails", { file: file[0], folder: folderID });
}

async function downloadFile(req, res) {
  let folderID = parseInt(req.params.folderId);
  let fileID = req.params.fileId;
  let file = await prisma.file.findFirst({
    where: {
      id: fileID,
    },
  });
  console.log(file);
  const { data } = supabase.storage
    .from(req.user.username)
    .getPublicUrl(file.path, {
      download: true,
    });

  console.log(data);
  res.set("Content-disposition", `attachment; filename=${file.name}`);
  request(data.publicUrl).pipe(res);
}

module.exports = {
  postImage,
  getUploadPage,
  getDetails,
  downloadFile,
};
