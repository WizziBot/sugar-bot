module.exports = {
    name: 'removeoldraid',
    accessLevel:4,
    description: "Removes a raid documentation permanently.",
    async execute(commandArgs,raids){
        try{
            const raidId = commandArgs;
            const raid = await raids.findOne({ where: { raid_id: raidId } });
            if(raid){
                raid.destroy()
            }
        } catch(e){
            console.trace(e)
        }
    }
}