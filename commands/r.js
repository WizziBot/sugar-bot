module.exports = {
    name: 'r',
    accessLevel:2,
    description: "Displays information on current raid(s).",
    syntax:"##r [all/(raid_id)] (info_count)",
    async execute(message,commandArgs,raids,storedRecData,al){
        try{
            let tTitle = '**Current Raids : This Sublegion**'
            //grabs data
            if (commandArgs === 'all' && al.accessLevel < 3){
                message.reply(`Insufficient Permission`).then(msg => {msg.delete({timeout:5000})})
                return
            }
            let raidsData;
            if (commandArgs === 'all'){
                tTitle = '**Current Raids : All Sublegions**'
                raidsData = await raids.findAll();
            } else {
                raidsData = await raids.findAll({ where: { guild_id: message.guild.id } });
            }
            if(raidsData.length !== 0){
                message.channel.send(tTitle)
                for(i = 0; i < raidsData.length; i++){
                    if(raidsData[i].dataValues.guild_id == message.guild.id || commandArgs === 'all'){
                        let gName;
                        message.client.guilds.cache.forEach(g => {
                            if (g.id === raidsData[i].dataValues.guild_id){
                                gName = g.name
                            }
                        })
                        let jparsed = await storedRecData.findAll({ where: { raid_id: raidsData[i].dataValues.raid_id } });
                        let parsedRecorded = '';
                        if (jparsed.length !== 0){
                            for(u = 0; u < 5; u++){
                                const curjp = jparsed[jparsed.length - 1 - u]
                                if (curjp){
                                    parsedRecorded = `${parsedRecorded}${curjp.dataValues.author} : ${curjp.dataValues.data}\n`;
                                }
                            }
                        }
                        let rEmbed = {
                            color: 0x00ff00,
                            title: raidsData[i].dataValues.name,
                            description: `-----------------------\nRaid ID: ${raidsData[i].dataValues.raid_id}\nSublegion: ${gName}\nStart Date: ${raidsData[i].dataValues.start_date}\nPast 5 information logs:\n${parsedRecorded}-----------------------`,
                            timestamp: new Date(),
                        };
                        message.channel.send({embed:rEmbed})                
                    }
                }
            } else {
                message.channel.send(`No current raids.`)
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error.');
        }
    }
}