require('dotenv').config()
const { Bot } = require('grammy')
const fs = require('node:fs')
const bot = new Bot(process.env.bot_token)

const databaseFile = process.env.dbFile

const setData = (key, value) => {
    let data = {};
    if (fs.existsSync(databaseFile)) {
        const fileData = fs.readFileSync(databaseFile);
        data = JSON.parse(fileData);
    }
    data[key] = { value, timestamp: Date.now() };

    fs.writeFileSync(databaseFile, JSON.stringify(data,null,JSON.parse(process.env.prettyDb) ? 2 : 0));
};
const getData = (key) => {
    if (fs.existsSync(databaseFile)) {
        const fileData = fs.readFileSync(databaseFile);
        const data = JSON.parse(fileData);

        if (data[key] && (Date.now() - data[key].timestamp) <= 24 * 60 * 60 * 1000) {
            return data[key].value;
        } else {
            delete data[key];
            fs.writeFileSync(databaseFile, JSON.stringify(data, null, 2));
        }
    }
    return null;
};

bot.command('start', async (ctx, next) => await ctx.reply('Welcome to livegram bot\n Made by @ROBBING_GAMER') && next())

bot.filter(ctx => ctx.from.id === parseInt(process.env.ownerID) && ctx.message.reply_to_message && getData(ctx.message.reply_to_message.message_id)).on('message', async (ctx) => {
    ctx.copyMessage(getData(ctx.message.reply_to_message.message_id))
})

bot.on('message', async (ctx) => {
    if (ctx.message.forward_from) {
        await ctx.reply('You cannot forward someone\'s forwarded message!')
        return
    }
    var { message_id } = await ctx.forwardMessage(process.env.ownerID)
    setData(message_id, ctx.from.id)
})

bot.start({
    onStart: (me) => console.log('Started @' + me.username),
    drop_pending_updates: true
})