'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = match;
function match() {
  var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var stringValue = arguments[1];
  var fallBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var sourceKey = source.find(function (value) {
    if (value.key instanceof RegExp) {
      var test = stringValue.search(value.key) >= 0;
      return test;
    } else {
      return new RegExp(value, 'g').test(stringValue);
    }
  });

  if (sourceKey) {
    return sourceKey.value;
  } else {
    return fallBack;
  }
}