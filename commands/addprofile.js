module.exports = {
    name: 'addprofile',
    accessLevel:4,
    async execute(cmdLog,config,member,profiles){
        try {
            const ifexists = await profiles.findOne({ where: { user_id: member.id } })
            if (!ifexists){
                let rh = [];
                let an = [];
                let gl = [{
                    id: member.guild.id,
                    name: member.guild.name
                }];
                profiles.create({
                    user_id: member.id,
                    raid_history: JSON.stringify(rh),
                    additional_notes: JSON.stringify(an),
                    sugar_guilds: JSON.stringify(gl)
                });
                cmdLog(`Created profile for user ${member.user.tag}`)
            } else {
                let inguilds = JSON.parse(ifexists.sugar_guilds)
                for (i = 0; i < inguilds.length; i++){
                    if (inguilds[i].id === member.guild.id){
                        return
                    }
                }
                inguilds.push({
                    id: member.guild.id,
                    name: member.guild.name
                });
                await profiles.update({ sugar_guilds: JSON.stringify(inguilds)}, { where: { user_id: member.id } });
            }
        }
        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return member.guild.channels.cache.find(ch => ch.id === config.admin_channel).send(`Failed to create a profile : user ${member.user.tag} already exists.`);
            }
            console.trace(e);
            return member.guild.channels.cache.find(ch => ch.id === config.admin_channel).send(`Unknown Error ocurred while trying to create a profile for ${member.user.tag}.`);
        }
    }
}