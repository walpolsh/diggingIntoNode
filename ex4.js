#!/usr/bin/env node

"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");

//sqlite3 doesn't require a database program to be running on your system, the DB is maintained directly by application rather than talking to a SQL server or something
var sqlite3 = require("sqlite3");
// require("console.table"); //comes with Node 10.5+

// ************************************

const DB_PATH = path.join(__dirname, "my.db"); //where to store db
const DB_SQL_PATH = path.join(__dirname, "mydb.sql"); //where to store the schema

var args = require("minimist")(process.argv.slice(2), {
  string: ["other"] //expecting --other in the command line
});

main().catch(console.error);

// ************************************

var SQL3;

async function main() {
  if (!args.other) {
    error("Missing '--other=..'");
    return;
  }

  // define some SQLite3 database helpers
  var myDB = new sqlite3.Database(DB_PATH); //open db, intialize in memory, create the file
  SQL3 = {
    run(...args) {
      return new Promise(function c(resolve, reject) {
        myDB.run(...args, function onResult(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    },
    get: util.promisify(myDB.get.bind(myDB)), //util.promisify is passed a function that expects callbacks, and returns a promise.
    all: util.promisify(myDB.all.bind(myDB)),
    exec: util.promisify(myDB.exec.bind(myDB))
  };

  var initSQL = fs.readFileSync(DB_SQL_PATH, "utf-8"); // load sql from the file
  // TODO: initialize the DB structure
  await SQL3.exec(initSQL); //makes sure we initialized SQL

  var other = args.other;
  var something = Math.trunc(Math.random() * 1e9);

  // ***********

  // TODO: insert values and print all records

  let otherID = await insertOrLookupOther(other);
  if (otherID) {
    let result = await insertSomething(otherID, something);
    if (result) {
      let records = await getAllRecords();
      if (records && records.length > 0) {
        console.table(records);
        return;
      }
    }
  }
  error("Oops!");
}

async function insertOrLookupOther(other) {
  let result = await SQL3.get(
    `
			SELECT
				id
			FROM
				Other
			WHERE
				data = ?
		`, // ? is a value thats interpolated in SQL
    other
  );

  if (result && result.id) {
    return result.id;
  } else {
    result = await SQL3.run(
      `
				INSERT INTO
					Other (data)
				VALUES
					(?)
			`,
      other
    );
    if (result && result.lastID) {
      return result.lastID;
    }
  }
}

async function insertSomething(otherID, something) {
  let result = await SQL3.run(
    `
		INSERT INTO
			Something (otherID, data)
		VALUES
			(?,?)
	`,
    otherID,
    something
  );
  if (result && result.changes > 0) {
    //we were successful in creating the records
    return true;
  }
  return false;
}

async function getAllRecords() {
  let result = await SQL3.all(
    `
			SELECT
				Other.data AS 'other',
				Something.data AS 'something'
			FROM
				Something JOIN Other 
				ON (Something.otherId = Other.id)
			ORDER BY
				Other.id DESC, Something.data ASC
		`
  );

  if (result && result.length > 0) {
    return result;
  }
}
function error(err) {
  if (err) {
    console.error(err.toString());
    console.log("");
  }
}
