
module.exports = {
    name: 'addprofile',
    accessLevel:4,
    async execute(cmdLog,config,member,profiles){
        try {
            let rh = [];
            let an = [];
            let gl = [];
            profiles.create({
                user_id: member.id,
                raid_history: JSON.stringify(rh),
                additional_notes: JSON.stringify(an),
                sugar_guilds: JSON.stringify(gl)
            });
            cmdLog(`Created profile for user ${member.user.tag}`)
        }
        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return member.guild.channels.cache.find(ch => ch.name === config.admin_channel).send(`Failed to create a profile : user ${member.user.tag} already exists.`);
            }
            console.trace(e);
            return member.guild.channels.cache.find(ch => ch.name === config.admin_channel).send(`Unknown Error ocurred while trying to create a profile for ${member.user.tag}.`);
        }
    }
}