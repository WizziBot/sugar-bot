module.exports = {
    name: 'updateconfig',
    accessLevel: 3,
    syntax:"##updateconfig",
    description: "Updates the guild configuration with skippable options as to not have to ping all the roles.",
    async execute(cmdLog,message,guildsdata,filterUserId,filterRoleId,adminChatInit){
        try{
            const thisGdata = await guildsdata.findOne({ where: { guild_id: message.guild.id } })
            const thisParsedData = JSON.parse(thisGdata.config)
            console.log(thisParsedData)
            let guildDataAccumulator = {
                trusted:thisParsedData.trusted,
                raid_participant:thisParsedData.raid_participant,
                moderator:thisParsedData.moderator,
                admin_channel:thisParsedData.admin_channel,
                announcment_channel:thisParsedData.announcment_channel,
                admin_chat:thisParsedData.admin_chat,
            }
            let filter = m => m.author.id === message.author.id
            function channelsData(){
                message.channel.send(`Enter the **Administrator/Alerts Channel**. (Important alerts that are only to be known to staff)`).then(datamsg => {
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                    .then(currMessage => {
                        currMessage = currMessage.first()
                        if(currMessage.content === 'cancel') return;
                        currMessage.delete({timeout:0})
                        const ch_id = filterUserId(currMessage.content,message)
                        const adminC = message.guild.channels.cache.find(r => r.id == ch_id)
                        let aName;
                        if(adminC){
                            aName = adminC.name
                            guildDataAccumulator.admin_channel = adminC.id
                            datamsg.edit(`Alerts Channel : ${aName}\n\nEnter the **Announcments/Information Log Channel**. (Announces things like raid progress updates or the creation of a raid and would be kept from non trusted members)`)
                        } else {
                            aName = '**Skipped**'
                            datamsg.edit(`Alerts Channel : ${aName}\n\nEnter the **Announcments/Information Log Channel**. (Announces things like raid progress updates or the creation of a raid and would be kept from non trusted members)`)
                        }
                        message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(currMessage => {
                            currMessage = currMessage.first()
                            if(currMessage.content === 'cancel') return;
                            currMessage.delete({timeout:0})
                            const ch_id = filterUserId(currMessage.content,message)
                            const annC = message.guild.channels.cache.find(r => r.id == ch_id)
                            let annName;
                            if(annC){
                                annName = annC.name
                                guildDataAccumulator.announcment_channel = annC.id
                                datamsg.edit(`Alerts Channel : ${aName}\nAnnouncments Channel : ${annName}\n\nEnter the **Admin Chat Channel**. (Global Admin Chat that links with other sublegions' admin chats)`)
                            } else {
                                annName = '**Skipped**'
                                datamsg.edit(`Alerts Channel : ${aName}\nAnnouncments Channel : ${annName}\n\nEnter the **Admin Chat Channel**. (Global Admin Chat that links with other sublegions' admin chats)`)
                            }
                            message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 30000,
                                errors: ['time']
                            })
                            .then(currMessage => {
                                currMessage = currMessage.first()
                                if(currMessage.content === 'cancel') return;
                                currMessage.delete({timeout:0})
                                const ch_id = filterUserId(currMessage.content,message)
                                const acC = message.guild.channels.cache.find(r => r.id == ch_id)
                                let acName;
                                if(acC){
                                    acName = acC.name
                                    guildDataAccumulator.admin_chat = acC.id
                                    datamsg.edit(`Alerts Channel : ${aName}\nAnnouncments Channel : ${annName}\nAdmin Chat Channel : ${acName}\n\n**Completed Channel Setup.**\n(Setup complete)`)
                                } else {
                                    acName = '**Skipped**'
                                    datamsg.edit(`Alerts Channel : ${aName}\nAnnouncments Channel : ${annName}\nAdmin Chat Channel : ${acName}\n\n**Completed Channel Setup.**\n(Setup complete)`)
                                }
                                try{
                                    guildsdata.update({
                                        config: JSON.stringify(guildDataAccumulator)
                                    }, { where: { guild_id: message.guild.id } });
                                    cmdLog(`UPDATED GUILD CONFIG FOR [${message.guild.name}]`)
                                    adminChatInit()
                                } catch(e){
                                    console.trace(e)
                                    currMessage.channel.send(`UNKNOWN ERROR.`)
                                }
                            })
                            .catch(collected => {
                                console.trace(collected)
                                message.channel.send(`Setup failed: Timed out`);
                            });
                        })
                        .catch(collected => {
                            console.trace(collected)
                            message.channel.send(`Setup failed: Timed out`);
                        });
                    })
                    .catch(collected => {
                        console.trace(collected)
                        message.channel.send(`Setup failed: Timed out`);
                    });
                })
            }
            
            message.channel.send('**(At any point during the setup type `(anything invalid)` to skip a property or type `cancel` to cancel the setup)**\nEnter the role of **Trusted** members (Members that can be trusted).').then(datamsg => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 30000,
                    errors: ['time']
                })
                .then(currMessage => {
                    currMessage = currMessage.first()
                    if(currMessage.content === 'cancel') return;
                    currMessage.delete({timeout:0})
                    const role_id = filterRoleId(currMessage.content,message)
                    const trustedR = message.guild.roles.cache.find(r => r.id == role_id)
                    let tName;
                    if(trustedR){
                        tName = trustedR.name
                        guildDataAccumulator.trusted = trustedR.id
                        datamsg.edit(`Trusted role : ${tName}\n\nEnter the role of **Raid Participant** members (Members that are participating in the current raid).`)
                    } else {
                        tName = '**Skipped**'
                        datamsg.edit(`Trusted role : ${tName}\n\nEnter the role of **Raid Participant** members (Members that are participating in the current raid).`)
                    }
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                    .then(currMessage => {
                        currMessage = currMessage.first()
                        if(currMessage.content === 'cancel') return;
                        currMessage.delete({timeout:0})
                        const role_id = filterRoleId(currMessage.content,message)
                        const participantR = message.guild.roles.cache.find(r => r.id == role_id)
                        let pName;
                        if(participantR){
                            pName = participantR.name
                            guildDataAccumulator.raid_participant = participantR.id
                            datamsg.edit(`Trusted role : ${tName}\nRaid Participant role : ${pName}\n\nEnter the role of **Moderator** members (Members that are in charge of server moderation and managing raids).`)
                        } else {
                            pName = '**Skipped**'
                            datamsg.edit(`Trusted role : ${tName}\nRaid Participant role : ${pName}\n\nEnter the role of **Moderator** members (Members that are in charge of server moderation and managing raids).`)
                        }
                        message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(currMessage => {
                            currMessage = currMessage.first()
                            if(currMessage.content === 'cancel') return;
                            currMessage.delete({timeout:0})
                            const role_id = filterRoleId(currMessage.content,message)
                            const modR = message.guild.roles.cache.find(r => r.id == role_id)
                            let mName;
                            if(modR){
                                mName = modR.name
                                guildDataAccumulator.moderator = modR.id
                                datamsg.edit(`Trusted role : ${tName}\nRaid Participant role : ${pName}\nModerator role : ${mName}\n\n**Completed Role Setup.**\n(Setup not complete)`)
                                channelsData()
                            } else {
                                mName = '**Skipped**'
                                datamsg.edit(`Trusted role : ${tName}\nRaid Participant role : ${pName}\nModerator role : ${mName}\n\n**Completed Role Setup.**\n(Setup not complete)`)
                                channelsData()
                            }
                        })
                        .catch(collected => {
                            console.trace(collected)
                            message.channel.send(`Setup failed: Timed out`);
                        });
                    })
                    .catch(collected => {
                        console.trace(collected)
                        message.channel.send(`Setup failed: Timed out`);
                    });
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