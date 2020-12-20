let { addCommand } = require('../messageHandler.js');
let { yield_confirm } = require('../useful.js');
async function msg(msg, params) {
	console.log('test');
	let idrx = RegExp(/\d{18}/g);
	if (['everything', 'all', 'everyone'].includes(params[0].toLowerCase())) {
		//const fetched = await msg.channel.fetch({limit: 99});
		msg.channel.send(
			'please confirm using Y/N. Do you really want to do this?'
		);
		return await yield_confirm(msg,async ()=>{
		  await msg.channel.bulkDelete(100);
		  msg.channel.send(`All messages in this channel have been deleted by <@${msg.author.id}>`)
		},()=>{
		  msg.channel.send("ok")
		})
		
	} else {
		let matches = [];
		params.join(' ').replace(idrx, match => {
			matches.push(match);
		});
		msg.channel.send(
			`please confirm that you want to delete all messages user ${matches
				.map(match => `<@${match}>`)
				.join(
					' and '
				)} wrote in this channel using Y/N. Do you really want to do this?`
		);
		let confirm = await yield_confirm(
			msg,
			async () => {
				await delete_user_msg(msg, matches);
				msg.channel.send(
					`The messages of ${params} have been deleted by <@${msg.author.id}>`
				);
			},
			() => {
				msg.channel.send('ok');
			}
		);
		console.log(confirm);
		return confirm;
	}

	msg.channel.send(
		`The messages of ${params} have been deleted by <@${msg.author.id}>`
	);
}
async function delete_user_msg(msg, user_ids) {
	for (let id of user_ids) {
		let user = await msg.guild.members.cache.get(id);

		let messages = await msg.channel.messages.fetch({ limit: 100 }, true, true);
		messages.array().forEach(message => {
			if (message.author.id == user.id) {
				console.log('deleting: ...', message.content);
				message.delete();
			}
		});
		//console.log("messages:",messages)
	}
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
\`-delete-msg <@user1> <@user2>\` deletes all messages in channel if they were written by \`user1\` or \`user2\``,
	true,
	true
);
