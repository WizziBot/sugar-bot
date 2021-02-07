const Discord = require('discord.js');
const client = new Discord.Client();
const delay = require('delay');
const fs = require('fs');
const PREFIX = "##";
client.commands = new Discord.Collection();
const msgId = '808044602342899754';
//DISCORD BOT

//collect commands from command folder
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', async () => {
    client.guilds.cache.forEach(guild =>{
        guild.channels.cache.find(ch => ch.name === 'krashr').send('[ONLINE]')
    })
    console.log(`[SUGAR IS ONLINE]`);
    const cane = await client.guilds.fetch('803443354691698699');
    const channel = cane.channels.cache.get('808039351229218837');
    const msg = await channel.messages.fetch(msgId)
    reac = msg.reactions.cache
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) { //this whole section just checks if the reaction is partial
        try {
            await reaction.fetch(); //fetches reaction because not every reaction is stored in the cache
        } catch (error) {
            console.error('Fetching message failed: ', error);
            return;
        }
    }
    if (!user.bot) {
        if (reaction.emoji.name === '\u2705') { //if the user reacted with the right emoji

            const role = reaction.message.guild.roles.cache.find(r => r.id === '803617192818114601'); //finds role you want to assign (you could also user .name instead of .id)

            const { guild } = reaction.message //store the guild of the reaction in variable

            const member = guild.members.cache.find(member => member.id === user.id); //find the member who reacted (because user and member are seperate things)

            member.roles.add(role); //assign selected role to member

        }
    }
})

client.on('message',async message => {
    try{
        //resolves command and args
        if(message.guild === null) return;
        if(!message.content.startsWith(PREFIX) || message.author.bot) return;
        if(!message.member.roles.cache.find(role => role.name === "Krashr Mod")) return
        if(message.channel.name !== "krashr" && message.channel.name !== "krashr-chat-logger") return;
        const preargs = message.content.slice((PREFIX.length)).trim().split(' ');
        const args = preargs.filter(function (el) {
            return el != '';
        });
        const command = args.shift().toLowerCase();
        const commandArgs = args.join(' ');
    
        //commands

        if (command === 't'){
            const cane = await client.guilds.fetch('803443354691698699');
            const channel = cane.channels.cache.get('808039351229218837');
            console.log(channel)
        }
    } catch(e) {
        console.trace(e)
    }
});

client.login('ODA4MDQzODg4MzA4MjU2Nzc4.YCAzgw.XAFFQPFtM85i8A2YQpZ9X1e4C18');