const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const Sequelize = require('sequelize')
const fs = require('fs');
client.commands = new Discord.Collection();
const pkg = require('./package.json')
const config = require('./sugar.json')
const guildSetup = require('./guildSetup');
const { description } = require('./guildSetup');
//DATABASES INITIALIZATION

const sequelize = new Sequelize('sugar', 'root', 'Password...5', {
	host: 'localhost',
	dialect: 'mysql',
    logging: false
});
const guildsdata = sequelize.define('guildsdata', {
	guild_id: {
		type: Sequelize.STRING(18),
		unique: true
	},
	raid_history: {
		type: Sequelize.TEXT,
		allowNull: true
    },
    config: {
        type: Sequelize.TEXT,
        allowNull: true
    }
});
const currentRaids = sequelize.define('currentraids', {
	raid_id: {
		type: Sequelize.STRING(4),
        unique: true
	},
    name: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    guild_id: {
        type: Sequelize.STRING(18),
        allowNull: false
    },
	start_date: {
		type: Sequelize.DATE,
		allowNull: false
    },
});
const storedRecData = sequelize.define('storedrecdata', {
	raid_id: {
		type: Sequelize.STRING(4),
        unique: true
	},
    author: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    data: {
        type: Sequelize.STRING(1000),
        allowNull: false
    }
});
const raids = sequelize.define('raids', {
	raid_id: {
		type: Sequelize.STRING(4),
        unique: true
	},
    name: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    guild_id: {
        type: Sequelize.STRING(18),
        allowNull: false
    },
	start_date: {
		type: Sequelize.DATE,
		allowNull: false
    },
    end_date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(2000),
        allowNull:true
    },
    participants: {
        type: Sequelize.TEXT,
        allowNull:true
    },
});
const profiles = sequelize.define('profiles', {
	user_id: {
		type: Sequelize.STRING(18),
        unique: true
	},
	raid_history: {
		type: Sequelize.TEXT,
		allowNull: true
    },
    additional_notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
function getUserInfo(member,gConfig){
    let tempUserInfo = {
        trusted: false,
        participant: false,
        moderator: false,
        accessLevel: 0
    }
    if(member.roles.cache.find(role => role.name === gConfig.trusted)){tempUserInfo.trusted = true; tempUserInfo.accessLevel = 1}
    if(member.roles.cache.find(role => role.name === gConfig.raid_participant)){tempUserInfo.participant = true; tempUserInfo.accessLevel = 2}
    if(member.roles.cache.find(role => role.name === gConfig.moderator)){tempUserInfo.moderator = true; tempUserInfo.accessLevel = 3}
    for(i = 0; i < fullControl.length; i++){
        if (member.id === fullControl[i]){
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
function idToName(id,guild){
    try{
        let uName = guild.members.cache.find(id_c => id_c == id).user.tag;
        return uName
    } catch(e) {
        return id
    }
}

//EVENT LISTENERS
client.once('ready', async () => {
    //SYNC DATABASES
    profiles.sync();
    guildsdata.sync();
    raids.sync();
    currentRaids.sync();
    storedRecData.sync();
    //OTHER
    //client.user.setActivity(`##help (not a command yet)`);
    console.log('[READY]')
});

client.on("guildCreate", guild => {
    cmdLog(`Client has joined ${guild.name}`);
});

client.on('guildMemberAdd', async member => {
    if(member.user.bot){return}
    cmdLog(`Member ${member.user.tag} Joined`);
    const gData = await guildsdata.findOne({ where: { guild_id: member.guild.id } });
    if(gData){
        client.commands.get('addprofile').execute(cmdLog,JSON.parse(gData.config),member,profiles);
    }
});

client.on("guildMemberRemove", member => {
    if(member.user.bot){return}
    cmdLog(`Member ${member.user.tag} Left`);
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
        if (reaction.emoji.name === '\u2705' && reaction.message.id === '814811061693448213') { //if the user reacted with the right emoji
            const role = reaction.message.guild.roles.cache.find(r => r.name === 'Member'); //finds role you want to assign (you could also use .name instead of .id)

            const { guild } = reaction.message; //store the guild of the reaction in variable

            const member = guild.members.cache.find(member => member.id === user.id); //find the member who reacted (because user and member are seperate things)

            member.roles.add(role); //assign selected role to member
        }
    }
});
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
        let userInfo = getUserInfo(message.member,gData)
        cmdLog(`USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
        let cmdAccessLevel;
        if (client.commands.has(command)){
            cmdAccessLevel = client.commands.get(command).accessLevel;
        } else {
            cmdAccessLevel = 0;
        }
        if (command === 'forcejoin' || command === 'forcejoinall'){
            cmdAccessLevel = 4;
        }
        if (userInfo.accessLevel < cmdAccessLevel) {
            message.reply(`Insufficient Permission`).then(msg => {msg.delete({timeout:5000})})
            return
        }
        //Commands
        if (command === 'ping'){
            message.channel.send(`Latency is \`${message.createdTimestamp - Date.now()}\`ms. API Latency is \`${Math.round(client.ws.ping)}\`ms`);
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
        } else if(command === 'forcejoinall'){
            message.guild.members.cache.forEach(mbr => {
                try{
                    client.emit('guildMemberAdd', mbr);
                } catch(e){
                    console.trace(e)
                    cmdLog('Error while trying to forcejoin a user.')
                }
            })
        } else if (command === 'admin'){
            client.commands.get(command).execute(cmdLog,gData,message,fullControl,grantFullControl);
        } else if (command === 'addprofile'){
            client.commands.get(command).execute(cmdLog,gData,message.member,profiles);
        } else if (command === 'removeprofile'){
            client.commands.get(command).execute(message.member,profiles);
        } else if (command === 'recipe'){
            client.commands.get(command).execute(message,commandArgs);
        } else if (command === 'addraid'){
            client.commands.get(command).execute(cmdLog,message,commandArgs,profiles,raids,filterUserId,idToName);
        } else if (command === 'getlog'){
            client.commands.get(command).execute(message)
        } else if (command === 'startraid'){
            client.commands.get(command).execute(cmdLog,gData,message,commandArgs,currentRaids,raids);
        } else if (command === 'documentraid'){
            client.commands.get(command).execute(cmdLog,message,commandArgs,raids,profiles,currentRaids,getUserInfo,gData);
        } else if (command === 'removeraid'){
            client.commands.get(command).execute(message,commandArgs,currentRaids);
        } else if (command === 'removeoldraid'){
            client.commands.get(command).execute(message,commandArgs,raids);
        } else if (command === 'idtoname') {
            message.reply(idToName(commandArgs,message.guild));
        } else if (command === 'r') {
            client.commands.get(command).execute(message,currentRaids,storedRecData);
        } else if (command === 'rold') {
            client.commands.get(command).execute(message,raids);
        } else if (command === 'progress'){
            client.commands.get(command).execute(cmdLog,gData,message,commandArgs,currentRaids,storedRecData);
        }
    } catch(e) {
        console.trace(e)
    }
});

client.login('ODA4MDQzODg4MzA4MjU2Nzc4.YCAzgw.XAFFQPFtM85i8A2YQpZ9X1e4C18');