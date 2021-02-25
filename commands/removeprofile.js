module.exports = {
    name: 'removeprofile',
    accessLevel:4,
    description: "Removes a user's profile permanently.",
    async execute(member,profiles){
        try{
            const profile = await profiles.findOne({ where: { user_id: member.id } });
            if(profile){
                profile.destroy()
            }
        } catch(e){
            console.trace(e)
        }
    }
}