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
An input mapping receives the input message to accumulate and the other arguments sent by the caller.

```javascript
// value example
function myInputMapping(input, req, res, next) {
  return { parameters: { page: req.query.page }, body: { name: req.body.name } };
}
// promise example
function myInputMapping(input, req, res, next) {
  return Promise.resolve(someResult);
}
```

### Handler
This is your core method. It receives the input accumulated from the input mappings, and all the other arguments. A handler must return a message which will be the initial value for the output mappings or reject/throw, case in which the error mappings will be triggered.

```javascript
// value example
function myHandler(input, req, res, next) {
  return { parameters: { page: input.parameters.page }, body: { name: 'NewName', oldName: input.body.name } };
}
// promise example
function myHandler(input, req, res, next) {
  return Promise.resolve(someResult);
}
```

### Output mappers
An output mapping receives the output message to accumulate, the input, and the other arguments sent by the caller. This mappings are triggered after the handler finishes and the initial output will be its returned value / promise resolution value.

```javascript
// value example
function myOutputMapping(output, input, req, res, next) {
  return { parameters: { page: input.parameters.page }, body: { _name: output.body.name } };
}
// promise example
function myOutputMapping(output, input, req, res, next) {
  return Promise.resolve(someResult);
}
```

### Error mappers
An error mapping receives the error message to accumulate initialized with a message with the error object on the body section, the input, and the other arguments sent by the caller. It is triggered when some other mapping throws an error or reject the returned promise.

```javascript
// value example
function myErrorMapping(error, input, req, res, next) {
  return { parameters: {}, body: { newError: new Error('My error'), originalError: error.body } };
}
// promise example
function myErrorMapping(error, input, req, res, next) {
  return Promise.resolve(someResult);
}
```

### Finally mappers
A finally mapping receives the output/error message accumulated, the input, and the other arguments sent by the caller. It is triggered on both scenarios, after the output mappings but also after the error mappings.

```javascript
// value example
function myFinallyMapping(outputOrErrorMessage, input, req, res, next) {
  res.status(200).send(outputOrErrorMessage)
  next()
}
// promise example
function myFinallyMapping(outputOrErrorMessage, input, req, res, next) {
  return Promise.resolve(someResult);
}
```

Currently defaults to express (built in basic mappings).
It supports error matching to values with regexes.

<!-- endph -->

<!-- ph usagesAndExamples -->
```javascript
import piper from 'tpipe'
import expressPipeSet from 'tpipe-express'

export function renderView(output, input, req, res) {
  if (output.parameters.view) {
    res.render(output.parameters.view, output.body);
  } else {
    res.status(output.parameters.status || 200).send(output.body);
  }
  return output;
}

export function traceErrors(error) {
  console.trace('Error: ', { error });
  return error;
}

const customPipeSet = {
  ...expressPipeSet,
  errorMappings: [traceErrors],
  finallyMappings: [renderView]
};

 // piper returns an object with a pipe inside to be injected in express
const { pipe } = piper(
    input =>
      (
        {
          parameters: {
            view: 'index'
          },
          body: {
            ...input.body
          }
        }
      )
  )
.incorporate(customPipeSet) //put the mappings around the handler and prepare methods for express (getHandler)

this.app.get('/myRoute', pipe.getHandler());
```

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

<!-- endstamp -->
<!-- stamp runningtests -->
## Running Tests

It's easy to run the test suite locally, and *highly recommended* if you're using tpipe on a platform we aren't automatically testing for.

```
npm test
```
<!-- endstamp -->
