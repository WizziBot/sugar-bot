module.exports = {
    name: 'progress',
    accessLevel:2,
    description: "Appends a progress log to a raid.",
    async execute(cmdLog,gData,message,commandArgs,raids,storedRecData){
        try{
            const splitArgs = commandArgs.split(' ');
            const eRaidId = splitArgs.shift();
            const pUpdate = splitArgs.join(' ');
            if(!eRaidId || !pUpdate){
                console.log('Syntax: `##progress raid_id progress_update`');
                return
            }
            //grabs data
            const raidData = await raids.findOne({ where: { raid_id: eRaidId } });
            if(raidData){
                //creates a new progress log entry
                await storedRecData.create({
                    raid_id: raidData.raid_id,
                    author: message.author.tag,
                    data: pUpdate
                });
                cmdLog(`Added Progress Update by ${message.author.tag} to Raid ${raidData.name}.`);
                message.channel.send(`Added Progress Update.`);
                message.member.guild.channels.cache.find(ch => ch.name === gData.announcment_channel).send(`Added Progress Update by \`${message.author.tag}\` to Raid \`${raidData.name}\`.`);
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error. Please use the correct syntax: `##progress raid_id progress_update`');
        }
    }
}