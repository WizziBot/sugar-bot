module.exports = {
    name: 'removeprofile',
    accessLevel:4,
    description: "Removes a user's profile.",
    async execute(member,profiles){
        try{
            const profile = await profiles.findOne({ where: { user_id: member.id } });
            profile.destroy()
            // member.guild.channels.cache.find(ch => ch.name === 'profile-logging').send(`User ${member.user.tag} left the Library and was removed from the Profile System.`); 
        } catch(e){
            console.log(e);
            member.guild.channels.cache.find(ch => ch.name === 'profile-logging').send(`Could not remove ${member.user.tag} from the Profile System. Probably because they were not in the database.`);
        }
    }
}