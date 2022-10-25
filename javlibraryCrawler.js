var supercrawler = require("./lib/supercrawler"),
    htmlLinkParserRegex = require('./htmlLinkParserRegex'),
    processVideo = require('./processVideo'),
    getHeaders = require('./getCFHeaders'),
    createSession = require('./createSession'),
    getVideoDetail = require('./getVideoDetail2')

//parse arguments
var args = process.argv.slice(2),
    regex,startUrl,db

switch (args[0]){
  case 'all': 
    regex = /http:\/\/www\.javlibrary\.com\/en\/.*/
    startUrl = 'http://www.javlibrary.com/en/'
    db = 0
    break
  case 'categories':
    regex = /(http:\/\/www\.javlibrary\.com\/en\/\?v=(.*))|((http:\/\/www\.javlibrary\.com\/en\/vl_genre\.php\?(\&mode=(.*))?g=(.*))(\&page=(\d)?)?)/
    startUrl = 'http://www.javlibrary.com/en/genres.php'
    db = 0
    break
  case 'new':
    regex = /(http:\/\/www\.javlibrary\.com\/en\/\?v=(.*))|((http:\/\/www\.javlibrary\.com\/en\/vl_newentries\.php(\?)?(\&mode=(.*))?)(\&page=(\d)?)?)/
    startUrl = 'http://www.javlibrary.com/en/vl_newentries.php'
    db = 1
    break
  case 'best':
    regex = /(http:\/\/www\.javlibrary\.com\/en\/\?v=(.*))|((http:\/\/www\.javlibrary\.com\/en\/vl_bestrated\.php(\?)?(\&mode=(.*))?)(\&page=(\d)?)?)/
    startUrl = 'http://www.javlibrary.com/en/vl_bestrated.php'
    db = 2
    break
  default:
    regex = /(http:\/\/www\.javlibrary\.com\/en\/\?v=(.*))|((http:\/\/www\.javlibrary\.com\/en\/vl_genre\.php\?(\&mode=(.*))?g=(.*))(\&page=(\d)?)?)/
    startUrl = 'http://www.javlibrary.com/en/genres.php'
    db = 0
}

//if starturl is explicitly given, overwrite defaults
if(args[1])
  startUrl = args[1]

// 1. Create a new instance of the Crawler object, providing configuration
// details. Note that configuration cannot be changed after the object is
// created.
var crawler = new supercrawler.Crawler({
  urlList: new supercrawler.RedisUrlList({
    redis: {
      host: "127.0.0.1",
      db: db
    }
  }),
  // Tme (ms) between requests
  interval: 1000,
  // Maximum number of requests at any one time.
  concurrentRequestsLimit: 1,
  // Time (ms) to cache the results of robots.txt queries.
  robotsCacheTime: 3600000,
  // Query string to use during the crawl.
  // Custom options to be passed to request.
  request: {
    //headers: getHeaders()
    //headers: {
    //  'x-custom-header': 'example'
    //}
  }
});

// Get "Sitemaps:" directives from robots.txt
//crawler.addHandler(supercrawler.handlers.robotsParser());

// Pick up <a href> links from HTML documents
crawler.addHandler("text/html", htmlLinkParserRegex( regex ));


// Custom content handler for HTML pages.
crawler.addHandler("text/html", async function (context) {
    try {
        console.log(context.url)
        //console.log(context)
        //console.log(context.body.toString('utf-8'))
        var regex = /http:\/\/www\.javlibrary\.com\/en\/\?v=(.*)/
        
        var match = context.url.match(regex)

        if(match) {
            var id = match[1]
            console.log('processing: ' + id)
            //pause crawler while processing so not too many tasks get spawned
            crawler.stop()

            var video = getVideoDetail(context.body,id)
            await processVideo(video)
            crawler.start()
        } 

    } catch(ex) {
        console.log(ex)
    }
});

crawler.on('crawledurl',async (url,error,status)=>{
  if (error === 'HANDLERS_ERROR') {
    console.log('cloudflare session finished URL:' + url)
    await reStart()
  }
})

crawler.on("handlersError", function (err) {
  console.log('handlerserrror')
  console.log(err);
});

async function setSession () {
  var headers = await getHeaders()
  crawler._request.headers = headers
  createSession}

async function start(){
    console.log('start')
    await createSession()
    await setSession()
    return crawler.start()
}

async function reStart(){
  crawler.stop()
  await start()
}

async function newSession() {
  await createSession()
  await setSession()
}


(async () => {
  await crawler.getUrlList().insertIfNotExists(new supercrawler.Url(startUrl))
  await start()
  //create a new session every 20 mins
  setInterval(newSession, 1000 * 60 * 20)

  //crawler.start()
})();