const connection=require("../connection.js")
let {addCommand}=require("../messageHandler.js")
function setprefix(msg,params){
  connection.setChannelConfig(msg.channel,{prefixes:params}).then(()=>msg.channel.send("prefixes updated to:"+params)).catch(()=>msg.channel.send("could not update prefixes"))
}
addCommand("setprefix",setprefix,3,"The setprefix Command sets the prefixes for the moderator bot in this channel")