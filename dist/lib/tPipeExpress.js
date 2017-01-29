'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestInputMapping = requestInputMapping;
exports.sendResponseFinallyMapping = sendResponseFinallyMapping;
exports.statusErrorMapping = statusErrorMapping;
exports.getHandler = getHandler;

var _log = require('./utils/log.js');

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _log.Logger('nicosommi.tPipeExpress');

function requestInputMapping(input, req) {
  logger.log('tpipe-express input mapping begin');
  input.parameters = {
    path: req.params,
    query: req.query,
    headers: req.headers,
    session: req.session,
    user: req.user,
    cookies: req.cookies,
    req: req // FIXME: remove this when tpipe is mature
  };

  input.body = req.body;
  return _promise2.default.resolve(input);
}

function sendResponseFinallyMapping(output, input, req, res, next) {
  logger.log('tpipe-express finally mapping begin', { input: input, output: output });
  res.status(output.parameters.status || 200).send(output.body);
  return _promise2.default.resolve(output);
}

function statusErrorMapping(errorOutput) {
  logger.log('tpipe-express error mapping begin');
  if (!errorOutput.parameters.status) {
    errorOutput.parameters.status = 500;
  }
  return _promise2.default.resolve(errorOutput);
}

function getHandler() {
  return this.open.bind(this);
}

var defaultSet = {
  inputMappings: [requestInputMapping],
  errorMappings: [statusErrorMapping],
  finallyMappings: [sendResponseFinallyMapping],
  extraProperties: {
    getHandler: getHandler
  }
};

exports.default = defaultSet;