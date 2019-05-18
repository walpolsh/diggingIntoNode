// Node give you access to features made in C++.
// Require gives access to these features.

const http = require("http");

function cleanTweets(t) {
  return t.replace(/map|dom/g, "****");
}

const tweets = [
  "Hey Paul,",
  "I Made a sentence with map",
  "and wrote it on the dom at port 8080"
];
const tweetMap = tweets.map(x => `${x}`).join(" ");
//takes a req and res from http.createServer, everything is request response
function insertData(req, res) {
  res.write(cleanTweets(tweetMap)); //write a response to the client
  console.log(cleanTweets(tweetMap));
  res.end(); //end the response
}
http // creates and object containing IncomingMessage and ServerResponse
  .createServer(insertData)
  .listen(3000); //C++ this sets up a network socket at port 8080.
console.log("Listening at localhost:3000 ...");

// The C++ library libuv allows Node (via V8) to perform I/O, whether it is network, file etc. TCP level connectivity all the way to file/system ops are actually performed by the libuv library.
// 0. All global Javascript code is run before the event loop
// 1. The names of the methods imported from Node are labels for C++ functions. libuv
// 2. THe HTTP method creates a JavaScript object containing IncomingMessage and ServerResponse.
// 3. request/response is just incoming request data, and reponse functions.
// 4. Hold each deferred function in one of the task queues when the Node background C++ API 'completes'. These function are placed in the queue before returning
// 5. Add the function to the Call stack (execute the function) ONLY when the call stack is totally empty(have the event loop check this condition)
// 6: The event loop in Node, all built in C++ determines what function/code to run next from the 5 queues
//   0. Micro Task Queue - pioritize over all queues
//      a) queue A keeps track of process.nextTick() resolutions in a queue
//      b) queue B keeps track of for Promises and async.
//   1. Timer Queue - prioritize this queue (a minheap technically) over i/o, setImmediate('check), over close.
//   2. I/O Callstack Queue - keeps track of what function is being run and where it was run from. whenever a function is run it's added to the callstack.
//   3. Check Queue - any functions delayed from running (automatically by Node) are added to the queue when a request or background task is completed
//   4. Close Queue - closing streams, the finishing of accessing data are added to this queue
