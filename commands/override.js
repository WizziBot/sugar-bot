module.exports = {
    name: 'profile',
    accessLevel:0,
    description: "Returns the user's profile information.",
    async execute(message){
        try{
            message.user.send('test')
        } catch(e){
            message.channel.send('Unknown Error. Please use the correct syntax: `-profile user`');
        }
    }
}