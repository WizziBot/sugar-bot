module.exports = {
    name: 'addnote',
    accessLevel:3,
    description: "Add a note to a user's raid history.",
    syntax:"##addnote user (note)",
    async execute(cmdLog,message,commandArgs,profiles,filterUserId,idToName){
        try{
            const splitArgs = commandArgs.split(' ');
            const user_id = filterUserId(splitArgs.shift());
            const note = splitArgs.join(' ');
            
            //fetches profile
            const profile = await profiles.findOne({ where: { user_id: user_id } });
            if(profile){
                //appends the raid name and id
                let additional_notes = JSON.parse(profile.additional_notes);
                additional_notes.push(note);

                //add the modified list back into the profile
                const affectedRows = await profiles.update({ additional_notes: JSON.stringify(additional_notes)}, { where: { user_id: user_id } });
                if (affectedRows > 0) {
                    message.channel.send(`Added a note to the user.`);
                    cmdLog(`Added a note to the user ${idToName(user_id,message.guild)} by ${message.author.tag}.`);
                } else {
                    message.channel.send(`Unknown Error.`);
                }
            } else {
                message.channel.send(`Error: Could not find user in the database.`);
            }
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `##addnote user (note)`');
        }
    }
}