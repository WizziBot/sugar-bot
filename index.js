const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const Sequelize = require('sequelize')
const fs = require('fs');
client.commands = new Discord.Collection();
const pkg = require('./package.json')
const config = require('./sugar.json')
const guildSetup = require('./guildSetup');
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
        allowNull: false
	},
    author: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    data: {
        type: Sequelize.STRING(1000),
        allowNull: false
    },
    date : {
        type: Sequelize.DATE,
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
//VOLATILE GLOBAL VARIABLE INITIALIZATION
let fullControl = []
let adminChatChannels = new Map()
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
        accessLevel: 0,
        prefix:''
    }
    if(member.roles.cache.find(role => role.id === gConfig.trusted)){tempUserInfo.trusted = true; tempUserInfo.accessLevel = 1; tempUserInfo.prefix = '[T]'}
    if(member.roles.cache.find(role => role.id === gConfig.raid_participant)){tempUserInfo.participant = true; tempUserInfo.accessLevel = 2; tempUserInfo.prefix = '[P]'}
    if(member.roles.cache.find(role => role.id === gConfig.moderator) || member.hasPermission('ADMINISTRATOR')){tempUserInfo.moderator = true; tempUserInfo.accessLevel = 3; tempUserInfo.prefix = '[M]'}
    for(i = 0; i < fullControl.length; i++){
        if (member.id === fullControl[i]){
            tempUserInfo.accessLevel = 4
        }
    }
    return tempUserInfo
}
function filterUserId(user_ping){
    if(user_ping.endsWith('>')){
        let user_id = user_ping.slice('2','-1');
        if(user_id.startsWith('!') || user_id.startsWith('&') || user_id.startsWith('#')){
            user_id = user_id.slice('1');
        }
        return user_id;   
    }
    return user_ping
}
function grantFullControl(fcu){
    fullControl.push(fcu)
    setTimeout(()=>{
        fullControl.shift()
    },120000)
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
function nameToId(name,guild){
    try{
        let uName = guild.members.cache.find(id_c => id_c == id).user.tag;
        return uName
    } catch(e) {
        return 'No Results.'
    }
}
async function adminChatInit(){
    adminChatChannels = new Map()
    const allGuilds = await guildsdata.findAll();
    for (i = 0; i < allGuilds.length; i++){
        try{
            const currGuild = allGuilds[i].dataValues;
            adminChatChannels.set(currGuild.guild_id,JSON.parse(currGuild.config).admin_chat);
        } catch(e){
            console.trace(e)
        }
    }
}
function acRelay(message){
    let attachments = []
    message.attachments.forEach(at => {
        attachments.push(at.url)
    });
    adminChatChannels.forEach(async (cid,gid) => {
        try{
            const acChannel = client.guilds.cache.get(gid).channels.cache.get(cid)
            if(acChannel && cid !== message.channel.id){
                const webhooks = await acChannel.fetchWebhooks();
                if (webhooks.size === 0){
                    acChannel.createWebhook('ACBOT', {
                        avatar: 'https://i.imgur.com/wSTFkRM.png',
                    }).then(webhook => {
                        webhook.send({
                            username: `[${message.guild.name}] ${message.member.displayName}`,
                            avatarURL: message.author.avatarURL(),
                            content: message.content,
                            files: attachments
                        });
                    })
                } else {
                    const webhook = webhooks.first();
                    await webhook.send({
                        username: `[${message.guild.name}] ${message.member.displayName}`,
                        avatarURL: message.author.avatarURL(),
                        content: message.content,
                        files: attachments
                    });
                }
            }
        } catch(e) {
            //
        }
    })
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
    adminChatInit() //Gets all the admin chat info
    client.user.setActivity(`##help`);
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
        if (reaction.emoji.name === '\u2705' && reaction.message.id === '815572072478146561') { //if the user reacted with the right emoji
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
        if(message.author.bot) return;
        //checks if admin chat msg
        const adminChatChannel = adminChatChannels.get(message.guild.id)
        if(adminChatChannel === message.channel.id){
            acRelay(message)
            return
        }
        //resolves command and args
        if(message.guild === null) return;
        if(!message.content.startsWith(config.prefix)) return;
        const args = message.content.slice((config.prefix.length)).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const commandArgs = args.join(' ');
        //Gets guild config
        const gDataRaw = await guildsdata.findOne({ where: { guild_id: message.guild.id } });
        //GUILD SETUP IF NO GUILD DATA
        if(!gDataRaw){
            if(command === 'setup'){
                if(message.member.hasPermission('ADMINISTRATOR')){
                    guildSetup.execute(cmdLog,message,guildsdata,filterUserId,adminChatInit)
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
        let cmdAccessLevel;
        if (client.commands.has(command)){
            cmdLog(`[${message.guild.name}] USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
            cmdAccessLevel = client.commands.get(command).accessLevel;
        } else {
            cmdAccessLevel = 0;
        }
        if (command === 'forcejoin' || command === 'forcejoinall' || command === 'updateconfig'){
            if(message.member.hasPermission('ADMINISTRATOR')){
                cmdAccessLevel = 3;
            } else {
                cmdAccessLevel = 4;
            }
            
        }
        if (userInfo.accessLevel < cmdAccessLevel) {
            message.reply(`Insufficient Permission`).then(msg => {msg.delete({timeout:5000})})
            return
        }
        //Commands
        if (command === 'ping'){
            cmdLog(`[${message.guild.name}] USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
            message.channel.send(`Latency is \`${Date.now() - message.createdTimestamp}\`ms. API Latency is \`${Math.round(client.ws.ping)}\`ms`);
        } else if (command === 'help'){
            client.commands.get(command).execute(message,client,commandArgs,userInfo)
        } else if(command === 'forcejoin'){
            cmdLog(`[${message.guild.name}] USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
            try{
                const user_id = filterUserId(commandArgs)
                const forcejoin = message.guild.members.cache.get(user_id);
                if(forcejoin){
                    client.emit('guildMemberAdd', forcejoin);
                }
            } catch(e){
                console.trace(e)
                cmdLog('Error while trying to forcejoin a user.')
            }
        } else if(command === 'forcejoinall'){
            cmdLog(`[${message.guild.name}] USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
            message.guild.members.cache.forEach(mbr => {
                try{
                    client.emit('guildMemberAdd', mbr);
                } catch(e){
                    console.trace(e)
                    cmdLog('Error while trying to forcejoin a user.')
                }
            })
        } else if (command === 'admin'){
            client.commands.get(command).execute(cmdLog,message,fullControl,grantFullControl,adminChatInit);
        } else if (command === 'profile'){
            //client.commands.get(command).execute(message,client,commandArgs,profiles,filterUserId);
        } else if (command === 'removeprofile'){
            client.commands.get(command).execute(message.member,profiles);
        } else if (command === 'recipe'){
            client.commands.get(command).execute(message,commandArgs);
        } else if (command === 'forceaddraid'){
            client.commands.get(command).execute(cmdLog,message,commandArgs,profiles,raids,filterUserId,idToName);
        } else if (command === 'getlog'){
            client.commands.get(command).execute(message)
        } else if (command === 'startraid'){
            client.commands.get(command).execute(cmdLog,gData,message,commandArgs,currentRaids,raids);
        } else if (command === 'documentraid'){
            client.commands.get(command).execute(cmdLog,message,commandArgs,raids,profiles,currentRaids,getUserInfo,gData,userInfo.accessLevel);
        } else if (command === 'removeraid'){
            client.commands.get(command).execute(commandArgs,currentRaids,storedRecData);
        } else if (command === 'removeoldraid'){
            client.commands.get(command).execute(commandArgs,raids,storedRecData);
        } else if (command === 'idtoname') {
            cmdLog(`[${message.guild.name}] USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
            message.reply(idToName(commandArgs,message.guild));
        } else if (command === 'nametoid') {
            cmdLog(`[${message.guild.name}] USER [${message.member.user.tag}] : [${userInfo.accessLevel}] EXECUTED [${command}]`)
            message.reply(nameToId(commandArgs,message.member));
        } else if (command === 'r') {
            client.commands.get(command).execute(message,commandArgs,currentRaids,storedRecData,userInfo);
        } else if (command === 'rold') {
            client.commands.get(command).execute(message,raids);
        } else if (command === 'progress'){
            client.commands.get(command).execute(cmdLog,gData,message,commandArgs,currentRaids,storedRecData,userInfo);
        } else if (command === 'sugarlegions'){
            client.commands.get(command).execute(message);
        } else if (command === 'updateconfig'){
            client.commands.get(command).execute(cmdLog,message,guildsdata,filterUserId,adminChatInit);
        } else if (command === 'plogs'){
            //
        } else if (command === 't'){
            //
        }
    } catch(e) {
        console.trace(e)
    }
});

client.login('ODA4MDQzODg4MzA4MjU2Nzc4.YCAzgw.xfTXogT3tcD_2dP21cRkxhbY3m8');