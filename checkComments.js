import cheerio from 'cheerio'

//always use lower case
const keywords = [
    'career',
    'karriere',
    'suchen',
    'job',
    'bewirb',
    'bewerb',
    'team',
    'dich',
    'beruf',
    'ausbild',
    'meld',
    'hire',
    'hiring',
    'schreib',
    'talent',
    'join'
]

const falsePositives = [
    'Es liegt in deiner Verantwortung, deine Besucher über die in deinem Blog verwendeten Cookies und die dort erfassten Daten zu informieren. Blogger stellt dafür eine Standardbenachrichtigung zur Verfügung, die du übernehmen, anpassen oder durch deine eigene Mitteilung ersetzen kannst. Weitere Informationen findest du unter http://www.blogger.com/go/cookiechoices.',
    'Es liegt in deiner Verantwortung, deine Besucher \xfcber die in deinem Blog verwendeten Cookies und die dort erfassten Daten zu informieren. Blogger stellt daf\xfcr eine Standardbenachrichtigung zur Verf\xfcgung, die du \xfcbernehmen, anpassen oder durch deine eigene Mitteilung ersetzen kannst. Weitere Informationen findest du unter http://www.blogger.com/go/cookiechoices.'
]

//sdf


export default function checkComments (context) {
    try {
        var $ = cheerio.load( `<root>${context.body}</root>`)
        
        var res = []
        $( "root" ).contents().each((i,el) =>  {
            if ( el.type === 'comment')
                if ( keywords.find( v => el.data.toLowerCase().includes(v)))
                    if(!falsePositives.includes(el.data.toLowerCase()))
                        res.push(el.data)
        })

        return res

    } catch (ex) {
        console.log(ex)
    }
}

/*
import got from 'got'
var res = await  got('https://www.hetzner.com/de/')
//var res = await  got('https://www.sueddeutsche.de')

console.log( checkComments(res.body))

*/