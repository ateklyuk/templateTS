"use strict";
/**
 * Модуль для работы c API amoCRM
 * Модуль используется для работы в NodeJS.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var querystring_1 = require("querystring");
var fs_1 = require("fs");
var axios_retry_1 = require("axios-retry");
var config_1 = require("./config");
var logger_1 = require("./logger");
(0, axios_retry_1.default)(axios_1.default, { retries: 3, retryDelay: axios_retry_1.default.exponentialDelay });
var AMO_TOKEN_PATH = "amo_token.json";
var LIMIT = 200;
function Api() {
    var _this = this;
    var access_token = null;
    var refresh_token = null;
    var ROOT_PATH = "https://".concat(config_1.config.SUB_DOMAIN, ".amocrm.ru");
    var authChecker = function (request) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!access_token) {
                return _this.getAccessToken().then(function () { return authChecker(request).apply(void 0, args); });
            }
            return request.apply(void 0, args).catch(function (err) {
                logger_1.logger.error(err.response);
                logger_1.logger.error(err);
                logger_1.logger.error(err.response.data);
                var data = err.response.data;
                if ("validation-errors" in data) {
                    data["validation-errors"].forEach(function (_a) {
                        var errors = _a.errors;
                        return logger_1.logger.error(errors);
                    });
                    logger_1.logger.error("args", JSON.stringify(args, null, 2));
                }
                if (data.status == 401 && data.title === "Unauthorized") {
                    logger_1.logger.debug("Нужно обновить токен");
                    return refreshToken().then(function () { return authChecker(request).apply(void 0, args); });
                }
                throw err;
            });
        };
    };
    var requestAccessToken = function () {
        return axios_1.default
            .post("".concat(ROOT_PATH, "/oauth2/access_token"), {
            client_id: config_1.config.CLIENT_ID,
            client_secret: config_1.config.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: config_1.config.AUTH_CODE,
            redirect_uri: config_1.config.REDIRECT_URI,
        })
            .then(function (res) {
            logger_1.logger.debug("Свежий токен получен");
            return res.data;
        })
            .catch(function (err) {
            logger_1.logger.error(err.response.data);
            throw err;
        });
    };
    var getAccessToken = function () { return __awaiter(_this, void 0, void 0, function () {
        var content, token, error_1, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (access_token) {
                        return [2 /*return*/, Promise.resolve(access_token)];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 2, , 4]);
                    content = fs_1.default.readFileSync(AMO_TOKEN_PATH);
                    token = JSON.parse(content);
                    console.log(token);
                    access_token = token.access_token;
                    refresh_token = token.refresh_token;
                    return [2 /*return*/, Promise.resolve(token)];
                case 2:
                    error_1 = _a.sent();
                    logger_1.logger.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0447\u0442\u0435\u043D\u0438\u0438 \u0444\u0430\u0439\u043B\u0430 ".concat(AMO_TOKEN_PATH), error_1);
                    logger_1.logger.debug("Попытка заново получить токен");
                    return [4 /*yield*/, requestAccessToken()];
                case 3:
                    token = _a.sent();
                    fs_1.default.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
                    access_token = token.access_token;
                    refresh_token = token.refresh_token;
                    return [2 /*return*/, Promise.resolve(token)];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var refreshToken = function () {
        return axios_1.default
            .post("".concat(ROOT_PATH, "/oauth2/access_token"), {
            client_id: config_1.config.CLIENT_ID,
            client_secret: config_1.config.CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: refresh_token,
            redirect_uri: config_1.config.REDIRECT_URI,
        })
            .then(function (res) {
            logger_1.logger.debug("Токен успешно обновлен");
            var token = res.data;
            fs_1.default.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
            access_token = token.access_token;
            refresh_token = token.refresh_token;
            return token;
        })
            .catch(function (err) {
            logger_1.logger.error("Не удалось обновить токен");
            logger_1.logger.error(err.response.data);
        });
    };
    this.getAccessToken = getAccessToken;
    // Получить сделку по id
    this.getDeal = authChecker(function (id, withParam) {
        if (withParam === void 0) { withParam = []; }
        return axios_1.default
            .get("".concat(ROOT_PATH, "/api/v4/leads/").concat(id, "?").concat(querystring_1.default.encode({
            with: withParam.join(","),
        })), {
            headers: {
                Authorization: "Bearer ".concat(access_token),
            },
        })
            .then(function (res) { return res.data; });
    });
    // Получить сделки по фильтрам
    this.getDeals = authChecker(function (_a) {
        var _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? LIMIT : _c, filters = _a.filters;
        var url = "".concat(ROOT_PATH, "/api/v4/leads?").concat(querystring_1.default.stringify(__assign({ page: page, limit: limit, with: ["contacts"] }, filters)));
        return axios_1.default
            .get(url, {
            headers: {
                Authorization: "Bearer ".concat(access_token),
            },
        })
            .then(function (res) {
            return res.data ? res.data._embedded.leads : [];
        });
    });
    // Обновить сделки
    this.updateDeals = authChecker(function (data) {
        return axios_1.default.patch("".concat(ROOT_PATH, "/api/v4/leads"), [].concat(data), {
            headers: {
                Authorization: "Bearer ".concat(access_token),
            },
        });
    });
    // Получить контакт по id
    this.getContact = authChecker(function (id) {
        return axios_1.default
            .get("".concat(ROOT_PATH, "/api/v4/contacts/").concat(id, "?").concat(querystring_1.default.stringify({
            with: ["leads"]
        })), {
            headers: {
                Authorization: "Bearer ".concat(access_token),
            },
        })
            .then(function (res) { return res.data; });
    });
    // Обновить контакты
    this.updateContacts = authChecker(function (data) {
        return axios_1.default.patch("".concat(ROOT_PATH, "/api/v4/contacts"), [].concat(data), {
            headers: {
                Authorization: "Bearer ".concat(access_token),
            },
        });
    });
}
exports.default = Api;
