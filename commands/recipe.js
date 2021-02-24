module.exports = {
    name: 'recipe',
    accessLevel:0,
    description: "Returns recipe of minecraft item.",
    async execute(config,message,commandArgs){
        const mcData = require('minecraft-data')('1.16.5')
        try{
            let item = mcData.recipes[mcData.findItemOrBlockByName(commandArgs).id][0]
            let craftEmbed = {
                color: 0x0099ff,
                title: mcData.findItemOrBlockByName(commandArgs).displayName,
                fields: [],
                timestamp: new Date(),
            };
            for (i = 0; i < 3; i++){
                if(item.inShape[i]){
                    for (u = 0; u < 3; u++){
                        let itemName;
                        if(item.inShape[i][u]){
                            itemName =  mcData.findItemOrBlockById(item.inShape[i][u]).displayName
                        } else {
                            itemName = '-----'
                        }
                        craftEmbed.fields.push({
                            name: itemName,
                            value: '\u200b',
                            inline: true,
                        });
                    }
                }

            }
            message.channel.send({embed:craftEmbed})
        } catch(e){
            message.reply(`Please use the correct syntax: \`${config.prefix}recipe item_name\``);
        }
    }
}