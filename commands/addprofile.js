
module.exports = {
    name: 'addprofile',
    accessLevel:3,
    async execute(member,profiles){
        try {
            var rh = [
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'}
            ];
            var an = [
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'},
                {sid:'None', value: 'None'}
            ];
            const user = await profiles.create({
                user_id: member.id,
                topic_history: JSON.stringify(th),
                additional_notes: JSON.stringify(an),
            });
        }
        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return member.guild.channels.cache.find(ch => ch.name === 'profile-logging').send(`User ${member.user.tag} already exists in the Profile System.`);
            }
            console.log(e);
            return member.guild.channels.cache.find(ch => ch.name === 'profile-logging').send(`Unknown Error ocurred while trying to add ${member.user.tag} to the Profile System.`);
        }
    }
}