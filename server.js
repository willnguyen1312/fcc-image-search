const koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const cors = require("@koa/cors");
const util = require("util");
const bodyParser = require("koa-bodyparser");
const helmet = require("koa-helmet");
const respond = require("koa-respond");
const compress = require("koa-compress");
const mongoose = require("mongoose");
const Bing = require("node-bing-api")({
  accKey: "965960131b1d4976b1df0070eb51de39"
});

// MONGOOSE CONNECT
// ===========================================================================
if (process.env.NODE_ENV === "production") {
  // mongoose.connect("mongodb://admin:admin@ds129143.mlab.com:29143/milktea");
} else {
  mongoose.connect("mongodb://localhost:27017/searchTerm");
}

const SearchQueryModel = require("./models/searchTerm");

const app = new koa();
const router = new Router();

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(logger());
}

app.use(cors());
app.use(compress());
app.use(
  bodyParser({
    enableTypes: ["json"],
    jsonLimit: "5mb",
    strict: true,
    onerror: function(err, ctx) {
      ctx.throw("body parse error", 422);
    }
  })
);

app.use(respond());

// API routes

// New search
router.get("/api/imagesearch/:searchQuery", async ctx => {
  const { searchQuery } = ctx.params;
  const { query } = ctx.request;

  const data = new SearchQueryModel({
    searchQuery,
    searchDate: new Date()
  });

  await data.save(err => {
    if (err) {
      ctx.body = err;
      return;
    }
  });

  let result;

  return new Promise((resolve, reject) => {
    Bing.images(
      searchQuery,
      {
        top: 10
      },
      (err, result, body) => {
        ctx.body = body.value;
        resolve();
      }
    );
  });
});

// Get recent search
router.get("/api/recentsearchs", async ctx => {
  const data = await SearchQueryModel.findOne({});
  ctx.body = data;
});

router.get("/*", ctx => {
  ctx.body = `Sorry, please modify the url to get your yummy result :)`;
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
