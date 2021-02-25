module.exports = {
    name: 'addtopic',
    accessLevel:3,
    description: "this adds and entry on a topic of a user in the profile system.",
    async execute(cmdLog,message,commandArgs,raids,idToName){
        try{
            const splitArgs = commandArgs.split(' ');
            const raid_name = splitArgs.shift();
            const newraid_id = splitArgs.join(' ');
            //fetches profile
            //gets date
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth()+1;
            var day = today.getDate();
            var date = day+"-"+month+"-"+year;
            //appends the raid name and id
            let raid_history = JSON.parse(profile.raid_history);
            const randomRaidId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            raid_history.push({
                raid_id: randomRaidId,
                name: raid_name,
            });

            //add the modified list back into the profile
            profiles.create({
                user_id: member.id,
                raid_history: JSON.stringify(rh),
                additional_notes: JSON.stringify(an),
                sugar_guilds: JSON.stringify(gl)
            });
            message.channel.send(`Added raid \`${newraid.description.name}\` to the Raid History of the user.`);
            cmdLog(`Added raid \`${newraid.description.name}\` to the Raid History of user ${idToName(user_id,message.guild)}.`);
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `##documentraid name start_date(00/00/0000) end_date(00/00/0000)`');
        }
    }
}