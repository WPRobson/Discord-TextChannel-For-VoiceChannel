var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');

var bot = new Discord.Client();
bot.login(auth.token);


bot.on('ready', function (evt) {
    console.log("Bot is ready");
});

bot.on('voiceStateUpdate', (oldMember, newMember) => {
    
    let newUserChannel = undefined;
    let oldUserChannel = undefined;

    if(newMember !== undefined)
    {
        newUserChannel = newMember.voiceChannel
    }

    if(oldMember !== undefined)
    {
        oldUserChannel = oldMember.voiceChannel
    }
    
    if(oldUserChannel === undefined && newUserChannel !== undefined) {
  
        console.log(`${newMember.user.username} has joined channel ${newUserChannel.name}`)
        let textChannel = newMember.guild.channels
        .find(channel => (channel.name === newUserChannel.name && channel.type === "text"));
        if(textChannel.name !== "general")
        {
            textChannel.overwritePermissions(newMember.user, 
                {
                    READ_MESSAGES: true,
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES:true,
                    MANAGE_MESSAGES: true
                });
        }
       

    } 

    else if(newUserChannel === undefined){
  
        console.log(`${oldMember.user.username} has left channel ${oldUserChannel.name}`)
        let textChannel = oldMember.guild.channels
        .find(channel => (channel.name === oldUserChannel.name && channel.type === "text"));
        if(textChannel.name !== "general")
        {
            textChannel.overwritePermissions(oldMember.user, 
                {
                    READ_MESSAGES: false,
                    VIEW_CHANNEL: false,
                    SEND_MESSAGES:false,
                    MANAGE_MESSAGES: false
                });
        }
    }
  })

bot.on('channelCreate', (channel) =>{

    let guild = channel.guild;

    if(channel.type === "voice" && guild !== undefined)
    {
        guild.createChannel(channel.name, 
        {type: 'text',
            permissionOverwrites: [{id : guild.id, deny:[
                'READ_MESSAGES',
                'VIEW_CHANNEL',
                'SEND_MESSAGES',
                'MANAGE_MESSAGES',
                'CREATE_INSTANT_INVITE',
                'READ_MESSAGE_HISTORY']}]
        } 
        ).then(console.log("New channel created"));
    }
});

bot.on('channelUpdate', (oldChannel, newChannel) => {

    if(oldChannel.type === "voice" && oldChannel.name !== "general")
    {
        oldChannel.guild.channels
        .find(channel => (channel.name === oldChannel.name && channel.type === "text"))
        .setName(newChannel.name)
        .then(console.log("Channel updated to new name"));
    }
});

bot.on('channelDelete', (channel) => 
{
    if(channel.type === "voice" && channel.name !== "general")
    {
        channel.guild.channels
        .find(c => (c.name === channel.name && c.type === "text"))
        .delete()
        .then("channel deleted");
    }
});