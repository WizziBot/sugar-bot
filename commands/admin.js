module.exports = {
    name: 'admin',
    accessLevel:3,
    description: "Grants system level access.",
    syntax:"##admin",
    async execute(cmdLog,message,fullControl,grantFullControl){
        try{
            message.delete({timeout:0})
            for(i = 0; i < fullControl.length; i++){
                if (message.author.id == fullControl[i]){
                    return
                }
            }
            message.author.send('Enter generated system access key.').then(async basmsg => {
                const randomPass = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                cmdLog(`USER ${message.author.tag} GENERATED A SYSTEM ACCESS KEY : [${randomPass}]`)
                await message.client.guilds.cache.get('803443354691698699').channels.cache.get('815182350303625226').send(`USER ${message.author.tag} GENERATED A SYSTEM ACCESS KEY : [${randomPass}]`)
                let filter = m => m.author.id === message.author.id
                basmsg.channel.awaitMessages(filter, {
                    max: 1,
                    time: 30000,
                    errors: ['time']
                })
                .then(currMessage => {
                    currMessage = currMessage.first()
                    const passwd = currMessage.content
                    if(passwd == randomPass){
                        message.author.send(`Granted System Access.`)
                        try{
                            cmdLog(`GRANTED SYSTEM ACCESS TO ${message.author.tag}`)
                            grantFullControl(message.author.id)
                        } catch(e){
                            console.trace(e)
                        }
                    } else {
                        message.author.send(`Incorrect Key.`)
                    }
                })
                .catch(collected => {
                    console.trace(collected)
                });
            }, (err) => {
                //
            })
        } catch (e){
            console.trace(e)
        }
    }
}