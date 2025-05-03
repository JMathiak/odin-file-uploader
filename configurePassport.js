var passport = require("passport");
var LocalStrategy = require("passport-local");
const { PrismaClient } = require("./generated/prisma/client.js");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            username: username,
          },
        });
        if (!user) {
          return done(null, false, { message: "Incorrect username " });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
