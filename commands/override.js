module.exports = {
    name: 'override',
    accessLevel:0,
    description: "Grants system level access.",
    async execute(config,message){
        try{
            message.delete({timeout:0})
            message.user.send('Response')
        } catch(e){
            console.trace(e)
        }
    }
}