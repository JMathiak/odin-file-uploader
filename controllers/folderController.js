const { validationResult } = require("express-validator");
const { PrismaClient } = require("../generated/prisma/client.js");
const supabase = require("../supabase");
// const { createClient } = require("@supabase/supabase-js");
// const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
// const supabaseKey = process.env.SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function createFolder(req, res) {
  console.log(req, req.user.id, req.body.foldername);
  let userId = req.user.id;
  let fName = req.body.foldername;
  console.log(fName);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("here", errors);
    return res.status(400).render("failure", { errorMessage: errors.errors });
  } else {
    await prisma.folder.create({
      data: {
        ownerId: userId,
        name: req.body.foldername,
      },
    });
    res.redirect("/");
  }
}

async function getFolderList(req, res) {
  let folders = await prisma.folder.findMany({
    where: {
      ownerId: req.user.id,
    },
  });
  // [ { id: 1, ownerId: 2, name: 'Hockey' } ]
  res.render("folderlist", { folders: folders, user: req.user });
}

// async function getFolderList(req, res) {
//   const { data, error } = await supabase.storage.listBuckets();

//   console.log(data);
// }

async function deleteFolder(req, res) {
  let fId = parseInt(req.params.id);
  let folder = await prisma.folder.findFirst({
    where: {
      id: fId,
    },
  });

  const { data, error } = await supabase.storage
    .from(req.user.username)
    .list(folder.name);

  console.log(data);
  let files = data;
  for (let i = 0; i < files.length; i++) {
    let path = folder.name + "/" + files[i].name;
    const { data, error } = await supabase.storage
      .from(req.user.username)
      .remove(path);
  }

  await prisma.folder.delete({
    where: {
      id: fId,
    },
  });
  res.redirect("/folder");
}

async function getEditFolder(req, res) {
  let fId = parseInt(req.params.id);
  let folder = await prisma.folder.findFirst({
    where: {
      id: fId,
    },
  });
  res.render("editfolder", { folder: folder });
}

async function postEditFolder(req, res) {
  let fId = parseInt(req.params.id);
  let folder = await prisma.folder.findFirst({
    where: {
      id: fId,
    },
  });

  const { data, error } = await supabase.storage
    .from(req.user.username)
    .list(folder.name);

  let files = data;
  for (let i = 0; i < files.length; i++) {
    let oldPath = folder.name + "/" + files[i].name;
    let newPath = req.body.foldername + "/" + files[i].name;
    const { data, error } = await supabase.storage
      .from(req.user.username)
      .move(oldPath, newPath);
  }
  await prisma.folder.update({
    where: {
      id: fId,
    },
    data: {
      name: req.body.foldername,
    },
  });
  res.redirect("/");
}
module.exports = {
  createFolder,
  getFolderList,
  deleteFolder,
  getEditFolder,
  postEditFolder,
};
