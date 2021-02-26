module.exports = {
    name: 'sugarlegions',
    accessLevel:2,
    description: "Displays servers that sugar is on.",
    async execute(message){
        try{
            let gNames = '';
            message.client.guilds.cache.forEach(g => {
                gNames = `${gNames}${counter} : ${g.name}`  
            })                
            message.channel.send(`-----------------------\n${gNames}\n-----------------------`)
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error.');
        }
    }
}