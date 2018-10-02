import autoprefixer from "autoprefixer";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import postcssMiddleware from "postcss-middleware";
import sassMiddleware from "node-sass-middleware";
import winston from "winston";
import rankingController from "./controllers/ranking";

import appRoutes from "./routes";
require("./models/interaction");
require("./models/user");
require("./models/ranking");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      colorize: true,
      timestamp: `${new Date().toLocaleDateString()} [${new Date().toLocaleTimeString()}]`
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error"
    }),
    new winston.transports.File({
      filename: "combined.log"
    })
  ]
});

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

mongoose.connect(process.env.MONGODB_URI);
mongoose.set("useCreateIndexes", true);

const port = process.env.PORT;
const app = express();

const CronJob = require("cron").CronJob;
new CronJob(
  // "* * 12 * * *",
  "10 * * * * *",
  () => {
    rankingController.generateRanking();
  },
  null,
  true,
  "America/Sao_Paulo"
);

app.set("view engine", "pug");

app.use(
  sassMiddleware({
    src: path.join(__dirname, "stylesheets"),
    dest: path.join(__dirname, "public"),
    debug: true,
    outputStyle: "compressed"
  })
);
app.use(
  postcssMiddleware({
    src: req => path.join("./", req.path),
    plugins: [
      autoprefixer({
        browsers: ["> 1%", "IE 7"],
        cascade: false
      })
    ]
  })
);
app.use(express.static("public"));
app.use("/", appRoutes);

app.listen(port, () => console.info(`Listening on port ${port}`));
