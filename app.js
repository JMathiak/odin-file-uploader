const express = require("express");
const path = require("node:path");
const passport = require("passport");
const session = require("express-session");
var LocalStrategy = require("passport-local");
const { PrismaClient } = require("./generated/prisma/client.js");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
//require("./configurePassport.js");

//const bcrypt = require("brcryptjs");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log(username, password);
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      console.log(user[0]);
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

const baseRouter = require("./routes/baseRoutes.js");
app.use("/", baseRouter);

const userRouter = require("./routes/userRoutes.js");
app.use("/user", userRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`Express is now listening on port ${PORT}`));
