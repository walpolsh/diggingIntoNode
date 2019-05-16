let stream1; //readable
let stream2; //writable
let stream4;
let final;

//pipe() hooks up to a readable stream which creates a listener for chunks of binary buffer data
let stream3 = stream1
  .pipe(stream2) // stream2 becomes readable, so it can be piped into another stream or returned
  .pipe(stream4)
  .pipe(final);

// the pattern is:
//   readable.pipe(writable) === readable
