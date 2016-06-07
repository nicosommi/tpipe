'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     It aims to support both http and amqp requests while doing some cross cutting concern
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Tiny bit inspired in amazon api gateway resource processing structure.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Caveats: now is just for http using connect middleware format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     input structure is:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     	parameters
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     	body
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     output
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     	parameters
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     	body
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

exports.expressResponseMapping = expressResponseMapping;
exports.expressRequestMapping = expressRequestMapping;
exports.expressErrorMapping = expressErrorMapping;

var _log = require('./utils/log.js');

var _match = require('./utils/match.js');

var _match2 = _interopRequireDefault(_match);

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = new (_get__('Logger'))('nicosommi.tPipe');

var errorMatch = Symbol('errorMatch');

function expressResponseMapping(output, input, req, res, next) {
  _get__('logger').log('expressResponse begin', { input: input, output: output });
  res.status(output.parameters.status || 200).send(output.body);
  next();
  return _get__('Promise').resolve(output);
}

function expressRequestMapping(input, req) {
  _get__('logger').log('expressRequest begin');
  input.parameters = req.params;
  input.body = req.body;
  return _get__('Promise').resolve(input);
}

function expressErrorMapping(errorOutput) {
  _get__('logger').log('expressError begin');
  if (!errorOutput.parameters.status) {
    errorOutput.parameters.status = 500;
  }
  return _get__('Promise').resolve(errorOutput);
}

var TPipe = function () {
  function TPipe(handler, options) {
    _classCallCheck(this, TPipe);

    this.handler = handler;
    this.options = options || {};

    if (!this.options.inputMappings) {
      _get__('logger').log('default input mapping');
      this.options.inputMappings = [_get__('expressRequestMapping')];
    }

    if (!this.options.outputMappings) {
      _get__('logger').log('default output mapping');
      this.options.outputMappings = [];
    }

    if (!this.options.finallyMappings) {
      _get__('logger').log('default finally mapping');
      this.options.finallyMappings = [_get__('expressResponseMapping')];
    }

    if (!this.options.errorMappings && !this.options.errorMatch) {
      _get__('logger').log('default error mapping');
      this.options.errorMappings = [_get__('expressErrorMapping')];
    } else if (!this.options.errorMappings && this.options.errorMatch) {
      this.options.errorMappings = [this[errorMatch], _get__('expressErrorMapping')];
    }
  }

  _createClass(TPipe, [{
    key: errorMatch,
    value: function value(error) {
      _get__('logger').log('errorMatch begin');
      var status = _get__('match')(this.options.errorMatch || [], error.body.message, 500);
      _get__('logger').log('sending error response', { status: status });
      error.parameters.status = status;
      return _get__('Promise').resolve(error);
    }
  }, {
    key: 'pipe',
    value: function pipe(array, functionArgs, output) {
      var _this = this;

      return _get__('Promise').reduce(array, function (accumulator, currentElement) {
        return currentElement.call.apply(currentElement, [_this, accumulator].concat(_toConsumableArray(functionArgs)));
      }, output);
    }
  }, {
    key: 'getHandler',
    value: function getHandler() {
      // utility for express
      return this.open.bind(this);
    }
  }, {
    key: 'open',
    value: function open() {
      var _this2 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _get__('logger').log('processing message');
      var input = {
        parameters: {},
        body: {}
      };
      var output = { parameters: {}, body: {} };

      _get__('logger').log('mapping message input');
      var inputPipeArgs = [].concat(args);
      this.pipe(this.options.inputMappings, inputPipeArgs, input).then(function (handlerInput) {
        return _this2.handler(handlerInput);
      }).then(function (processOutput) {
        _get__('logger').log('mapping message process output', { output: output });
        output = processOutput;
        var outputPipeArgs = [input].concat(args);
        return _this2.pipe(_this2.options.outputMappings, outputPipeArgs, output);
      }).catch(function (error) {
        _get__('logger').log('error mapping');
        output = { parameters: {}, body: error };
        var errorPipeArgs = [input].concat(args);
        return _this2.pipe(_this2.options.errorMappings, errorPipeArgs, output);
      }).then(function () {
        _get__('logger').log('finally mapping');
        var finallyPipeArgs = [input].concat(args);
        return _this2.pipe(_this2.options.finallyMappings, finallyPipeArgs, output);
      });
    }
  }]);

  return TPipe;
}();

exports.default = TPipe;
var _RewiredData__ = {};
var _RewireAPI__ = {};

(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'Logger':
      return _log.Logger;

    case 'logger':
      return logger;

    case 'Promise':
      return _promise2.default;

    case 'expressRequestMapping':
      return expressRequestMapping;

    case 'expressResponseMapping':
      return expressResponseMapping;

    case 'expressErrorMapping':
      return expressErrorMapping;

    case 'match':
      return _match2.default;
  }

  return undefined;
}

function _assign__(variableName, value) {
  if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return _RewiredData__[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {}

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  if ((typeof variableName === 'undefined' ? 'undefined' : _typeof(variableName)) === 'object') {
    Object.keys(variableName).forEach(function (name) {
      _RewiredData__[name] = variableName[name];
    });
  } else {
    return _RewiredData__[variableName] = value;
  }
}

function _reset__(variableName) {
  delete _RewiredData__[variableName];
}

function _with__(object) {
  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      _RewiredData__[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = _RewiredData__[variableName];
      _RewiredData__[variableName] = object[variableName];
    });
    var result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

var _typeOfOriginalExport = typeof TPipe === 'undefined' ? 'undefined' : _typeof(TPipe);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(TPipe, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(TPipe)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;