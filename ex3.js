#!/usr/bin/env node
"use strict";
const path = require("path");
const fs = require("fs");
const util = require("util");
const Transform = require("stream").Transform;
const zlib = require("zlib"); //

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "uncompress"],
  string: ["file"]
});

let BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

let OUTPATH = path.join(BASE_PATH, "out.txt");

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin);
} else if (args.file) {
  let stream = fs.createReadStream(path.join(BASE_PATH, args.file));
  processFile(stream);
} else {
  error("Incorrect Usage!", true);
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

function processFile(inStream) {
  let outStream = inStream;
  if (args.uncompress) {
    let gunzipStream = zlib.createGunzip();
    outStream = outStream.pipe(gunzipStream);
  }

  let upperStream = new Transform({
    transform(chunk, encoding, cb) {
      this.push(chunk.toString().toUpperCase());

      cb();
    }
  });
  outStream = outStream.pipe(upperStream);
  if (args.compress) {
    let gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUTPATH = `${OUTPATH}.gz`;
  }
  let targetStream;

  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTPATH);
  }
  outStream.pipe(targetStream);
}

function printHelp() {
  console.log("ex2 usage:");
  console.log("   ex2.js --file={FILENAME}");
  console.log("");
  console.log("--help                    print this help");
  console.log("--file={FILENAME}         process the file");
  console.log("--in, -                   process stdin");
  console.log("--out                     print to stdout");
  console.log("--compress                gzip the output");
  console.log("--uncompress              un-gzip the input");
  console.log("");
}
