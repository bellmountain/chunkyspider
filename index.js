import supercrawler from 'supercrawler'
import checkComments from './checkComments.js'
import linkParser from './linkParsernew.js'
import fs from 'fs'


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

// 1. Create a new instance of the Crawler object, providing configuration
// details. Note that configuration cannot be changed after the object is
// created.
var crawler = new supercrawler.Crawler({
  // By default, Supercrawler uses a simple FIFO queue, which doesn't support
  // retries or memory of crawl state. For any non-trivial crawl, you should
  // create a database. Provide your database config to the constructor of
  // DbUrlList.

  urlList: new supercrawler.RedisUrlList({
    redis: {
      host: "127.0.0.1"
    }
  }),

  // Tme (ms) between requests
  interval: 10,
  // Maximum number of requests at any one time.
  concurrentRequestsLimit: 100,
  // Time (ms) to cache the results of robots.txt queries.
  robotsCacheTime: 3600000,
  // Query string to use during the crawl.
  userAgent: "Mozilla/5.0 (compatible; supercrawler/1.0; +https://github.com/brendonboshell/supercrawler)",
  // Custom options to be passed to request.
  request: {
    headers: {
      'accept-language': 'de,de-DE;q=0.8,en;q=0.6'
    }
  }
});


// Get "Sitemaps:" directives from robots.txt
//crawler.addHandler(supercrawler.handlers.robotsParser());

// Crawl sitemap files and extract their URLs.
//crawler.addHandler(supercrawler.handlers.sitemapsParser());

crawler.addHandler("text/html", function (context) {
  var sizeKb = Buffer.byteLength(context.body) / 1024;
  console.log("Processed", context.url, "Size=", sizeKb, "KB");
  var comments = checkComments(context)
  if (comments.length) {
    fs.appendFileSync('./results.txt', `${context.url}:${comments.join()}\n`)
    console.log(comments.join())
  }


});


//Pick up <a href> links from HTML documents
crawler.addHandler("text/html", linkParser(null,forbiddenDomains,1));

// Match an array of content-type
//crawler.addHandler(["text/plain", "text/html"], myCustomHandler);

// Custom content handler for HTML pages.
try {
crawler.getUrlList()
  //.insertIfNotExists(new supercrawler.Url('https://www.hetzner.com/'))
  //.insertIfNotExists(new supercrawler.Url('https://sueddeutsche.de/'))
  //.insertIfNotExists(new supercrawler.Url("https://www.gelbeseiten.de/branchenbuch/branche/Webdesign"))
  .insertIfNotExists(new supercrawler.Url('https://sueddeutsche.de/'))
  //.insertIfNotExists(new supercrawler.Url("https://www.chip.de/"))
  .then(function () {
    return crawler.start();
  });

} catch (ex) { console.log(ex) }