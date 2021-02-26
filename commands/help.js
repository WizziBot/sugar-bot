module.exports = {
    name: 'help',
    accessLevel:0,
    description: "Displays this list.",
    async execute(message,client,al){
        try{
            let gNames = '';
            client.commands.forEach(cmd => {
                if(cmd.accessLevel <= al.accessLevel){
                    gNames = `${gNames}[${cmd.name}] \`${cmd.description}\`\n`
                }
            });
            const helpEmbed = {
                color: 0x00ff99,
                title: 'Commands',
                description: gNames,
                timestamp: new Date(),
            };
            message.channel.send({embed: helpEmbed})
        } catch(e){
            console.trace(e)
        }
    }
}