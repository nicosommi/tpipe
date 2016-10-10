'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _log = require('./utils/log.js');

var _match = require('./utils/match.js');

var _match2 = _interopRequireDefault(_match);

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

var _tPipeExpress = require('./tPipeExpress.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = new (_get__('Logger'))('nicosommi.tPipe');

var errorMatch = Symbol('errorMatch');

var TPipe = function () {
  function TPipe(handler) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TPipe);

    this.handler = handler;
    this.options = options;

    if (!this.options.metaKey) {
      _get__('logger').log('default meta key');
      this.options.metaKey = 'parameters';
    }

    if (!this.options.payloadKey) {
      _get__('logger').log('default body key');
      this.options.payloadKey = 'body';
    }

    if (!this.options.inputMappings) {
      _get__('logger').log('default input mapping');
      this.options.inputMappings = [_get__('requestInputMapping')];
    }

    if (!this.options.outputMappings) {
      _get__('logger').log('default output mapping');
      this.options.outputMappings = [];
    }

    if (!this.options.finallyMappings) {
      _get__('logger').log('default finally mapping');
      this.options.finallyMappings = [_get__('sendResponseFinallyMapping')];
    }

    if (!this.options.errorMappings && !this.options.errorMatch) {
      _get__('logger').log('default error mapping');
      this.options.errorMappings = [_get__('statusErrorMapping')];
    } else if (!this.options.errorMappings && this.options.errorMatch) {
      this.options.errorMappings = [this[errorMatch], _get__('statusErrorMapping')];
    }
  }

  _createClass(TPipe, [{
    key: _get__('errorMatch'),
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

      var description = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'default';

      return _get__('Promise').reduce(array, function (accumulator, currentElement, index) {
        if (!currentElement) {
          _get__('logger').log('Invalid mapping detected');
          throw new Error('Invalid ' + description + ' mapping received at position ' + index);
        }
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
    key: 'getThunk',
    value: function getThunk() {
      var _this2 = this;

      // utility for redux
      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return function () {
          for (var _len2 = arguments.length, more = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            more[_key2] = arguments[_key2];
          }

          return _this2.open.apply(_this2, args.concat(more));
        };
      };
    }
  }, {
    key: 'open',
    value: function open() {
      var _input,
          _output,
          _this3 = this;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      _get__('logger').log('processing message');
      var input = (_input = {}, _defineProperty(_input, this.options.metaKey, {}), _defineProperty(_input, this.options.payloadKey, {}), _input);
      var output = (_output = {}, _defineProperty(_output, this.options.metaKey, {}), _defineProperty(_output, this.options.payloadKey, {}), _output);

      _get__('logger').log('mapping message input');
      var inputPipeArgs = [].concat(args);
      return this.pipe(this.options.inputMappings, inputPipeArgs, input, 'input').then(function (hi) {
        return input = hi;
      }) // input handler (after input mappings) overrides input
      .then(function () {
        return _this3.handler(input);
      }).then(function (processOutput) {
        _get__('logger').log('mapping message process output', { output: output });
        output = processOutput;
        var outputPipeArgs = [input].concat(args);
        return _this3.pipe(_this3.options.outputMappings, outputPipeArgs, output, 'output');
      }).catch(function (error) {
        var _output2;

        _get__('logger').log('error mapping');
        output = (_output2 = {}, _defineProperty(_output2, _this3.options.metaKey, {}), _defineProperty(_output2, _this3.options.payloadKey, error), _output2);
        var errorPipeArgs = [input].concat(args);
        return _this3.pipe(_this3.options.errorMappings, errorPipeArgs, output, 'error');
      }).then(function () {
        _get__('logger').log('finally mapping');
        var finallyPipeArgs = [input].concat(args);
        return _this3.pipe(_this3.options.finallyMappings, finallyPipeArgs, output, 'finally');
      });
    }
  }]);

  return TPipe;
}();

exports.default = TPipe;

var _RewiredData__ = Object.create(null);

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
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
  if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = _RewiredData__[variableName];

    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'Logger':
      return _log.Logger;

    case 'logger':
      return logger;

    case 'requestInputMapping':
      return _tPipeExpress.requestInputMapping;

    case 'sendResponseFinallyMapping':
      return _tPipeExpress.sendResponseFinallyMapping;

    case 'statusErrorMapping':
      return _tPipeExpress.statusErrorMapping;

    case 'match':
      return _match2.default;

    case 'Promise':
      return _promise2.default;

    case 'errorMatch':
      return errorMatch;
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
    if (value === undefined) {
      _RewiredData__[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      _RewiredData__[variableName] = value;
    }

    return function () {
      _reset__(variableName);
    };
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