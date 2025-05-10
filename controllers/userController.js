const { validationResult } = require("express-validator");
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const supabase = require("../supabase.js");

async function createUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.errors);
    return res.status(400).render("failure", { errorMessage: errors.errors });
  } else {
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    await prisma.user.create({
      data: {
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
      },
    });
    const { data, error } = await supabase.storage.createBucket(
      req.body.username,
      {
        public: true,
        allowedMimeTypes: [""],
        fileSizeLimit: 1024,
      }
    );
    res.redirect("/");
  }
}

async function userLogIn(req, res) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
  });
}

module.exports = {
  createUser,
  userLogIn,
};
