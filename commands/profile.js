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
                const topic_history = JSON.parse(profile.topic_history);
                const additional_notes = JSON.parse(profile.additional_notes);

                const user_data =  client.users.cache.get(user_id);
                let profileEmbed = {
                    color: 0x00ff00,
                    title: user_data.tag,
                    fields: [],
                    timestamp: new Date(),
                };
                const guildsEmbed = {
                    color: 0x00ff00,
                    title: 'Sugar Guilds',
                    description: gNames,
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