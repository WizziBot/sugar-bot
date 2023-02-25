module.exports = {
    name: 'rreact',
    accessLevel:3,
    description: "Makes a rolereaction in the channel.",
    syntax:"##rreact emoji role message_content ()",
    async execute(cmdLog,message,commandArgs,rolereactions,filterRoleId){
        try{
            const splitArgs = commandArgs.split(' ');
            const emojiN = splitArgs.shift();
            const roleN = splitArgs.shift();
            const msgID = splitArgs.shift();
            if(!emojiN || !roleN || !msgID){
                message.channel.send('Syntax: `##rreact emoji role messageID`');
                return
            }
            //get the emoji data
            let emoji = {
                guildEmoji: false,
                name: null
            }
            if (emojiN[0] == '<'){
                emoji.guildEmoji = true
                let emojiID = emojiN.match(/[0-9]/g).join('')
                if(message.client.emojis.cache.filter(emoji => emoji.id === emojiID).size == 0) {
                    message.channel.send('Invalid Emoji.');
                    return
                } else {
                    emoji.name = emojiID
                }
            } else {
                emoji.name = emojiN
            }
            //get the role data
            let roleID = ''
            const roleIdC = filterRoleId(roleN,message)
            const myRole = message.guild.roles.cache.find(role => role.name === "Sugar");
            const roleData = message.guild.roles.cache.get(roleIdC)
            if (roleData){
                if (roleData.position >= myRole.position){
                    message.channel.send('Invalid Role : Can not assign this role.');
                    return
                } else {
                    roleID = roleIdC
                }
            } else {
                message.channel.send('Invalid Role : Not found.');
                return
            }

            //Do the mesig
            const msg = await message.channel.messages.fetch(msgID)
            if(msg){
                try{
                    if (emoji.guildEmoji){
                        msg.react(message.guild.emojis.cache.get(emoji.name)).then(() => {
                            try{
                                rolereactions.create({
                                    role:roleID,
                                    messageID:msg.id,
                                    emojiName:emoji.name,
                                    isGuildEmoji: emoji.guildEmoji
                                });
                                cmdLog(`${message.author.tag} Added rolereaction. MessageID: ${msgID}`);
                                message.delete({timeout:0})
                            } catch(e) {
                                console.trace(e)
                                message.channel.send('Unknown Error.');
                                msg.delete({timeout:0})
                            }
                        },err => {
                            message.channel.send('Invalid Emoji.');
                            return
                        })
                    } else {
                        msg.react(emoji.name).then(() => {
                            try{
                                rolereactions.create({
                                    role:roleID,
                                    messageID:msg.id,
                                    emojiName:emoji.name,
                                    isGuildEmoji: emoji.guildEmoji
                                });
                                cmdLog(`${message.author.tag} Added rolereaction. MessageID: ${msgID}`);
                                message.delete({timeout:0})
                            } catch(e) {
                                console.trace(e)
                                message.channel.send('Unknown Error.');
                                msg.delete({timeout:0})
                            }
                        },err => {
                            message.channel.send('Invalid Emoji.');
                            return
                        })
                    }
                } catch(e) {
                    console.trace(e)
                    message.channel.send('Invalid Emoji.');
                }
            } else {
                message.channel.send('Invalid Message ID.');
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error. Please use the correct syntax: `##rreact emoji role message_content`');
        }
    }
}