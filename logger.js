"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 *  Модуль с настройками loggera
 */
var log4js_1 = require("log4js");
log4js_1.default.configure({
    appenders: {
        out: {
            type: "stdout",
            layout: {
                type: "pattern",
                pattern: "%d %p %f:%l %m%n",
            },
        },
        everything: {
            type: "file",
            filename: "./logs/logs.log",
            maxLogSize: 1024000,
            layout: {
                type: "pattern",
                pattern: "%d %p %f:%l %m%n",
            },
        },
    },
    categories: {
        default: { appenders: ["everything", "out"], level: "debug", enableCallStack: true },
    },
});
exports.logger = log4js_1.default.getLogger();
