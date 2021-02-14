const Discord = require('discord.js');
const client = new Discord.Client();
const Sequelize = require('seqelize')
const fs = require('fs');
const PREFIX = "##";
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
    }
    if(message.member.roles.cache.find(role => role.name === config.roledata.trusted)){tempUserInfo.trusted = true}
    if(message.member.roles.cache.find(role => role.name === config.roledata.raid_participant)){tempUserInfo.participant = true}
    if(message.member.roles.cache.find(role => role.name === config.roledata.moderator)){tempUserInfo.moderator = true}
    return tempUserInfo
}

//EVENT LISTENERS
client.once('ready', async () => {
    //SYNC DATABASES
    profiles.sync();
    //OTHER
    client.user.setActivity(scrollArray[counter])
});

client.on("guildCreate", function(guild){
    console.log(`the client joins a guild`);
});

client.on('guildMemberAdd', member => {
    var currentTime = new Date();
    console.log(`Member ${member.user.tag} Joined at ${currentTime}`);
    client.commands.get('addprofile').execute(member, profiles);
});

client.on("guildMemberRemove", member => {
    var currentTime = new Date();
    console.log(`Member ${member.user.tag} Left at ${currentTime}`);
    client.commands.get('removeuser').execute(member, users);
    client.commands.get('removeprofile').execute(member, profiles);
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
        console.log('!user.bot completed');
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
        if(!message.content.startsWith(PREFIX) || message.author.bot) return;
        const preargs = message.content.slice((PREFIX.length)).trim().split(' ');
        const args = preargs.filter(function (el) {
            return el != '';
        });
        const command = args.shift().toLowerCase();
        const commandArgs = args.join(' ');
        //Gets user info
        let userInfo = getUserInfo(message)
    
        //commands

        if (client.commands.has(command)){
            
        }
    } catch(e) {
        console.trace(e)
    }
});

client.login('ODA4MDQzODg4MzA4MjU2Nzc4.YCAzgw.XAFFQPFtM85i8A2YQpZ9X1e4C18');