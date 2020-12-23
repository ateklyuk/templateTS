const express = require("express");

const api = require("./api");
const logger = require("./logger");
const config = require("./config");
/* Telegram bot example
const bot = new Telegraf(config.BOT_TOKEN);
const content = fs.readFileSync('chats.json');
const chats = JSON.parse(content) || [];

bot.start((ctx) => {
  if(!chats.includes(ctx.chat.id)) {
    chats.push(ctx.chat.id);
    fs.writeFile('chats.json', JSON.stringify(chats), {}, (err) => {
      if(err) {
        logger.error(err)
      }
    });
  }
  ctx.reply('You are subscribed to monitoring. Use /help to get command list')
})

bot.command('logs', (ctx) => {
  const file = fs.readFileSync('logs.log');
  ctx.replyWithDocument({
    source: file,
    filename: 'logs.log'
 });
});

bot.command('ping', (ctx) => {
  ctx.reply('pong')
})

bot.telegram.setMyCommands([
  {
    command: 'help',
    description: 'Get help message'
  },
  {
    command: 'logs',
    description: 'Get most recent log file'
  },
  {
    command: 'ping',
    description: 'Check server availability'
  }
])
bot.command('help', (ctx) => {
  ctx.getMyCommands().then(res => {
    ctx.reply(res.map(item => `/${item.command} - ${item.description}`).join('\n'))
    
  })
})
bot.launch()
*/

// Cron example
// cron.schedule("*/60 * * * *",async () => {
// do smth every minute
// })


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

api.getAccessToken().then(() => {
  app.get("/ping", (req, res) => {
    res.send("pong " + Date.now())
  });

  app.listen(config.PORT, () =>
    logger.debug("Server started on ", config.PORT)
  );
});
