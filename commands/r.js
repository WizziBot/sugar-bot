module.exports = {
    name: 'r',
    accessLevel:2,
    description: "Displays information on the current raid(s).",
    async execute(message,raids){
        try{
            //grabs data
            const raidsData = await raids.findAll();
            if(raidsData){
                for(i = 0; i < raidsData.length; i++){
                    let jparsed = JSON.parse(raidsData[i].dataValues.recorded_data)
                    let parsedRecorded = '';
                    if (jparsed.length !== 0){
                        for(u = 0; u < 5; u++){
                            const curjp = jparsed[jparsed.length - 1 - u]
                            if (curjp){
                                parsedRecorded = `${parsedRecorded}[${curjp}]\n`;
                            }
                        }
                    }
                    message.channel.send(`-----------------------\nName: ${raidsData[i].dataValues.name}\nStart Date: ${raidsData[i].dataValues.start_date}\nPast 5 information logs:\n${parsedRecorded}-----------------------`)
                }
            }
        } catch(e){
            console.trace(e)
            message.channel.send('Unknown Error.');
        }
    }
}