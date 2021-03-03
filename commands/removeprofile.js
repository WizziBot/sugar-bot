module.exports = {
    name: 'removeprofile',
    accessLevel:4,
    description: "Removes a user's profile permanently.",
    syntax:"##removeprofile user",
    async execute(cmdLog,config,member,profiles){
        try{
            if(member){
                const profile = await profiles.findOne({ where: { user_id: member.id } });
                let inguilds = JSON.parse(profile.sugar_guilds)
                for (i = 0; i < inguilds.length; i++){
                    if (inguilds[i].id === member.guild.id){
                        inguilds.splice(i,1)
                    }
                }
                if(inguilds.length === 0){
                    const bk_rh = profile.raid_history;
                    const bk_an = profile.additional_notes;
                    await profile.destroy()
                    setTimeout(async () => {
                        try{
                            const newprofile = await profiles.findOne({ where: { user_id: member.id } });

                            if (newprofile){
                                await profiles.update({ raid_history: bk_rh, additional_notes: bk_an}, { where: { user_id: member.id } });
                                cmdLog(`User ${member.user.tag} rejoined and their profile data was restored.`)
                                member.guild.channels.cache.find(ch => ch.id === config.admin_channel).send(`User \`${member.user.tag}\`'s profile data was restored.`);
                            }
                        } catch (e){
                            console.trace(e)
                        }
                    },300000)
                    member.guild.channels.cache.find(ch => ch.id === config.admin_channel).send(`User \`${member.user.tag}\` left all Sugarlegions and their profile will be deleted in 5 minutes unless they return.`);
                    cmdLog(`User ${member.user.tag} left all Sugarlegions.`)
                } else {
                    profiles.update({ sugar_guilds: JSON.stringify(inguilds)}, { where: { user_id: member.id } });
                }
            }
        } catch(e){
            console.trace(e)
        }
    }
}