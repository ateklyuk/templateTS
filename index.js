"use strict";
/**
 * Основной модуль приложения - точка входа.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var api_1 = require("./api");
var logger_1 = require("./logger");
var config_1 = require("./config");
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
api_1.default.getAccessToken().then(function () {
    app.get("/ping", function (req, res) { return res.send("pong " + Date.now()); });
    app.post("/hook", function (req, res) {
        console.log(req.data);
        res.send("OK");
    });
    app.listen(config_1.config.PORT, function () { return logger_1.logger.debug("Server started on ", config_1.config.PORT); });
});
