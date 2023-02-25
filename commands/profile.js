module.exports = {
    name: 'profile',
    accessLevel:2,
    description: "Returns the user's profile information.",
    syntax:"##profile user [history/notes] (info_count)",
    async execute(message,client,commandArgs,profiles,filterUserId){
        try{
            const splitArgs = commandArgs.split(' ');
            const user_id = filterUserId(splitArgs.shift(),message);
            if (!user_id){
                message.channel.send('Syntax: `##profile user [history/notes] (info_count)`')
                return
            }
            const hon = splitArgs.shift();
            const count = splitArgs.shift();
            const profile = await profiles.findOne({ where: { user_id: user_id } });
            if (profile) {
                //gets all the lecturer info and parses the stringified data
                let raid_history = JSON.parse(profile.raid_history);
                let additional_notes = JSON.parse(profile.additional_notes);
                if (raid_history.length === 0){
                    raid_history = "Empty"
                } else {
                    if(!hon){
                        let tempRH = [];
                        let cLength = 0;
                        for (i = 0; i < raid_history.length; i++){
                            cLength += raid_history[i].name.length
                            tempRH.push(raid_history[i].name)
                        }
                        if (cLength > 1000) {
                            raid_history = "Too many characters"
                        } else {
                            raid_history = tempRH
                        }
                    } else {
                        let tempRH = [];
                        for (i = 0; i < raid_history.length; i++){
                            tempRH.push(raid_history[i].name)
                        }
                        raid_history = tempRH
                    }
                }
                if (additional_notes.length === 0){
                    additional_notes = "Empty"
                } else {
                    if(!hon){
                        let cLength = 0;
                        for (i = 0; i < additional_notes.length; i++){
                            cLength += additional_notes[i].length
                        }
                        if (cLength > 1000) {
                            additional_notes = "Too many characters"
                        }
                    }
                }
                const user_data =  client.users.cache.get(user_id);
                if (!hon){
                    let profileEmbed = {
                        color: 0x00ff00,
                        title: 'Raid Profile',
                        author: {
                            name: user_data.tag,
                            icon_url: user_data.avatarURL(),
                        },
                        fields: [
                            {
                                name: 'Raid History',
                                value:raid_history,
                            },
                            {
                                name: 'Notes/Information',
                                value:additional_notes,
                            },
                        ],
                        timestamp: new Date(),
                    };
                    message.channel.send({ embed: profileEmbed });
                } else if (hon.toLowerCase().includes('history')) {
                    let toSend = [];
                    toSend.push(`**Raid History of user \`${user_data.tag}\`:**`)
                    if(count){
                        toSend.push(...raid_history.slice((raid_history.length - count),raid_history.length))
                    } else {
                        toSend.push(...raid_history)
                    }
                    
                } else if (hon.toLowerCase().includes('notes')) {
                    let toSend = [];
                    toSend.push(`**Notes/Information on user \`${user_data.tag}\`:**`)
                    if(count){
                        toSend.push(...additional_notes.slice((additional_notes.length - count),additional_notes.length))
                    } else {
                        toSend.push(...additional_notes)
                    }
                }
            } else {
                message.channel.send(`Error: Could not find user in the database.`);
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error. Please use the correct syntax: `##profile user`');
        }
    }
}