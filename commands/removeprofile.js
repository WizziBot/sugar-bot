module.exports = {
    name: 'removeprofile',
    accessLevel:4,
    description: "Removes a user's profile permanently.",
    syntax:"##removeprofile user",
    async execute(message,commandArgs,profiles){
        try{
            const member = message.guild.members.cache.get(commandArgs)
            if(member){
                const profile = await profiles.findOne({ where: { user_id: member.id } });
                if(profile){
                    profile.destroy()
                }
            }
        } catch(e){
            console.trace(e)
        }
    }
}