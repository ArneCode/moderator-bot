let { addCommand } = require('../messageHandler.js');
async function msg(msg, params) {
	let idrx = RegExp(/\d{18}/g);
	for (let name of params) {
		if (['everything', 'all', 'everyone'].includes(name)) {
			//const fetched = await msg.channel.fetch({limit: 99});
			msg.channel.bulkDelete(100);
		} else {
			name.replace(idrx, async match => {
				let user = await msg.guild.members.cache.get(match);
				console.log(user.id);
				let messages = await msg.channel.messages.fetch(
					{ limit: 100 },
					true,
					true
				);
				messages.array().forEach(message => {
					if (message.author.id == user.id) {
						console.log('deleting: ...', message.content);
						message.delete();
					}
				});
				//console.log("messages:",messages)
			});
		}
	}
	msg.channel.send(
		`The messages of ${params} have been deleted by <@${msg.author.id}>`
	);
}
module.exports = { msg };
addCommand(
	'delete-msg',
	msg,
	3,
	`Deletes messages in channel either of everyone or specific users`,
	`
use:
\`-delete-msg [<@user1> <@user2> <...> ...] or [all|everything|everyone]\`
Example:
\`-delete-msg all\` deletes all messages in channel
\`-delete-msg <@user1> <@user2>\` deletes all messages in channel if they were written by \`user1\` or \`user2\``
);
