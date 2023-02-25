module.exports = {
    name: 'sugarlegions',
    accessLevel:1,
    description: "Displays servers that sugar is on.",
    async execute(message){
        try{
            let gNames = '';
            let counter = 1;
            message.client.guilds.cache.forEach(g => {
                if (g.name != 'Sugar test'){
                    gNames = `${gNames}[${counter}] \`${g.name}\`\n`
                    counter++
                }
            })
            const guildsEmbed = {
                color: 0x00ff00,
                title: 'Sugar Guilds',
                description: gNames,
                timestamp: new Date(),
            };
            if (gNames !== ''){
                message.channel.send({embed:guildsEmbed})
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error.');
        }
    }
}