let commandHandler = require('../messageHandler.js');
function date(msg) {
	msg.channel.send(`<@!${msg.author.id}> ${new Date().toLocaleString()}`);
}
commandHandler.addCommand(
	'date',
	date,
	1,
	'gives back time at location of server'
);
