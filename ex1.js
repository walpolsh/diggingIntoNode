#!/usr/bin/env node
//^ bash script for 'go find node in my system, and use it to interpret this file.
//Now I can run ./ex1.js instead of 'node ex1.js' because the bash command makes this an executable script.
"use strict";
const path = require("path"); //built into node
const fs = require("fs"); //filesystem
const getStdin = require("get-stdin"); //recieve inputs on the standard in stream
const util = require("util");
const args = require("minimist")(process.argv.slice(2), {
  //this function parses an array and returns an object with our arguements
  boolean: ["help", "in"],
  string: ["file"]
}); //the second argument is configuration

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname); //BASE_PATH=files/ ./ex1.js --file=hello.txt

if (process.env.HELLO) {
  console.log(process.env.HELLO);
} //HELLO=WORLD ./ex1.js  will print out WORLD because it found the env variable.

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  getStdin()
    .then(processFile)
    .catch(error);
} else if (args.file) {
  fs.readFile(path.join(BASE_PATH, args.file), function onContents(
    err,
    contents
  ) {
    //nodes standard callback signature is (error, callback)
    if (err) {
      error(err.toString()); //convert binary buffer to string so it's useful
    } else {
      console.log("processFile");
      processFile(contents.toString());
    }
  });
  //readFileSync returns a binary buffer
  // let filepath = path.resolve(args.file);
  // processFile(path.resolve(args.file));
  // processFile2(path.resolve(args.file));
  // console.log(__dirname); //current directory of the current file
  // console.log(filepath);
} else {
  error("Incorrect Usage!", true);
}

console.log(process.argv); //an array of arguements passed in from the executing shell
//The first element will be process.execPath
//The second element will be the path to the JavaScript file being executed.
//The remaining elements will be any additional command line arguments.
//[
//   '/Users/paulwalsh/.nvm/versions/node/v12.2.0/bin/node',
//   '/Users/paulwalsh/Documents/webdev/projects/digging-into-node ' +
//     'exercises/ex1.js',
//   '--hello=world'
// ]

console.log(process.argv.slice(2)); //[ '--hello=world']

console.log(args); //./ex1.js --hello=world -c9 - foo
//returns  { _: [ '-', 'foo' ], hello: 'world', c: 9 }
// ./ex1.js --help=foobar --file
//returns  { _: [], help: true, file: '' }

//POSIX is how c style programs interact with unix, the standard i/o. 0 = in 1 = out 2 = error.

//standard out
process.stdout.write("Hello World!\n"); //does not contain a trailing new line.
console.log("Hello world!!!"); //calls process.stdout.write and wraps it with a new line, a developer convienience

//standard error
process.stderr.write("Oops\n");
console.error("Oops!!!");

//in terminal running node ex1.js 1>/dev/null will only print out the errors because '1' redirects stdout
//node ex1.js 2>/dev/null will only print out the 'Hello world's because '2' redirects the stderr output
//node ex1.js 2>/dev/null 1>&2 will send both to dev/null, no nothing is returned

//standard in
process.stdin.read(); //we're not going to do this now because it's finiky, it exists but we're not using it immediately.
//instead we'll use ./ex1.js --hello=world OR node ex1.js --hello=world

// *********** just to be friendly.
function printHelp() {
  console.log("ex1 usage:");
  console.log("   ex1.js --file={FILENAME}");
  console.log("");
  console.log("--help                    print this help");
  console.log("--file={FILENAME}         process the file");
  console.log("--in, -                   process stdin");
  console.log("");
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("");
    printHelp;
  }
}

function processFile2(filepath) {
  let contents = fs.readFileSync(filepath); //readFileSync returns a binary buffer
  let contents2 = fs.readFileSync(filepath, "utf8"); //if you pass encoding you will get a real string back
  console.log(contents); // stringifies the binary buffer, console log does extra value processing
  process.stdout.write(contents); // passes binary buffer to shell and converts to characters.
  console.log(contents2); // returns a real string
}

function processFile(contents) {
  contents = contents.toUpperCase();
  process.stdout.write(contents);
}

//cat files/hello.txt | ./ex1.js --in     tells the shell to pipe the process through stdin instead
//cat files/hello.txt | ./ex1.js -        also works
// | is the pipe operator, it's saying take the output of files/hello.txt and pipe it into the stdin of ex1.js

//cp ex1.js ex2.js to copy one file into another
