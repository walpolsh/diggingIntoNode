#!/usr/bin/env node

"use strict";

var util = require("util");
var childProc = require("child_process");

// ************************************

const HTTP_PORT = 8039;
const MAX_SMASH = 5;

var delay = util.promisify(setTimeout);

main().catch(console.error);

// ************************************

async function main() {
  console.log(`Load testing http://localhost:${HTTP_PORT}...`);

  while (true) {
    process.stdout.write(`Sending ${MAX_SMASH} requests...`);

    let smashes = [];

    for (let i = 0; i < MAX_SMASH; i++) {
      smashes.push(childProc.spawn("node", ["ex7-child.js"]));
    }

    let resps = smashes.map(function wait(child) {
      return new Promise(function c(res) {
        child.on("exit", function onExit(code) {
          if (code === 0) res(true);
          res(false);
        });
      });
    });

    resps = await Promise.all(resps);

    if (resps.every(Boolean)) {
      console.log(" smash successful!");
    } else {
      console.log(" smash failed!");
    }

    await delay(500);
  }
}
