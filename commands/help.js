module.exports = {
    name: 'help',
    accessLevel:0,
    description: "##help (command)",
    syntax:"##help (command)",
    async execute(message,client,commandArgs,al){
        try{
            if(commandArgs){
                let command;
                client.commands.forEach(cmd => {
                    if(cmd.accessLevel <= al.accessLevel && cmd.name === commandArgs){
                        command = cmd
                    }
                });
                if(command){
                    const helpEmbed = {
                        color: 0x44ff00,
                        title: command.name.toUpperCase(),
                        description: `Syntax: \`${command.syntax}\``,
                        timestamp: new Date(),
                    };
                    message.channel.send({embed: helpEmbed})
                } else {
                    message.channel.send('Command does not exist.')
                }
            } else {
                let gNames = '';
                client.commands.forEach(cmd => {
                    if(cmd.accessLevel <= al.accessLevel){
                        gNames = `${gNames}[${cmd.name}] \`${cmd.description}\`\n`
                    }
                });
                const helpEmbed = {
                    color: 0x00ff99,
                    title: 'Commands (available to you)',
                    description: gNames,
                    timestamp: new Date(),
                };
                message.channel.send({embed: helpEmbed})
            }
        } catch(e){
            console.trace(e)
        }
    }
}