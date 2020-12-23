const log4js = require("log4js");
// const {configure} = require("./botAppender");

log4js.configure({
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
      filename: "logs.log",
      maxLogSize: 1024000,
      layout: {
        type: "pattern",
        pattern: "%d %p %f:%l %m%n",
      },
    },
    // log errors to bot
    // bot: {
    //   type: {configure}
    // }
  },
  categories: {
    default: { appenders: ["everything", "out", "bot"], level: "debug", enableCallStack: true },
  },
});

const logger = log4js.getLogger();

module.exports = logger;
