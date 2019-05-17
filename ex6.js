#!/usr/bin/env node

"use strict";

var util = require("util");
var path = require("path");
var http = require("http");

var express = require("express");
var sqlite3 = require("sqlite3");

let app = express(); //a handles request function. we don't have to define and handle requests anymore

// ************************************

const DB_PATH = path.join(__dirname, "my.db");
const WEB_PATH = path.join(__dirname, "web");
const HTTP_PORT = 8039;

var delay = util.promisify(setTimeout);

// define some SQLite3 database helpers
//   (comment out if sqlite3 not working for you)
var myDB = new sqlite3.Database(DB_PATH);
var SQL3 = {
  run(...args) {
    return new Promise(function c(resolve, reject) {
      myDB.run(...args, function onResult(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },
  get: util.promisify(myDB.get.bind(myDB)),
  all: util.promisify(myDB.all.bind(myDB)),
  exec: util.promisify(myDB.exec.bind(myDB))
};

var httpserv = http.createServer(app);

main();

// ************************************

function main() {
  defineRoutes();
  httpserv.listen(HTTP_PORT);
  console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}

function defineRoutes() {
  //these calls are added to an interal array, and express loops over that array to see if it can handle the response or not
  //the order that you define routes matters.
  app.get("/get-records", async function(req, res) {
    let records = await getAllRecords();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    });
    res.end(JSON.stringify(records));
  });

  app.use(function(req, res, next) {
    if (/^\/(?:index\/?)?(?:[?#].*$)?$/.test(req.url)) {
      //check if it's index
      req.url = "/index.html";
    } else if (/^\/js\/.+$/.test(req.url)) {
      //if its js we dont need to rewrite so immediately call next()
      next();
      return;
    } else if (/^\/(?:[\w\d]+)(?:[\/?#].*$)?$/.test(req.url)) {
      let [, basename] = req.url.match(/^\/([\w\d]+)(?:[\/?#].*$)?$/);
      //any other route name.html
      req.url = `${basename}.html`;
    } else {
      //finally if nothing matches respond with the 404 page.
      req.url = "/404.html";
    }
    next(); // if you dont call next it's assumed that you handled the response.
  });

  app.use(
    express.static(WEB_PATH, {
      maxAge: 100,
      setHeaders: function setHeaders(res) {
        res.setHeader("Server", "Ex6");
      }
    })
  );
}

// *************************
// NOTE: if sqlite3 is not working for you,
//   comment this version out
// *************************
async function getAllRecords() {
  var result = await SQL3.all(
    `
		SELECT
			Something.data AS "something",
			Other.data AS "other"
		FROM
			Something
			JOIN Other ON (Something.otherID = Other.id)
		ORDER BY
			Other.id DESC, Something.data
		`
  );

  return result;
}

// *************************
// NOTE: uncomment and use this version if
//   sqlite3 is not working for you
// *************************
// async function getAllRecords() {
// 	// fake DB results returned
// 	return [
// 		{ something: 53988400, other: "hello" },
// 		{ something: 342383991, other: "hello" },
// 		{ something: 7367746, other: "world" },
// 	];
// }
