module.exports = {
    name: 'progress',
    accessLevel:2,
    description: "Appends a progress log to a raid.",
    syntax:"##progress raid_id progress_update",
    async execute(cmdLog,gData,message,commandArgs,raids,storedRecData,al){
        try{
            const splitArgs = commandArgs.split(' ');
            const eRaidId = splitArgs.shift();
            const pUpdate = splitArgs.join(' ');
            if(!eRaidId || !pUpdate){
                message.channel.send('Syntax: `##progress raid_id progress_update`');
                return
            }
            //grabs data
            const raidData = await raids.findOne({ where: { raid_id: eRaidId } });
            if(raidData){
                if(raidData.guild_id === message.guild.id || al.accessLevel === 4){
                    //creates a new progress log entry
                    await storedRecData.create({
                        raid_id: raidData.raid_id,
                        author: `${al.prefix} [${message.author.tag}]`,
                        data: pUpdate,
                        date: new Date()
                    });
                    cmdLog(`Added Progress Update by ${message.author.tag} to Raid ${raidData.name}.`);
                    message.channel.send(`Added Progress Update.`);
                    message.member.guild.channels.cache.find(ch => ch.id === gData.announcment_channel).send(`Added Progress Update by \`${message.author.tag}\` to Raid \`${raidData.name}\`.`);
                } else {
                    message.channel.send(`You can not edit that raid.`);
                }
            } else {
                message.channel.send(`Could not find \`${eRaidId}\`.`);
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error. Please use the correct syntax: `##progress raid_id progress_update`');
        }
    }
}