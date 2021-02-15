
module.exports = {
    name: 'addprofile',
    accessLevel:4,
    async execute(config,member,profiles){
        try {
            let rh = [];
            let an = [];
            profiles.create({
                user_id: member.id,
                topic_history: JSON.stringify(rh),
                additional_notes: JSON.stringify(an),
            });
            let currDate = new Date()
            console.log(`Created profile for user ${member.user.tag} at ${currDate}`)
        }
        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return member.guild.channels.cache.find(ch => ch.name === config.admin_channel).send(`Profile for user ${member.user.tag} already exists.`);
            }
            console.log(e);
            return member.guild.channels.cache.find(ch => ch.name === config.admin_channel).send(`Unknown Error ocurred while trying to add ${member.user.tag} to the Profile System.`);
        }
    }
}