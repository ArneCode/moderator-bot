const Discord = require('discord.js');
const bot = new Discord.Client();
const token = process.env.BOT_TOKEN_DISCORD;

const connection = require('./connection.js');
const messageHandler = require('./messageHandler.js');
bot.on('ready', () => {
	//...
});
async function main() {
	await connection.init();
	bot.login(token);
	bot.on('message', msg => messageHandler.handle(msg, bot));
}
main();
