const Discord = require('discord.js');
const client = new Discord.Client();
const Sequelize = require('sequelize')
const fs = require('fs');
client.commands = new Discord.Collection();
const pkg = require('./package.json')
const config = require('./sugar.json')
//const mcData = require('minecraft-data')('1.16.5')
const guildSetup = require('./guildSetup')
//DATABASES INITIALIZATION

const sequelize = new Sequelize('sugar', 'root', 'Password...5', {
	host: 'localhost',
	dialect: 'mysql',
    logging: false
});
const guildsdata = sequelize.define('guildsdata', {
	guild_id: {
		type: Sequelize.STRING(18),
		unique: true,
	},
	raid_history: {
		type: Sequelize.TEXT,
		allowNull: true,
    },
    config: {
        type: Sequelize.TEXT,
        allowNull: true,
    }
});
const raids = sequelize.define('raids', {
	raid_id: {
		type: Sequelize.STRING(18),
        allowNull: false
	},
	start_date: {
		type: Sequelize.STRING(10),
		allowNull: true,
    },
    end_date: {
        type: Sequelize.STRING(10),
        allowNull: true,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});
const profiles = sequelize.define('profiles', {
	user_id: {
		type: Sequelize.STRING(18),
        unique: true,
	},
	raid_history: {
		type: Sequelize.TEXT,
		allowNull: true,
    },
    additional_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    sugar_guilds: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});
//VOLATILE VARIABLE INITIALIZATION
let fullControl = []

//DISCORD BOT
//collect commands from command folder
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
//functions
function getUserInfo(message,gConfig){
    let tempUserInfo = {
        trusted: false,
        participant: false,
        moderator: false,
        accessLevel: 0
    }
    if(message.member.roles.cache.find(role => role.name === gConfig.trusted)){tempUserInfo.trusted = true; tempUserInfo.accessLevel = 1}
    if(message.member.roles.cache.find(role => role.name === gConfig.raid_participant)){tempUserInfo.participant = true; tempUserInfo.accessLevel = 2}
    if(message.member.roles.cache.find(role => role.name === gConfig.moderator)){tempUserInfo.moderator = true; tempUserInfo.accessLevel = 3}
    for(i = 0; i < fullControl.length; i++){
        if (message.author.id === fullControl[i]){
            tempUserInfo.accessLevel = 4
        }
    }
    return tempUserInfo
}
function filterUserId(user_ping){
    let user_id = user_ping.slice('2','-1');
    if(user_id.startsWith('!') || user_id.startsWith('&')){
        user_id = user_id.slice('1');
    }
    return user_id;
}
function grantFullControl(fcu){
    fullControl.push(fcu)
}
function cmdLog(data){
    console.log(data)
    const currTime = new Date()
    fs.appendFile('./log.txt',`\n${data} ::: ${currTime}`,(err)=>{
        if (err) console.trace(err);
    })
}

//EVENT LISTENERS
client.once('ready', async () => {
    //SYNC DATABASES
    profiles.sync();
    guildsdata.sync();
    raids.sync();
    //OTHER
    //client.user.setActivity(`##help (not a command yet)`);
    console.log('[READY]')
});

client.on("guildCreate", guild => {
    cmdLog(`Client has joined ${guild.name}`);
});

client.on('guildMemberAdd', async member => {
    cmdLog(`Member ${member.user.tag} Joined`);
    const gData = await guildsdata.findOne({ where: { guild_id: member.guild.id } });
    if(gData){
        client.commands.get('addprofile').execute(cmdLog,JSON.parse(gData.config),member,profiles);
    }
});

client.on("guildMemberRemove", member => {
    cmdLog(`Member ${member.user.tag} Left`);
});

// client.on('messageReactionAdd', async (reaction, user) => {
//     if (reaction.partial) { //this whole section just checks if the reaction is partial
//         try {
//             await reaction.fetch(); //fetches reaction because not every reaction is stored in the cache
//         } catch (error) {
//             console.error('Fetching message failed: ', error);
//             return;
//         }
//     }
//     if (!user.bot) {
//         if (reaction.emoji.name === '\u2705' && reaction.message.id === '808044602342899754') { //if the user reacted with the right emoji

//             const role = reaction.message.guild.roles.cache.find(r => r.name === 'Member'); //finds role you want to assign (you could also use .name instead of .id)

//             const { guild } = reaction.message; //store the guild of the reaction in variable

//             const member = guild.members.cache.find(member => member.id === user.id); //find the member who reacted (because user and member are seperate things)

//             member.roles.add(role); //assign selected role to member

//         }
//     }
// });
//ON COMMAND HANDLER
client.on('message',async message => {
    try{
        //resolves command and args
        if(message.guild === null) return;
        if(!message.content.startsWith(config.prefix) || message.author.bot) return;
        const args = message.content.slice((config.prefix.length)).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const commandArgs = args.join(' ');
        //Gets guild config
        const gDataRaw = await guildsdata.findOne({ where: { guild_id: message.guild.id } });
        //GUILD SETUP IF NO GUILD DATA
        if(!gDataRaw){
            if(command === 'setup'){
                if(message.member.hasPermission('ADMINISTRATOR')){
                    guildSetup.execute(cmdLog,message,guildsdata,filterUserId)
                } else {
                    message.reply('Only an administrator can perform this.')
                }
            } else {
                message.reply('Sugar has not been setup on this server, ##setup to begin.')
            }
            return
        }
        const gData = JSON.parse(gDataRaw.config)
        //Gets user info
        let userInfo = getUserInfo(message,gData)
        cmdLog(`USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
        let cmdAccessLevel;
        if (client.commands.has(command)){
            cmdAccessLevel = client.commands.get(command).accessLevel;
        } else {
            cmdAccessLevel = 0;
        }
        if (userInfo.accessLevel < cmdAccessLevel) {
            message.reply(`Insufficient Permission`).then(msg => {msg.delete({timeout:5000})})
            return
        }
        //Commands
        if (command === 'ping'){
            message.channel.send(`Latency : \`${Math.round(message.client.ws.ping)}ms\``)
        } else if (command === 'help'){
            client.commands.get(command).execute(message)
        } else if(command === 'forcejoin'){
            try{
                const user_id = filterUserId(commandArgs)
                let forcejoin = message.guild.members.cache.get(user_id);
                client.emit('guildMemberAdd', forcejoin);
            } catch(e){
                console.trace(e)
                cmdLog('Error while trying to forcejoin a user.')
            }
        } else if (command === 'override'){
            let fcu = await client.commands.get(command).execute(cmdLog,gData,message,fullControl,grantFullControl)
        } else if (command === 'addprofile'){
            client.commands.get(command).execute(cmdLog,gData,message.member,profiles)
        } else if (command === 'removeprofile'){
            client.commands.get('removeprofile').execute(message.member,profiles);
        } else if(command === 'recipe'){
            client.commands.get(command).execute(gData,message,commandArgs)
        } else if(command === 'addraid'){
            client.commands.get(command).execute(cmdLog,gData,message.member,raids,filterUserId)
        } else if(command === 'getlog'){
            client.commands.get(command).execute(message)
        }
    } catch(e) {
        console.trace(e)
    }
});

client.login('ODA4MDQzODg4MzA4MjU2Nzc4.YCAzgw.XAFFQPFtM85i8A2YQpZ9X1e4C18');