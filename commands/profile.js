module.exports = {
    name: 'profile',
    accessLevel:1,
    description: "Returns the user's profile information. (Command not available)",
    syntax:"##profile user (Command not available)",
    async execute(message,client,commandArgs,profiles,filterUserId){
        try{
            const user_id = filterUserId(commandArgs);

            const profile = await profiles.findOne({ where: { user_id: user_id } });
            if (profile) {
                //gets all the lecturer info and parses the stringified data
                const raid_history = JSON.parse(profile.raid_history);
                const additional_notes = JSON.parse(profile.additional_notes);

                const user_data =  client.users.cache.get(user_id);
                let profileEmbed = {
                    color: 0x00ff00,
                    title: 'Raid Profile',
                    author: {
                        name: user_data.tag,
                        icon_url: user_data.avatarURL(),
                    },
                    fields: [raid_history,additional_notes],
                    timestamp: new Date(),
                };
                message.channel.send({ embed: profileEmbed });
            } else {
                message.channel.send(`Error: Could not find user in the database.`);
            }
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `##profile user`');
        }
    }
}