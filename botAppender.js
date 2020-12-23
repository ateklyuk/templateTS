const Telegram = require('telegraf/telegram')
const fs = require("fs");

const config = require("./config");

const telegram = new Telegram(config.BOT_TOKEN);

// This is the function that generates an appender function
function stdoutAppender(layout, timezoneOffset) {
    // This is the appender function itself
    return (loggingEvent) => {
        if(loggingEvent.level.levelStr !== "ERROR") {
            return
        }
        const msg = `${layout(loggingEvent, timezoneOffset)}\n`;
        const content = fs.readFileSync('chats.json');
        const chats = JSON.parse(content);
        chats.forEach(chat => telegram.sendMessage(chat, msg, {disable_web_page_preview: true}))
    };
  }
  
  // stdout configure doesn't need to use findAppender, or levels
  function configure(config, layouts) {
    // the default layout for the appender
    let layout = layouts.colouredLayout;
    // check if there is another layout specified
    if (config.layout) {
      // load the layout
      layout = layouts.layout(config.layout.type, config.layout);
    }
    //create a new appender instance
    return stdoutAppender(layout, config.timezoneOffset);
  }
  
  //export the only function needed
  exports.configure = configure;