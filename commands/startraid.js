module.exports = {
    name: 'startraid',
    accessLevel:3,
    description: "Starts a new raid to begin recording activity.",
    async execute(cmdLog,message,commandArgs,raids){
        try{
            const raid_name = commandArgs;

            if(!raid_name){
                message.channel.send('Syntax: `##startraid name`');
            }
            //fetches profile
            //gets date
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth()+1;
            var day = today.getDate();
            var date = day+"-"+month+"-"+year;
            //gets a random id for the raid
            let randomRaidId;
            let ifexists;
            do{
                randomRaidId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                ifexists = await raids.findOne({where : { raid_id : randomRaidId } })
            } while (ifexists)
            const description = {
                name: raid_name,
                recorded_data: null
            }
            //creates the the raid
            raids.create({
                raid_id: member.id,
                start_date: JSON.stringify(rh),
                recorded_data: null 
            });
            message.channel.send(`Started Raid \`${newraid.description.name}\`.`);
            cmdLog(`Started Raid \`${newraid.description.name}\`.`);
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `##startraid name`');
        }
    }
}