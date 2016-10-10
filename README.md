<!-- ph replacements -->
<!-- name, /tpipe/g, tpipe -->
<!-- namePascal, /TPipe/g, TPipe -->
<!-- endph -->
<!-- ph ignoringStamps -->
<!-- endph -->
<!-- ph title -->
# TPipe [![npm version](https://img.shields.io/npm/v/tpipe.svg)](https://www.npmjs.com/package/tpipe) [![license type](https://img.shields.io/npm/l/tpipe.svg)](https://github.com/nicosommi/tpipe.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/tpipe.svg)](https://www.npmjs.com/package/tpipe) ![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
<!-- endph -->

<!-- ph description -->
TPipe is a simple, yet powerful, tool to easily organize and orchestrate your functions.
It optimizes code reutilization and readability.

It allows you to chain input, output, error and finally mappings with you handler function in a framework/protocol agnostic way, so you can switch frameworks and formats by just writing new mappings.

All pipes have a collections of mappings and a handler, which is the core method.

By using just one rule for structure -> *messages* inside mappers and handlers are objects with *this structure* (names are configurable via options, but these are the defaults):  
* a *parameters* object (meta information)
* a *body* object (information)

## Execution pipeline
A T Pipe will accumulate an input via a promise-aware reduce function within its input mappers, the it will call the handler with it, and then it will execute the output/error mappings accumulating an output/error object respectively, and then the finally mappings.

### Mappers
There are four kinds of mappings allowed in a tpipe. Input, output, error and finally.
All mappings are functions that returns values or promises.

### Input mappers
An input mapping receives the input message to accumulate and the other arguments received by the callee.

```javascript
// value example
function myInputMapping(input, req, res, next) {
  return { parameters: { page: 1 }, body: { name: 'my name' } };
}
// promise example
function myInputMapping(input, req, res, next) {
  return Promise.resolve(myAsyncPromiseOperation);
}
```

### Handler
This is your core method. It receives the input accumulated from the mappings, and all the other arguments. A handler must return a message which will be the initial value for the output mappings or reject/throw, case in which the error mappings will be triggered.

```javascript
// value example
function myHandler(input, req, res, next) {
  return { parameters: { page: 1 }, body: { name: 'my name' } };
}
// promise example
function myHandler(input, req, res, next) {
  return Promise.resolve(myAsyncPromiseOperation);
}
```

### Output mappers
An output mapping receives the output message to accumulate, the input, and the other arguments received by the callee.

```javascript
// value example
function myOutputMapping(output, input, req, res, next) {
  return { parameters: { page: 1 }, body: { name: 'my name' } };
}
// promise example
function myOutputMapping(output, input, req, res, next) {
  return Promise.resolve(myAsyncPromiseOperation);
}
```

### Error mappers
An error mapping receives the error message to accumulate, the input, and the other arguments received by the callee.

```javascript
// value example
function myErrorMapping(error, input, req, res, next) {
  return { parameters: { page: 1 }, body: { name: 'my name' } };
}
// promise example
function myErrorMapping(error, input, req, res, next) {
  return Promise.resolve(myAsyncPromiseOperation);
}
```

### Finally mappers
A finally mapping receives the output/error message accumulated, the input, and the other arguments received by the callee.

```javascript
// value example
function myFinallyMapping(outputOrErrorMessage, input, req, res, next) {
  return { parameters: { page: 1 }, body: { name: 'my name' } };
}
// promise example
function myFinallyMapping(outputOrErrorMessage, input, req, res, next) {
  return Promise.resolve(myAsyncPromiseOperation);
}
```

Currently defaults to express (built in basic mappings) but it works as a redux thunk as well.  
It supports error matching with regexes.  

<!-- endph -->

<!-- ph usagesAndExamples -->
With Express
```javascript
// more code...

import TPipe from "tpipe"
const myPipe = new TPipe(function (input, req, res, next) {
  return Promise.resolve({ parameters: {}, body: {}})
})

app.get('/resouce', myPipe.getHandler())

// more code...
```
More examples comming soon...

<!-- endph -->
<!-- ph howItWorks -->
<!-- endph -->
<!-- ph qualityAndCompatibility -->
# Quality and Compatibility

[![Build Status](https://travis-ci.org/nicosommi/tpipe.png?branch=master)](https://travis-ci.org/nicosommi/tpipe) [![Coverage Status](https://coveralls.io/repos/nicosommi/tpipe/badge.svg)](https://coveralls.io/r/nicosommi/tpipe)  [![bitHound Score](https://www.bithound.io/github/nicosommi/tpipe/badges/score.svg)](https://www.bithound.io/github/nicosommi/tpipe)  [![Dependency Status](https://david-dm.org/nicosommi/tpipe.png?theme=shields.io)](https://david-dm.org/nicosommi/tpipe?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/nicosommi/tpipe/dev-status.svg)](https://david-dm.org/nicosommi/tpipe?theme=shields.io#info=devDependencies)

*Every build and release is automatically tested on the following platforms:*

![node 5.x](https://img.shields.io/badge/node-5.x-brightgreen.svg)
![node 6.x](https://img.shields.io/badge/node-6.x-brightgreen.svg)
<!-- endph -->
<!-- ph installation -->
# Installation

Copy and paste the following command into your terminal to install TPipe:

```
npm install tpipe --save
```

<!-- endph -->
<!-- stamp contribute -->
# How to Contribute

You can submit your ideas through our [issues system](https://github.com/nicosommi/tpipe/issues), or make the modifications yourself and submit them to us in the form of a [GitHub pull request](https://help.github.com/articles/using-pull-requests/).

For GDD-related service [go here](http://integracionesagiles.com)
Or contact me to nicosommi@gmail.com for any business related thing or anything else.
<!-- endstamp -->
<!-- stamp runningtests -->
## Running Tests

It's easy to run the test suite locally, and *highly recommended* if you're using tpipe on a platform we aren't automatically testing for.

```
npm test
```
<!-- endstamp -->
