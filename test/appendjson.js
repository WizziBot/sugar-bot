const fs = require('fs')

fs.readFile('./testjson.json', (err,data) => {
    let parsedData = JSON.parse(data.toString())
    console.log(parsedData)
    let newitem = {
        id:80808,
        data:"aaaasdaetgwa"
    }
    parsedData.push(newitem)
    fs.writeFile('./testjson.json',JSON.stringify(parsedData), (err) => {
        if (err) throw err;
        console.log('Yes')
    })
})
