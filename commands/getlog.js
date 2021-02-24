module.exports = {
    name: 'getlog',
    accessLevel:3,
    description: "Returns the log.",
    async execute(message){
        message.author.send({ files: ["./log.txt"] }).then((success) => {
            //
        },(err) => {
            message.reply(`Unable to DM. You may have \`Allow direct messages from server members\` turned off.`)
        })
    }
}