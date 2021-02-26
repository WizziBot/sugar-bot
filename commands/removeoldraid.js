module.exports = {
    name: 'removeoldraid',
    accessLevel:4,
    description: "Removes a raid documentation permanently.",
    async execute(commandArgs,raids,storedRecData){
        try{
            const raidId = commandArgs;
            const raid = await raids.findOne({ where: { raid_id: raidId } });
            if(raid){
                console.log(raid)
                await raid.destroy()
                let jparsed = await storedRecData.findAll({ where: { raid_id: raidId } });
                console.log(jparsed)
                for(u = 0; u < jparsed.length; u++){
                    await jparsed[u].destroy()
                }
            }
        } catch(e){
            console.trace(e)
        }
    }
}