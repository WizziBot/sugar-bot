module.exports = {
    name: 'documentraid',
    accessLevel:3,
    description: "Takes the current raid and formats it for long term storage.",
    syntax:"##documentraid raid_id [description]",
    async execute(cmdLog,message,commandArgs,raids,profiles,currentRaids,getUserInfo,gData,al){
        try{
            const splitArgs = commandArgs.split(' ');
            const newraid_id = splitArgs.shift();
            const raidDesc = splitArgs.join(' ');
            if (!newraid_id){
                message.channel.send('Syntax: `##documentraid raid_id [description]`')
                return
            }
            //gets tha raid to document
            const raidToDoc = await currentRaids.findOne({ where: { raid_id : newraid_id } });
            const allprofiles = await profiles.findAll();
            if(raidToDoc){
                if(raidToDoc.guild_id === message.guild.id || al === 4){
                    let participants = []
                    for(let i = 0; i < allprofiles.length; i++){
                        const currId = allprofiles[i].dataValues.user_id;
                        const membData = message.guild.members.cache.find(dId => dId == currId);
                        if(getUserInfo(membData,gData).participant){
                            participants.push(membData.user.tag);
                            let found = JSON.parse(allprofiles[i].dataValues.raid_history)
                            if(found.length === 0){
                                let appendObj = {
                                    id: raidToDoc.raid_id,
                                    name: raidToDoc.name
                                };
                                let newprof = [appendObj];
                                await profiles.update({ raid_history: JSON.stringify(newprof)}, { where: { user_id: currId } });
                            } else {
                                let appendObj = {
                                    id: raidToDoc.raid_id,
                                    name: raidToDoc.name
                                };
                                let newprof = [appendObj,...found];
                                await profiles.update({ raid_history: JSON.stringify(newprof)}, { where: { user_id: currId } });
                            }
                        }
                    }
                    //creates the the raid
                    await raids.create({
                        raid_id: newraid_id,
                        name: raidToDoc.name,
                        guild_id: raidToDoc.guild_id,
                        start_date: raidToDoc.start_date,
                        end_date: new Date(),
                        recorded_data: raidToDoc.recorded_data,
                        description: raidDesc,
                        participants: JSON.stringify(participants),
                    });
                    raidToDoc.destroy()
                    cmdLog(`Documented ${raidToDoc.name} to the Raids Database.`);
                    message.channel.send(`Documented \`${raidToDoc.name}\` to the Raids Database.`);
                    message.member.guild.channels.cache.find(ch => ch.id === gData.announcment_channel).send(`Documented \`${raidToDoc.name}\` to the Raids Database.`);
                } else {
                    message.channel.send(`You can not edit that raid.`);
                }
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error. Please use the correct syntax: `##documentraid name start_date(00/00/0000) end_date(00/00/0000) [description]`');
        }
    }
}