module.exports = {
    name: 'removeraid',
    accessLevel:4,
    description: "Removes a current raid permanently.",
    syntax:"##removeraid raid_id",
    async execute(commandArgs,raids,storedRecData){
        try{
            const raidId = commandArgs;
            const raid = await raids.findOne({ where: { raid_id: raidId } });
            if(raid){
                await raid.destroy()
                let jparsed = await storedRecData.findAll({ where: { raid_id: raidId } });
                for(u = 0; u < jparsed.length; u++){
                    await jparsed[u].destroy()
                }
            }
        } catch(e){
            console.trace(e)
        }
    }
}