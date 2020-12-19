module.exports = { handle, addCommand , number_to_role};
const connection = require('./connection.js');

let globalInfo;
connection.getGlobalInfoWhenLoaded(info => (globalInfo = info));

let commands = [];
function addCommand(
	alias,
	callback,
	role_needed = '@everyone',
	info = 'no info provided',
	help = 'no additional help provided',
	channelEnabled = true
) {
	commands.push({ alias, callback, role_needed, channelEnabled, info, help });
}
require('./commands/date.js');
require('./commands/channels.js');
let noTox = require('./commands/noTox.js');
require('./commands/setPrefix.js');
require('./commands/delete.js');
require('./commands/help.js');
async function handleDM(msg, bot) {}
async function handle(msg, bot) {
	let channelType = msg.channel.type;
	if (channelType == 'dm') {
		return handleDM(msg, bot);
	}
	if (!globalInfo.active_servers.includes(msg.guild.id)) {
		return;
	}
	const { channel, guild, member, author } = msg;
	let roles = member.roles.cache.array();
	console.log(roles_to_number(roles))
	if (author.id == bot.user.id) {
		return;
	}
	let globalPrefixes = globalInfo.prefixes;
	let guildConfig = await connection.getGuildConfig(guild);
	let channelConfig;
	if (guildConfig.channels_active.includes(channel.id)) {
		channelConfig = await connection.getChannelConfig(channel);
		noTox.check(msg, channelConfig);
	} else {
		for (let prefix of globalPrefixes) {
			if (msg.content.startsWith(prefix)) {
				const content = msg.content
					.substr(prefix.length)
					.trim()
					.toLowerCase();
				let splitted = content.split(' ');
				let [alias] = splitted;
				let parameters = splitted.slice(1);
				for (let command of commands) {
					if (command.alias == alias) {
						let highEnough = false;
							if (roles_to_number(roles)>=command.role_needed) {
								highEnough = true;
								if (!command.channelEnabled) {
									command.callback(msg, parameters, {
										guildConfig,
										commands,
										globalInfo
									});
									return;
								}
							}
						
						if (!highEnough) {
							msg.channel.send(
								`<@${
									author.id
								}> your role is not high enough, you need to be at least ${
									number_to_role(command.role_needed)
								} to execute this command`
							);
						}
					}
				}
				return;
			}
		}
		return;
	}
	let channelPrefixes = channelConfig.prefixes;
	let prefixes = channelPrefixes.concat(globalPrefixes);
	for (let prefix of prefixes) {
		if (msg.content.startsWith(prefix)) {
			const content = msg.content
				.substr(prefix.length)
				.trim()
				.toLowerCase();
			let splitted = content.split(' ');
			let [alias] = splitted;
			let parameters = splitted.slice(1);
			for (let command of commands) {
				if (command.alias == alias) {
					let highEnough = false;
						if (roles_to_number(roles) >= command.role_needed) {
							highEnough = true;
							if (command.channelEnabled || command.channelEnabled == null) {
								command.callback(msg, parameters, {
									channelConfig,
									guildConfig,
									commands,
									globalInfo
								});
								return;
							}
						}
					
					if (!highEnough) {
						msg.channel.send(
							`<@${
								author.id
							}> your role is not high enough, you need to be at least ${
								number_to_role(command.role_needed)
							} to execute this command`
						);
					}
				}
			}
			return;
		}
	}
}
function roles_to_number(roles){
  let n=0
  for(let role of roles){
    switch(role.name.toLowerCase()){
      case "@everyone":{
        n=Math.max(n,1)
        break
      }
      case "mod":{
        n=Math.max(n,2)
        break
      }
      case "admin":{
        n=Math.max(n,3)
        break
      }
    }
  }
  return n
}
function number_to_role(n){
  return ["user","mod","admin"][n-1]
}