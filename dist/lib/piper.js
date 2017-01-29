'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Piper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = piper;

var _tPipe = require('./tPipe.js');

var _tPipe2 = _interopRequireDefault(_tPipe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Piper = exports.Piper = function () {
  function Piper(pipe) {
    _classCallCheck(this, Piper);

    this.pipe = pipe;
  }

  _createClass(Piper, [{
    key: 'concatTo',
    value: function concatTo(key, params) {
      this.pipe.options[key] = this.pipe.options[key].concat(params);
      return this;
    }
  }, {
    key: 'incorporate',
    value: function incorporate(_ref) {
      var _this = this;

      var inputMappings = _ref.inputMappings,
          outputMappings = _ref.outputMappings,
          finallyMappings = _ref.finallyMappings,
          errorMappings = _ref.errorMappings,
          _ref$extraProperties = _ref.extraProperties,
          extraProperties = _ref$extraProperties === undefined ? {} : _ref$extraProperties;

      this.input.apply(this, inputMappings);
      this.output.apply(this, outputMappings);
      this.finally.apply(this, finallyMappings);
      this.error.apply(this, errorMappings);
      Object.keys(extraProperties).forEach(function (key) {
        Object.defineProperty(_this.pipe, key, {
          value: extraProperties[key]
        });
      });
      return this;
    }
  }, {
    key: 'input',
    value: function input() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.concatTo('inputMappings', args);
    }
  }, {
    key: 'output',
    value: function output() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return this.concatTo('outputMappings', args);
    }
  }, {
    key: 'error',
    value: function error() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return this.concatTo('errorMappings', args);
    }
  }, {
    key: 'finally',
    value: function _finally() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return this.concatTo('finallyMappings', args);
    }
  }, {
    key: 'empty',
    value: function empty(key) {
      this.pipe.options[key] = [];
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.empty('inputMappings');
      this.empty('outputMappings');
      this.empty('errorMappings');
      this.empty('finallyMappings');
      return this;
    }
  }]);

  return Piper;
}();

function piper(handler) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var pipe = new _tPipe2.default(handler);
  var result = new Piper(pipe);
  result.reset();
  Object.assign(result.pipe.options, options);
  return result;
}