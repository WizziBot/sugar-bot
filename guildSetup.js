module.exports = {
    name: 'setup',
    description: "Sets up the guild configuration.",
    async execute(cmdLog,message,guildsdata,filterUserId){
        try{
            let guildDataAccumulator = {
                trusted:null,
                raid_participant:null,
                moderator:null,
                admin_channel:null,
                announcment_channel:null,
                vmmv:null
            }
            let filter = m => m.author.id === message.author.id
            function channelsData(){
                message.channel.send('Enter the **Administrator/Alerts Channel**.').then(datamsg => {
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                    .then(currMessage => {
                        currMessage = currMessage.first()
                        currMessage.delete({timeout:0})
                        const ch_id = filterUserId(currMessage.content)
                        const adminC = message.guild.channels.cache.find(r => r.id == ch_id)
                        if(adminC){
                            guildDataAccumulator.admin_channel = adminC.id
                            datamsg.edit(`Alerts Channel : ${adminC.name}\n\nEnter the **Announcments/Information Log Channel**.`)
                            message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 30000,
                                errors: ['time']
                            })
                            .then(currMessage => {
                                currMessage = currMessage.first()
                                currMessage.delete({timeout:0})
                                const ch_id = filterUserId(currMessage.content)
                                const annC = message.guild.channels.cache.find(r => r.id == ch_id)
                                if(annC){
                                    guildDataAccumulator.announcment_channel = annC.id
                                    datamsg.edit(`Alerts Channel : ${adminC.name}\nAnnouncments Channel : ${annC.name}\n\n**Completed Channel Setup.**\n(Setup complete)`)
                                    try{
                                        let ea = [];
                                        guildsdata.create({
                                            guild_id: message.guild.id,
                                            raid_history: JSON.stringify(ea),
                                            config: JSON.stringify(guildDataAccumulator)
                                        });
                                        cmdLog(`CREATED GUILD CONFIG FOR [${message.guild.name}]`)
                                    } catch(e){
                                        console.trace(e)
                                        currMessage.channel.send(`UNKNOWN ERROR.`)
                                    }
                                } else {
                                    currMessage.channel.send(`Setup failed: Invalid Channel`)
                                }
                            })
                            .catch(collected => {
                                console.trace(collected)
                                message.channel.send(`Setup failed: Timed out`);
                            });
                        } else {
                            currMessage.channel.send(`Setup failed: Invalid Channel`)
                        }
                    })
                    .catch(collected => {
                        console.trace(collected)
                        message.channel.send(`Setup failed: Timed out`);
                    });
                })
            }
            
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
                        guildDataAccumulator.trusted = trustedR.id
                        datamsg.edit(`Trusted role : ${trustedR.name}\n\nEnter the role of **Raid Participant** members (Members that are participating in the current raid).`)
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
                                guildDataAccumulator.raid_participant = participantR.id
                                datamsg.edit(`Trusted role : ${trustedR.name}\nRaid Participant role : ${participantR.name}\n\nEnter the role of **Moderator** members (Members that are in charge of server moderation and managing raids).`)
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
                                        guildDataAccumulator.moderator = modR.id
                                        datamsg.edit(`Trusted role : ${trustedR.name}\nRaid Participant role : ${participantR.name}\nModerator role : ${modR.name}\n\n**Completed Role Setup.**\n(Setup not complete)`)
                                        channelsData()
                                    } else {
                                        currMessage.channel.send(`Setup failed: Invalid Role`)
                                    }
                                })
                                .catch(collected => {
                                    console.trace(collected)
                                    message.channel.send(`Setup failed: Timed out`);
                                });
                            } else {
                                currMessage.channel.send(`Setup failed: Invalid Role`)
                            }
                        })
                        .catch(collected => {
                            console.trace(collected)
                            message.channel.send(`Setup failed: Timed out`);
                        });
                    } else {
                        currMessage.channel.send(`Setup failed: Invalid Role`)
                    }
                })
                .catch(collected => {
                    console.trace(collected)
                    message.channel.send(`Setup failed: Timed out`);
                });
            }) 
        } catch(e){
            console.trace(e);
            message.channel.send('Unknown Error.')
        }
    }
}