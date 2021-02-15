module.exports = {
    name: 'addtopic',
    accessLevel:3,
    description: "this adds and entry on a topic of a user in the profile system.",
    async execute(message, commandArgs, profiles){
        try{
            const splitArgs = commandArgs.split(' ');
            const user_ping = splitArgs.shift();
            var user_id;
            if(user_ping.startsWith('<')){
                user_id = user_ping.slice('2','-1');
                if(user_id.startsWith('!')){
                    user_id = user_id.slice('1');
                }
            } else {
                user_id = user_ping;
            }
            const newtopic = splitArgs.join(' ');
            
            //fetches profile
            const profile = await profiles.findOne({ where: { user_id: user_id } });
            if(profile){
                //deletes first entry if there are 6 or more (which there shouldnt be more than 6)
                var topic_history = JSON.parse(profile.topic_history);
                if(topic_history.length > 5){
                    topic_history.shift();
                }
                var today = new Date();
                var year = today.getFullYear();
                var month = today.getMonth()+1;
                var day = today.getDate();
                var date = day+"-"+month+"-"+year;
                topic_history.push({
                    lid: message.author.tag + ' ' + date,
                    value: newtopic,
                });

                //add the modified list back into the profile
                const affectedRows = await profiles.update({ topic_history: JSON.stringify(topic_history)}, { where: { user_id: user_id } });
                if (affectedRows > 0) {
                    message.channel.send(`Success in adding a Topic to the Topic History of the user.`);
                } else {
                    message.channel.send(`Unexpected Error.`);
                }
            } else {
                message.channel.send(`Error: Could not find user in the database.`);
            }
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `-addraid user raid_id`');
        }
    }
}