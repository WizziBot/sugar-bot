module.exports = {
    name: 'progress',
    accessLevel:2,
    description: "Appends a progress log to a raid.",
    async execute(cmdLog,gData,message,commandArgs,raids){
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
                //appends the raid name and id
                let recorded_data = JSON.parse(raidData.recorded_data);
                recorded_data.push(pUpdate);

                //add the modified list back into the profile
                const affectedRows = await raids.update({ recorded_data: JSON.stringify(recorded_data)}, { where: { raid_id: eRaidId } });
                if (affectedRows > 0) {
                    cmdLog(`Added Progress Update by ${message.author.tag} to Raid ${raidData.name}.`);
                    message.channel.send(`Added Progress Update by \`${message.author.tag}\` to Raid \`${raidData.name}\`.`);
                    message.member.guild.channels.cache.find(ch => ch.name === gData.announcment_channel).send(`Added Progress Update by \`${message.author.tag}\` to Raid \`${raidData.name}\`.`);
                } else {
                    message.channel.send(`Unknown Error.`);
                }
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error. Please use the correct syntax: `##progress raid_id progress_update`');
        }
    }
}