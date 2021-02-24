module.exports = {
    name: 'setup',
    description: "Sets up the guild configuration.",
    async execute(message,guildsdata,filterUserId){
        try{
            let guildDataAccumulator = {
                trusted:null,
                raid_participant:null,
                moderator:null,
                admin_channel:null,
                announcment_channel:null,
                confidential_channel:null,
                vmmv:null
            }
            let filter = m => m.author.id === message.author.id
            message.channel.send('Enter the role of **Trusted** members (Members that can be trusted).').then(datamsg => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 30000,
                    errors: ['time']
                })
                .then(currMessage => {
                    currMessage = currMessage.first()
                    currMessage.delete({timeout:0})
                    const role_id = filterUserId(currMessage.content)
                    const trustedR = message.guild.roles.cache.find(r => r.id == role_id)
                    if(trustedR){
                        guildDataAccumulator.trusted = trustedR.name
                        datamsg.edit(`Trusted role : ${guildDataAccumulator.trusted}\n\nEnter the role of **Raid Participant** members (Members that are participating in the current raid).`)
                        message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(currMessage => {
                            currMessage = currMessage.first()
                            currMessage.delete({timeout:0})
                            const role_id = filterUserId(currMessage.content)
                            const participantR = message.guild.roles.cache.find(r => r.id == role_id)
                            if(participantR){
                                guildDataAccumulator.raid_participant = participantR.name
                                datamsg.edit(`Trusted role : ${guildDataAccumulator.trusted}\nRaid Participant role : ${guildDataAccumulator.raid_participant}\n\nEnter the role of **Moderator** members (Members that are in charge of server moderation and managing raids).`)
                                message.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ['time']
                                })
                                .then(currMessage => {
                                    currMessage = currMessage.first()
                                    currMessage.delete({timeout:0})
                                    const role_id = filterUserId(currMessage.content)
                                    const modR = message.guild.roles.cache.find(r => r.id == role_id)
                                    if(modR){
                                        guildDataAccumulator.moderator = modR.name
                                        datamsg.edit(`Trusted role : ${guildDataAccumulator.trusted}\nRaid Participant role : ${guildDataAccumulator.raid_participant}\nModerator role : ${guildDataAccumulator.moderator}\n\n**Completed Role Setup.**`)
                                        try{
                                            guildsdata.create({
                                                guild_id: message.guild.id,
                                                config: JSON.stringify(guildDataAccumulator)
                                            });
                                            let currDate = new Date()
                                            console.log(`CREATED GUILD CONFIG FOR ${message.guild.name} AT ${currDate}`)
                                        } catch(e){
                                            console.trace(e)
                                            currMessage.channel.send(`Not pog, error.`)
                                        }
                                    } else {
                                        currMessage.channel.send(`Setup failed: Invalid Role`)
                                    }
                                })
                                .catch(collected => {
                                    console.trace(collected)
                                    message.channel.send(`Setup failed: ${collected}`);
                                });
                            } else {
                                currMessage.channel.send(`Setup failed: Invalid Role`)
                            }
                        })
                        .catch(collected => {
                            console.trace(collected)
                            message.channel.send(`Setup failed: ${collected}`);
                        });
                    } else {
                        currMessage.channel.send(`Setup failed: Invalid Role`)
                    }
                })
                .catch(collected => {
                    console.trace(collected)
                    message.channel.send(`Setup failed: ${collected}`);
                });
            }) 
        } catch(e){
            console.log(e);
        }
    }
}