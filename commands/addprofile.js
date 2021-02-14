
module.exports = {
    name: 'addprofile',
    accessLevel:4,
    async execute(member,profiles){
        try {
            let rh = [];
            let an = [];
            const user = await profiles.create({
                user_id: member.id,
                topic_history: JSON.stringify(rh),
                additional_notes: JSON.stringify(an),
            });
            let currDate = new Date()
            console.log(`Created profile for user ${member.user.tag} at ${currDate}`)
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