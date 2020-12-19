const tf = require('@tensorflow/tfjs-node');
let { addCommand } = require('../messageHandler.js');
const toxicity = require('@tensorflow-models/toxicity');
const connection = require('../connection.js');
const notoxParams = require('../config.json').noTox;
let useful = require('../useful.js');
let toxicity_model;
toxicity.load().then(_toxicity_model => (toxicity_model = _toxicity_model));
async function set_mode(msg, params, options) {
	console.log('inside set_mode');
	const { channelConfig } = options;
	let noToxConfig = channelConfig.noTox;
	let diff_modes = [];
	params.forEach(param => diff_modes.push(param.split(':')[0]));
	for (let mode of diff_modes) {
		if (notoxParams.poss_modes.includes(mode)) {
			if (
				useful.haveCommonElement(
					diff_modes,
					notoxParams.uncompatible_list[mode]
				)
			) {
				msg.channel.send(`<@!${msg.author.id}> these modes are not compatible`);
				return;
			}
		} else {
			msg.channel.send(`<@!${msg.author.id}> the mode ${mode} does not exist`);
			return;
		}
	}
	let final_modes = [];
	for (let param of params) {
		let [mode, property] = param.split(':');
		switch (mode) {
			case 'off': {
				final_modes.push({ name: mode });
				msg.channel.send('I am not checking for toxic messages anymore');
				break;
			}
			case 'delete': {
				final_modes.push({ name: mode });
				msg.channel.send('I am now deleting toxic messages');
				break;
			}
			case 'remind': {
				final_modes.push({ name: mode });
				msg.channel.send('Now reminding users when they are toxic');
				break;
			}
			case 'warn': {
				final_modes.push({ name: mode });
				msg.channel.send('Now warning users when they are toxic');
				break;
			}
			case 'censor': {
				final_modes.push({ name: mode });
				msg.channel.send(
					'toxic messages are now being censored to preserve a friendly atmosphere'
				);
				break;
			}
			case 'silence-for': {
				let time = Number(property);
				if (time.isNaN) {
					msg.channel.send(
						`<@!${
							msg.author.id
						}> you need to specify the time in minutes users should be silenced for if they are toxic. For example:\`-notox silence-for:10\` to silence a user for 10 minutes`
					);
					return;
				}
				msg.channel.send(
					`users that write toxic messages are now beeing silenced for ${time} minutes`
				);
				time *= 1000 * 60; //from minutes to milliseconds
				final_modes.push({ name: mode, time });
				break;
			}
			case 'notify': {
				let toNotify = [];
				property.replace(/\d{18}/g, match => {
					toNotify.push(match);
					msg.channel.send(
						`<@${match}> you will be notified if toxic behaviour occurs`
					);
				});
				final_modes.push({ name: mode, toNotify });
				break;
			}
		}
	}
	noToxConfig.modes = final_modes;
	console.log(channelConfig);
	await connection.setChannelConfig(msg.channel, channelConfig);
}
async function isToxic(text) {
	let predictions = await toxicity_model.classify([text]);
	let categories = [];
	for (let pred of predictions) {
		let result = pred.results[0];
		if (result.match) {
			categories.push({ label: pred.label, score: result.probabilities[1] });
		}
	}
	if (categories.length > 0) {
		return categories;
	} else {
		return null;
	}
}
async function check(msg, channelConfig) {
	let noToxConfig = channelConfig.noTox;
	if (noToxConfig.modes.includes({ name: 'off' })) {
		return;
	}
	for (let user of noToxConfig.silenced) {
		if (user.id == msg.author.id) {
			if (user.until > new Date().getTime()) {
				msg.delete();
				return;
			} else {
				let index = noToxConfig.silenced.indexOf(user);
				noToxConfig.silenced.splice(index, 1);
				connection.setChannelConfig(msg.channel, channelConfig);
			}
		}
	}
	categories = await isToxic(msg.content);
	if (categories) {
		console.log(categories);
		for (let mode of noToxConfig.modes) {
			switch (mode.name) {
				case 'remind': {
					msg.channel.send(`<@!${msg.author.id}> be nice, don't swear`);
					break;
				}
				case 'delete': {
					msg.delete().catch(err => {
						console.log('could not delete message');
					});
					console.log('deleting message');
					break;
				}
				case 'warn': {
					msg.channel.send(
						`<@!${msg.author.id}> being toxic can get you banned`
					);
					break;
				}
				case 'censor': {
					msg.delete().catch(err => {
						console.log('could not delete message');
					});
					console.log('deleting message');
					msg.channel.send(`<@!${
						msg.author.id
					}> I have blured your message to preserve a friendly and respectful atmospere on this server
          original message: ||${msg.content}||`);
					break;
				}
				case 'silence-for': {
					let until = new Date().getTime() + mode.time;
					notoxParams.silenced.push({ id: msg.author.id, until });
					connection.setChannelConfig(msg.channel, channelConfig);
					msg.channel.send(
						`<@!${msg.author.id}> you are now beeing silenced for ${mode.time /
							(1000 * 60)} minutes, because you were toxic.`
					);
					break;
				}
				case 'notify': {
					let { toNotify } = mode;
					console.log('mode:', toNotify, mode);
					for (let user_id of toNotify) {
						let user = await msg.guild.members.fetch(user_id);
						user.send(`I am writing you, because the user <@${
							msg.author.id
						}> was toxic in channel ${msg.channel.name}
            original message:
            ||${msg.content}||
            actions taken:
            ${JSON.stringify(noToxConfig.modes)}`);
					}
					break;
				}
			}
		}
	}
}
module.exports = { set_mode, check };
addCommand(
	'notox',
	set_mode,
	2,
	'The `notox` command sets the mode(s) of the noTox toxicity check.',
	`use: \`-notox <mode1> <mode2> <...>..\`
possible modes are:
\`off\`:
Disables noTox check, not compatible with any other mode

\`warn\`: 
warns user not to be toxic, not compatible with: ${notoxParams.uncompatible_list.warn.map(
		elt => `\`${elt}\``
	)}

\`silence-for:[time<min>]\`
Silences users on this channel for <time> minutes when they are being toxic, not compatible with: ${notoxParams.uncompatible_list[
		'silence-for'
	].map(elt => `\`${elt}\``)}

\`remind\`
reminds user not to be toxic, not compatible with: ${notoxParams.uncompatible_list.remind.map(
		elt => `\`${elt}\``
	)}

\`delete\`
deletes toxic message, not compatible with ${notoxParams.uncompatible_list.delete.map(
		elt => `\`${elt}\``
	)}

\`censor\`
deletes toxic message and sends it in chan in a censored form, not compatible with: ${notoxParams.uncompatible_list.censor.map(
		elt => `\`${elt}\``
	)}

\`notify:<@user1>,<@user2>\`
Notifies users, when a user is beeing toxic, not compatible with ${notoxParams.uncompatible_list.notify.map(
		elt => `\`${elt}\``
	)}

Example:
\`-notox delete silence-for:3 notify:@user1,@user2\`
This would delete toxic messages and then also silence the user who wrote them for 3 minutes. It would also notify user1 and user2
`
);
