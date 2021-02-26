module.exports = {
    name: 'profile',
    accessLevel:1,
    description: "Returns the user's profile information. (Command not available)",
    syntax:"##profile user (Command not available)",
    async execute(message,client,commandArgs,profiles,filterUserId){
        const Discord = require('discord.js');
        try{
            const user_id = filterUserId(commandArgs);

            const profile = await profiles.findOne({ where: { user_id: user_id } });
            if (profile) {
                //gets all the lecturer info and parses the stringified data
                const topic_history = JSON.parse(profile.topic_history);
                const additional_notes = JSON.parse(profile.additional_notes);

                const user_data =  client.users.cache.get(user_id);
                // let profileEmbed = {
                //     color: 0x00ff00,
                //     title: user_data.tag,
                //     fields: [],
                //     timestamp: new Date(),
                // };
                const profileEmbed = new Discord.MessageEmbed()
                .setColor('#00ff00')
                .setTitle('User Profile')
                .setAuthor(user_data.tag, user_data.avatarURL(),'')
                .setThumbnail('attachment://profile.png')
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Topic History', value: '\u200B'},
                    { name: topic_history[0].lid, value: topic_history[0].value, inline:true },
                    { name: topic_history[1].lid, value: topic_history[1].value, inline:true },
                    { name: topic_history[2].lid, value: topic_history[2].value, inline:true },
                    { name: topic_history[3].lid, value: topic_history[3].value, inline:true },
                    { name: topic_history[4].lid, value: topic_history[4].value, inline:true },
                    { name: topic_history[5].lid, value: topic_history[5].value, inline:true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Additional Notes', value: '\u200B'},
                    { name: additional_notes[0].lid, value: additional_notes[0].value, inline:true },
                    { name: additional_notes[1].lid, value: additional_notes[1].value, inline:true },
                    { name: additional_notes[2].lid, value: additional_notes[2].value, inline:true },
                    { name: additional_notes[3].lid, value: additional_notes[3].value, inline:true },
                    { name: additional_notes[4].lid, value: additional_notes[4].value, inline:true },
                    { name: additional_notes[5].lid, value: additional_notes[5].value, inline:true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Last Question Asked', value: profile.lqa },
                )
                .setTimestamp()
                .setFooter("The Great Library Of Alexandria", message.member.guild.iconURL());
                message.channel.send({ embed: profileEmbed });
            } else {
                message.channel.send(`Error: Could not find user in the database.`);
            }
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `##profile user`');
        }
    }
}