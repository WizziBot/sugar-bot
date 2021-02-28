module.exports = {
    name: 'test',
    accessLevel: 5,
    description: "Nothing",
    async execute(cmdLog,message,guildsdata,filterUserId){
        try{
            const currGuild = guildsdata.findOne({ where: { guild_id: message.guild.id } })
            let moreUpdates = true;

            if(currGuild){
                let jparsed = JSON.parse(currGuild.config)
                // let updateConfigEmbed = {
                //     color: 0x00ff00,
                //     title: raidsData[i].dataValues.name,
                //     description: `-----------------------\nTrusted Role: ${raidsData[i].dataValues.raid_id}\nSublegion: ${gName}\nStart Date: ${raidsData[i].dataValues.start_date}\nPast 5 information logs:\n${parsedRecorded}-----------------------`,
                //     timestamp: new Date(),
                // };
                // do {
                //     message.channel.send('Select the number of the data you want to change. (type `esc` to cancel)').then(datamsg => {
                //         message.channel.awaitMessages(filter, {
                //             max: 1,
                //             time: 30000,
                //             errors: ['time']
                //         })
                //     })
                // } while (moreUpdates);
            }
        } catch(e){
            console.trace(e);
            message.channel.send('Unknown Error.')
        }
    }
}