'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var logger = new _log.Logger('nicosommi.tPipe');

var errorMatch = Symbol('errorMatch');

var TPipe = function () {
  function TPipe(handler) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TPipe);

    this.handler = handler;
    this.options = options;

    if (!this.options.metaKey) {
      logger.log('default meta key');
      this.options.metaKey = 'parameters';
    }

    if (!this.options.payloadKey) {
      logger.log('default body key');
      this.options.payloadKey = 'body';
    }

    if (!this.options.inputMappings) {
      logger.log('default input mapping');
      this.options.inputMappings = [_tPipeExpress.requestInputMapping];
    }

    if (!this.options.outputMappings) {
      logger.log('default output mapping');
      this.options.outputMappings = [];
    }

    if (!this.options.finallyMappings) {
      logger.log('default finally mapping');
      this.options.finallyMappings = [_tPipeExpress.sendResponseFinallyMapping];
    }

    if (!this.options.errorMappings && !this.options.errorMatch) {
      logger.log('default error mapping');
      this.options.errorMappings = [_tPipeExpress.statusErrorMapping];
    } else if (!this.options.errorMappings && this.options.errorMatch) {
      this.options.errorMappings = [this[errorMatch], _tPipeExpress.statusErrorMapping];
    }
  }

  _createClass(TPipe, [{
    key: errorMatch,
    value: function value(error) {
      logger.log('errorMatch begin');
      var status = (0, _match2.default)(this.options.errorMatch || [], error.body.message, 500);
      logger.log('sending error response', { status: status });
      error.parameters.status = status;
      return _promise2.default.resolve(error);
    }
  }, {
    key: 'pipe',
    value: function pipe(array, functionArgs, output) {
      var _this = this;

      var description = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'default';

      return _promise2.default.reduce(array, function (accumulator, currentElement, index) {
        if (!currentElement) {
          logger.log('Invalid mapping detected');
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

      logger.log('processing message');
      var input = (_input = {}, _defineProperty(_input, this.options.metaKey, {}), _defineProperty(_input, this.options.payloadKey, {}), _input);
      var output = (_output = {}, _defineProperty(_output, this.options.metaKey, {}), _defineProperty(_output, this.options.payloadKey, {}), _output);

      logger.log('mapping message input');
      var inputPipeArgs = [].concat(args);
      return this.pipe(this.options.inputMappings, inputPipeArgs, input, 'input').then(function (hi) {
        return input = hi;
      }) // input handler (after input mappings) overrides input
      .then(function () {
        return _this3.handler(input);
      }).then(function (processOutput) {
        logger.log('mapping message process output', { output: output });
        output = processOutput;
        var outputPipeArgs = [input].concat(args);
        return _this3.pipe(_this3.options.outputMappings, outputPipeArgs, output, 'output');
      }).catch(function (error) {
        var _output2;

        logger.log('error mapping');
        output = (_output2 = {}, _defineProperty(_output2, _this3.options.metaKey, {}), _defineProperty(_output2, _this3.options.payloadKey, error), _output2);
        var errorPipeArgs = [input].concat(args);
        return _this3.pipe(_this3.options.errorMappings, errorPipeArgs, output, 'error');
      }).then(function () {
        logger.log('finally mapping');
        var finallyPipeArgs = [input].concat(args);
        return _this3.pipe(_this3.options.finallyMappings, finallyPipeArgs, output, 'finally');
      });
    }
  }]);

  return TPipe;
}();

exports.default = TPipe;