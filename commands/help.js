let messageHandler = require('../messageHandler.js');
function help(msg, params, info) {
	msg.channel.send('sending you help...');
	let { commands } = info;
	if (params[0]) {
		for (let command of commands) {
			if (command.alias == params[0]) {
				msg.author.send(`This is help for the \`${command.alias}\` command:
				this command can only be used by: \`${messageHandler.number_to_role(command.role_needed)}\`
        ${command.info}
        ${command.help}`);

				return;
			}
		}
	} else {
		let channelPrefixes = info.channelConfig.prefixes
			.map(prefix => `\`${prefix}\``)
			.join(' and ');
		let globalPrefixes = info.globalInfo.prefixes
			.map(prefix => `\`${prefix}\``)
			.join(' and ');
		let text = `I am the moderator bot
    My prefixes in this channel are: ${channelPrefixes} and my global prefixes are: ${globalPrefixes}`;
		for (let command of commands) {
			text += `
      \`${command.alias}\`:
      ${command.info}`;
		}
		msg.author.send(text);
	}
}
messageHandler.addCommand(
	'help',
	help,
	1,
	'type `-help <command>` in channel for helpful information about a command.'
);
