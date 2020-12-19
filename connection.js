const Mongo = require('mongodb');
const mongo_username = process.env.MONGO_USERNAME;
const mongo_password = process.env.MONGO_PASSWORD;

const cluster_url = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0-bot1.vffbm.mongodb.net/dcb1?retryWrites=true&w=majority
`;
const cluster = new Mongo.MongoClient(cluster_url, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const http = require('http');

function keep_alive() {
	http
		.createServer(function(req, res) {
			res.write("I'm alive");
			res.end();
		})
		.listen(8080);
}

let waiting_for_params = [];
function getGlobalInfoWhenLoaded(callback) {
	waiting_for_params.push(callback);
}
async function getChannelConfig(channel) {
	console.log(channel.guild.id);
	let config = await cluster
		.db('servers')
		.collection(channel.guild.id)
		.findOne({ _id: channel.id });
	return config;
}
async function setChannelConfig(channel, new_data) {
	await cluster
		.db('servers')
		.collection(channel.guild.id)
		.updateOne({ _id: channel.id }, { $set: new_data });
}
async function makeChannelConfig(channel, data) {
	await cluster
		.db('servers')
		.collection(channel.guild.id)
		.insertOne(data);
}
async function getGuildConfig(guild) {
	let config = await cluster
		.db('servers')
		.collection(guild.id)
		.findOne({ _id: 'config' });
	return config;
}
async function setGuildConfig(guild, new_data) {
	await cluster
		.db('servers')
		.collection(guild.id)
		.updateOne({ _id: 'config' }, { $set: new_data });
}
async function makeGuild(guild,config){
  let collection=await cluster.db("servers").createCollection(guild.id)
 await collection.insertOne(config)
}
async function init() {
	keep_alive();
	await cluster.connect();
	console.log('connection initialized');
	let globalInfo = await cluster
		.db('global')
		.collection('info')
		.findOne({ _id: 'info' });
	for (let listener of waiting_for_params) {
		listener(globalInfo);
	}
}
module.exports = {
	init,
	getGlobalInfoWhenLoaded,
	getGuildConfig,
	getChannelConfig,
	setGuildConfig,
	setChannelConfig,
	makeChannelConfig
};
