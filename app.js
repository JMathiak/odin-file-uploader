const express = require("express");
const path = require("node:path");
const passport = require("passport");
const expressSession = require("express-session");
var LocalStrategy = require("passport-local");
const { PrismaClient } = require("./generated/prisma/client.js");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

//require("./configurePassport.js");

//const bcrypt = require("brcryptjs");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
  expressSession({ secret: "cats", resave: false, saveUninitialized: false })
);
app.use(passport.session());

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log(username, password);
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      console.log(user);
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

const fileRouter = require("./routes/fileRoutes.js");
app.use("/file", fileRouter);

const folderRouter = require("./routes/FolderRoutes.js");
app.use("/folder", folderRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`Express is now listening on port ${PORT}`));
