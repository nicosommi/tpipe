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
This thing is just a sequential pipe to easily organize your service flow and the error handling.
It allows you to chain input, output, error and finally mappings in a framework/protocol agnostic way, so you can switch frameworks and formats by just writing new mappings.

Just one rule for structure -> *messages* inside mappers and handlers are objects with *this structure*:  
* a *parameters* object (meta information)
* a *body* object (information)
If you break this simple rule, you may produce unpredictible behavior. Anyway, you will always receive a pre initialized message with that structure from tpipe. So make sure you don't override it with another one.  

Messages can be sent as input or as output for a specific mapper/handler.  
An input handler will receive an accumulated input message, and then every argument that is received by your framework.
A handler will receive just the input message which is the result of the input mappings and respond with a promise that resolves with an output message.  
An output handler will receive the accumulated output message (initialized as the handler output), the input message sent to the handler, and also all the arguments sent by the current framework. The same applies to the error and the finally mappings.  

Currently defaults to express (built in basic mappings).  
It supports error matching with regexes.  

As this is a pipe, the order matter and the returned value on a mapping is what is sent to the next one.  
* REMEMBER TO RETURN THE ACCUMULATED OBJECT ON YOUR MAPPINGS *  

<!-- endph -->

<!-- ph usagesAndExamples -->
With Express
```javascript
// more code...

import TPipe from "tpipe"
const myPipe = new TPipe(function (input, req, res, next) {
  return Promise.resolve({ parameters: [], body: {}})
})

app.get('/resouce', myPipe.getHandler())

// more code...
```
<!-- endph -->
<!-- ph howItWorks -->
*TBD*
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
