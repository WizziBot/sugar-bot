module.exports = {
    name: 'startraid',
    accessLevel:3,
    description: "Starts a new raid to begin recording activity.",
    syntax:"##startraid name",
    async execute(cmdLog,gData,message,commandArgs,raids,raidsold){
        try{
            const raid_name = commandArgs;
            let ea = [];
            if(!raid_name){
                message.channel.send('Syntax: `##startraid name`');
            }
            //gets a random id for the raid
            let randomRaidId;
            let ifexists;
            let ifexists2;
            do{
                randomRaidId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                ifexists = await raids.findOne({where : { raid_id : randomRaidId } })
                ifexists2 = await raidsold.findOne({where : { raid_id : randomRaidId } })
            } while (ifexists || ifexists2)
            //creates the the raid
            raids.create({
                raid_id: randomRaidId,
                name: raid_name,
                guild_id:message.guild.id,
                start_date: new Date(),
                recorded_data: JSON.stringify(ea)
            });
            message.channel.send(`Started Raid \`${raid_name}\`.`);
            message.member.guild.channels.cache.find(ch => ch.id === gData.announcment_channel).send(`Started Raid \`${raid_name}\`.`);
            cmdLog(`Started Raid ${raid_name}.`);
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error. Please use the correct syntax: `##startraid name`');
        }
    }
}