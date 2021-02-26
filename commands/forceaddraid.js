module.exports = {
    name: 'forceaddraid',
    accessLevel:4,
    description: "Add a raid to a user's raid history.",
    syntax:"##forceaddraid user raid_id",
    async execute(cmdLog,message,commandArgs,profiles,raids,filterUserId,idToName){
        try{
            const splitArgs = commandArgs.split(' ');
            const user_id = filterUserId(splitArgs.shift());
            const newraid_id = splitArgs.join(' ');
            
            //fetches profile
            const profile = await profiles.findOne({ where: { user_id: user_id } });
            const newraid = await raids.findOne({ where: { raid_id: newraid_id}})
            if(profile){
                if(newraid){
                    //appends the raid name and id
                    let raid_history = JSON.parse(profile.raid_history);
                    raid_history.push({
                        id: newraid.raid_id,
                        name: newraid.description.name,
                    });

                    //add the modified list back into the profile
                    const affectedRows = await profiles.update({ raid_history: JSON.stringify(raid_history)}, { where: { user_id: user_id } });
                    if (affectedRows > 0) {
                        message.channel.send(`Added raid \`${newraid.description.name}\` to the Raid History of the user.`);
                        cmdLog(`Added raid ${newraid.description.name} to the Raid History of user ${idToName(user_id,message.guild)}.`);
                    } else {
                        message.channel.send(`Unknown Error.`);
                    }
                } else {
                    message.channel.send(`Error: Could not find raid ${newraid_id} in the database.`);
                }
            } else {
                message.channel.send(`Error: Could not find user in the database.`);
            }
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `##forceaddraid user raid_id`');
        }
    }
}