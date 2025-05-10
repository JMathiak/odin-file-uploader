const { validationResult } = require("express-validator");
const { PrismaClient } = require("../generated/prisma/client.js");
const supabase = require("../supabase");
// const { createClient } = require("@supabase/supabase-js");
// const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
// const supabaseKey = process.env.SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function createFolder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("failure", { errorMessage: errors.errors });
  } else {
    await prisma.folder.create({
      data: {
        ownerId: req.user.id,
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
  await prisma.folder.delete({
    where: {
      id: fId,
    },
  });

  res.redirect("/folder");
}

async function getEditPage(req, res) {
  let fId = parseInt(req.params.id);
  let folder = await prisma.folder.findFirst({
    where: {
      id: fId,
    },
  });
  res.render("editfolder", { folder: folder });
}

async function postEditPage(req, res) {
  let fId = parseInt(req.params.id);
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
  getEditPage,
  postEditPage,
};
