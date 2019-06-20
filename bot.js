var Discord = require('discord.js');
var auth = require('./auth.json');

var bot = new Discord.Client();
bot.login(auth.token);

bot.on('ready', function (evt) {
    console.log("Bot is ready");
    bot.user.setGame("Beep Boop. I am a bot.")
});

bot.on('voiceStateUpdate', (oldMember, newMember) => {
    try {
        console.log("Voice state of user has updated")

        let newUserChannel = undefined;
        let oldUserChannel = undefined;

        if (newMember !== undefined) {
            newUserChannel = newMember.voiceChannel
        }

        if (oldMember !== undefined) {
            oldUserChannel = oldMember.voiceChannel
        }

        if (oldUserChannel === undefined && newUserChannel !== undefined) {

            console.log(`${newMember.user.username} has joined channel ${newUserChannel.name}`)
            let textChannel = newMember.guild.channels
                .find(channel => (channel.name === filterChannelNameSpaces(newUserChannel.name) && channel.type === "text"));
            if (textChannel.name !== "general") {
                console.log(`Granting permissions to view channel ${newUserChannel} to ${newMember.user.username}`);
                textChannel.overwritePermissions(newMember.user,
                    {
                        READ_MESSAGES: true,
                        VIEW_CHANNEL: true,
                        SEND_MESSAGES: true,
                        MANAGE_MESSAGES: true
                    });
            }
        }

        else if (newUserChannel === undefined) {

            console.log(`${oldMember.user.username} has left channel ${oldUserChannel.name}`)
            let textChannel = oldMember.guild.channels
                .find(channel => (channel.name === filterChannelNameSpaces(oldUserChannel.name) && channel.type === "text"));
            if (textChannel.name !== "general") {
                console.log(`Revoking permissions to view channel ${oldUserChannel.name} from ${oldMember.user.username}`);
                textChannel.replacePermissionOverwrites({
                    overwrites: [
                        {
                            id: oldMember.user.id,
                            denied: [
                                'READ_MESSAGES',
                                'VIEW_CHANNEL',
                                'SEND_MESSAGES',
                                'MANAGE_MESSAGES'
                            ]
                        },
                    ]
                })
            }
        }
    }
    catch (error) { console.log(error); }
});


bot.on('channelCreate', (channel) => {
    try {
        console.log(`Channel ${channel.name} has been created`)

        let guild = channel.guild;

        if (channel.type === "voice" && guild !== undefined) {
            console.log("New channel was type voice, Creating new text channel");
            guild.createChannel(channel.name,
                {
                    type: 'text',
                    permissionOverwrites: [{
                        id: guild.id, deny: [
                            'READ_MESSAGES',
                            'VIEW_CHANNEL',
                            'SEND_MESSAGES',
                            'MANAGE_MESSAGES',
                            'SEND_TTS_MESSAGES',
                            'READ_MESSAGE_HISTORY',
                            'MENTION_EVERYONE'
                        ]
                    }]
                }
            ).then(console.log("New channel created"));
        }
    }
    catch (error) { console.log(error); }
});

bot.on('channelUpdate', (oldChannel, newChannel) => {
    try {
        console.log(`Channel ${oldChannel.name} has been updated`)

        if (oldChannel.type === "voice" && oldChannel.name !== "general") {
            if (oldChannel.name !== newChannel.name) {
                console.log("Channel that was updated was of type voice, updating text channel to use new name")
                oldChannel.guild.channels
                    .find(channel => (channel.name === oldChannel.name && channel.type === "text"))
                    .setName(newChannel.name)
                    .then(console.log("Channel updated to new name"));
            }
        }
    }
    catch (error) { console.log(error); }
});

bot.on('channelDelete', (channel) => {
    try {
        if (channel.type === "voice" && channel.name !== "general") {
            channel.guild.channels
                .find(c => (c.name === filterChannelNameSpaces(channel.name) && c.type === "text"))
                .delete()
                .then("channel deleted");
        }
    }
    catch (error) { console.log(error); }
});

function filterChannelNameSpaces(channelName) {
    return channelName.split(" ").join("-");
}