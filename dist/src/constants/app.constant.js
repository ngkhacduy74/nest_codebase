"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_USER_ID = exports.DEFAULT_CURRENT_PAGE = exports.DEFAULT_PAGE_LIMIT = exports.IS_AUTH_OPTIONAL = exports.IS_PUBLIC = exports.loggingRedactPaths = exports.Order = exports.LogService = exports.Environment = void 0;
var Environment;
(function (Environment) {
    Environment["Local"] = "local";
    Environment["Development"] = "development";
    Environment["Staging"] = "staging";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
})(Environment || (exports.Environment = Environment = {}));
var LogService;
(function (LogService) {
    LogService["Console"] = "console";
    LogService["GoogleLogging"] = "google-logging";
})(LogService || (exports.LogService = LogService = {}));
var Order;
(function (Order) {
    Order["Asc"] = "asc";
    Order["Desc"] = "desc";
})(Order || (exports.Order = Order = {}));
exports.loggingRedactPaths = [
    'req.headers.authorization',
    'req.body.token',
    'req.body.refreshToken',
    'req.body.email',
    'req.body.password',
    'req.body.oldPassword',
];
exports.IS_PUBLIC = 'is-public';
exports.IS_AUTH_OPTIONAL = 'is-auth-optional';
exports.DEFAULT_PAGE_LIMIT = 10;
exports.DEFAULT_CURRENT_PAGE = 1;
exports.SYSTEM_USER_ID = 'system';
//# sourceMappingURL=app.constant.js.map