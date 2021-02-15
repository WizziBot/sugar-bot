const Discord = require('discord.js');
const client = new Discord.Client();
const Sequelize = require('seqelize')
const fs = require('fs');
client.commands = new Discord.Collection();
const pkg = require('./package.json')
const config = require('./sugar.json')
//DATABASES INITIALIZATION

const sequelize = new Sequelize('sugar', 'root', 'Password...5', {
	host: 'localhost',
	dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
const guildsdata = sequelize.define('guildsdata', {
	guild_id: {
		type: Sequelize.STRING(18),
		unique: true,
	},
	raid_history: {
		type: Sequelize.STRING,
		allowNull: true,
    },
    additional_notes: {
        type: Sequelize.STRING,
        allowNull: true,
    }
});
const raids = sequelize.define('raids', {
	raid_id: {
		type: Sequelize.STRING(18),
        allowNull: false
	},
	start_date: {
		type: Sequelize.STRING,
		allowNull: true,
    },
    end_date: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
const profiles = sequelize.define('profiles', {
	user_id: {
		type: Sequelize.STRING(18),
        unique: true,
	},
	raid_history: {
		type: Sequelize.STRING,
		allowNull: true,
    },
    additional_notes: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    sugar_guilds: {
        type: Sequelize.STRING,
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
function getUserInfo(message){
    let tempUserInfo = {
        trusted: false,
        participant: false,
        moderator: false,
        accessLevel: 0
    }
    if(message.member.roles.cache.find(role => role.name === config.roledata.trusted)){tempUserInfo.trusted = true; tempUserInfo.accessLevel = 1}
    if(message.member.roles.cache.find(role => role.name === config.roledata.raid_participant)){tempUserInfo.participant = true; tempUserInfo.accessLevel = 2}
    if(message.member.roles.cache.find(role => role.name === config.roledata.moderator)){tempUserInfo.moderator = true; tempUserInfo.accessLevel = 3}
    return tempUserInfo
}
function filterUserId(user_ping){
    let user_id = user_ping.slice('2','-1');
    if(user_id.startsWith('!')){
        user_id = user_id.slice('1');
    }
    return user_id;
}

//EVENT LISTENERS
client.once('ready', async () => {
    //SYNC DATABASES
    profiles.sync();
    guildsdata.sync();
    raids.sync();
    //OTHER
    client.user.setActivity(`##help`);
});

client.on("guildCreate", guild => {
    let currDate = new Date()
    console.log(`Client has joined ${guild.name} at ${currDate}`);
});

client.on('guildMemberAdd', member => {
    let currentTime = new Date();
    console.log(`Member ${member.user.tag} Joined at ${currentTime}`);
    client.commands.get('addprofile').execute(config,member,profiles);
});

client.on("guildMemberRemove", member => {
    let currentTime = new Date();
    console.log(`Member ${member.user.tag} Left at ${currentTime}`);
    client.commands.get('removeprofile').execute(config,member,profiles);
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
        const preargs = message.content.slice((config.prefix.length)).trim().split(' ');
        const args = preargs.filter(function (el) {
            return el != '';
        });
        const command = args.shift().toLowerCase();
        const commandArgs = args.join(' ');
        //Gets user info
        let userInfo = getUserInfo(message)
        let cmdAccessLevel;
        if (client.commands.has(command)){
            cmdAccessLevel = client.commands.get(command).accessLevel;
        } else {
            cmdAccessLevel = 0;
        }
        if (userInfo.accessLevel < cmdAccessLevel) {
            message.channel.send(`Command requires a higher Access Level`).then(msg => {msg.delete({timeout:5000})})
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
                console.log('Error while trying to forcejoin a user.')
            }
        } else if (command === 'override'){
            //
        } else if (command === 'addprofile'){
            client.commands.get(command).execute(config,message.member,profiles)
        }
    } catch(e) {
        console.trace(e)
    }
});

client.login('ODA4MDQzODg4MzA4MjU2Nzc4.YCAzgw.XAFFQPFtM85i8A2YQpZ9X1e4C18');