module.exports = {
    name: 'ppurge',
    accessLevel:3,
    description:"Removes Raid Participant role from all members.",
    syntax:"##ppurge",
    async execute(cmdLog,message,gData){
        try {
            console.log(gData)
            message.guild.members.cache.forEach(member => {
                if (member.roles.cache.has(gData.raid_participant)){
                    member.roles.remove(gData.raid_participant)
                }
            })
            cmdLog('Purged all Raid Participants.')
        }
        catch (e) {
            console.trace(e);
           Message.channel.send(`Unknown Error.`);
        }
    }
}