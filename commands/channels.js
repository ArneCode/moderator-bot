const connection=require("../connection.js")
let {addCommand}=require("../messageHandler.js")
async function enable(msg,params,options){
  let {guildConfig}=options
  
  let {channel}=msg
  let configTest=await connection.getChannelConfig(channel)
  if(configTest){
    
    //channel config already exists, but needs to be enabled
    configTest.active=true
    connection.setChannelConfig(channel,configTest)
    channel.send("I am now active again here, my Prefix is:`"+configTest.prefix+"`")
  }else{
    let config={
      _id:channel.id,
      name:channel.name,
      prefixes:["-"],
      active:true,
      noTox:{
      modes:[{name:"off"}],
        silenced:[]
      }
    }
    connection.makeChannelConfig(channel,config).then(()=>{
      channel.send("I am now active on this channel too, my prefix is:\`-\`")
    })
  }
  guildConfig.channels_active.push(channel.id)
  await connection.setGuildConfig(channel.guild,{channels_active:guildConfig.channels_active})
  channel.send(`to disable me type: \`-disable\``)
}
async function disable(msg,params,options){
  const {channelConfig,guildConfig}=options
  let {channel}=msg
  let {channels_active}=guildConfig
  let index=channels_active.indexOf(channel.id)
  
  channels_active.splice(index,1)
  
  connection.setGuildConfig(channel.guild,{channels_active})
  channelConfig.active=false
  connection.setChannelConfig(channel,channelConfig)
  channel.send(`I have been disabled in this channel, to enable me again type: \`-enable\``)
}
module.exports={enable,disable}
addCommand("enable",enable,2,"enables the moderator bot on this channel","",false)
addCommand("disable",disable,2,"disables the moderator bot on this channel","",true)