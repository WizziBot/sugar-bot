module.exports = {
    name: 'rold',
    accessLevel:1,
    description: "Displays information on past raid(s).",
    syntax:"##rold [all/(raid_id)] (info_count)",
    async execute(message,raids){
        try{
            //grabs data
            const raidsData = await raids.findAll();
            if(raidsData.length !== 0){
                for(i = 0; i < raidsData.length; i++){
                    let gName;
                    message.client.guilds.cache.forEach(g => {
                        if (g.id === raidsData[i].dataValues.guild_id){
                            gName = g.name
                        }
                    })
                    // let jparsed = JSON.parse(raidsData[i].dataValues.recorded_data)
                    // let parsedRecorded = '';
                    // if (jparsed.length !== 0){
                    //     for(u = 0; u < 5; u++){
                    //         const curjp = jparsed[jparsed.length - 1 - u]
                    //         if (curjp){
                    //             parsedRecorded = `${parsedRecorded}[${curjp}]\n`;
                    //         }
                    //     }
                    // }
                    let rEmbed = {
                        color: 0x00ff00,
                        title: raidsData[i].dataValues.name,
                        description: `Raid ID: ${raidsData[i].dataValues.raid_id}\nServer IP: ${raidsData[i].dataValues.ip}\nSublegion: ${gName}\nStart Date: ${raidsData[i].dataValues.start_date}\nEnd Date: ${raidsData[i].dataValues.end_date}\nDescription: ${raidsData[i].dataValues.description}`,
                        fields:[],
                        timestamp: new Date(),
                    };
                    message.channel.send({embed:rEmbed})
                }
            } else {
                message.channel.send(`Raid history is empty.`)
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error.');
        }
    }
}