import urlMod from 'url'
import {fetch, stream} from 'undici'
import { TextDecoderStream } from 'node:stream/web';
import {Readable} from 'node:stream';
import { finished } from 'node:stream/promises';
import ParserStream from 'parse5-parser-stream';
import { read } from 'fs';
import { WritableStream } from 'htmlparser2/lib/WritableStream.js'


const forbiddenDomains =  [
  /.*\.blogspot\.com/g,
  /.*\.pinterest\.com/g,
  /.*\.hotelmix\..*/g,
  /.*\.hotel-mix\..*/g,
  /.*\.ibooked\..*/g,
  /.*\.albooked\..*/g,
  /.*\.bookeder\..*/g,
  /.*\.booked\..*/g,
  /.*\.nochi\.com/g,
  /.*\.wordpress\.org/g
]

var hostname= "fasdfasdf.blogspot.com"
/*
if(forbiddenDomains.some( x=> hostname.match(x)))
  console.log('sdf') 



if(forbiddenDomains.some( hostname.match ))
    console.log('asdf')
*/
/*
let parser = new ParserStream()
parser.on('meta', ()=> {
  console.log('ASIUUHASUHFUH')
})
*/
const ps = new WritableStream({
  ontext(text) {
    //console.log(i)
    //i++;
    //console.log("Streaming:", text);
  },
  oncomment(comment){
    //console.log(comment)
  }
});
ps.on('close',()=>{console.log('feddich')})

let res = await fetch('https://sueddeutsche.de')
console.log(res.body)
//let res = await fetch('https://ishfwheuwhg.asduihsuf')
var readableNodeStream = Readable.fromWeb(res.body)
//let stream = res.body

//let readableNodeStream = Readable.fromWeb(textStream)

//readableNodeStream.pipeThrough(ps)
//await readableNodeStream.pipe(ps)
let asdf = readableNodeStream.pipe(ps)

asdf.on('close',()=> {
console.log('fertig')
})

//await promisify(asdf)

console.log('test')
await finished(asdf)
console.log('test3')

//let textStream = stream.pipeThrough(new TextDecoderStream());
//let textStream = stream.pipeThrough(new ParserStream())
//let readableNodeStream = Readable.fromWeb(textStream)
//readableNodeStream.setEncoding('utf-8')
//parser.pipe()
//let parseStream = stream.pipeThrough(parser)

//readableNodeStream.pipe(parser)
//textStream.pipe(ps)

for await (let chunk of readableNodeStream){
  //parser.write(chunk,(err)=>{ console.log('error'); console.log(err) })
  //ps.write(chunk)
  console.log(chunk)
  //break
}


/*
var obj4 = urlMod.parse("http://asdf.de")
var obj1 = urlMod.parse("http://asdf.de/")
var obj2 = urlMod.parse("http://asdf.de/asdf")
var obj3 = urlMod.parse("http://asdf.de/asdf/")

console.log(obj1)
console.log(obj2)
console.log(obj3)
console.log(obj4)
*/