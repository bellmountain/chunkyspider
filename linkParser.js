import cheerio from 'cheerio'
import urlMod  from 'url'

export default function (opts) {
  if (!opts) {
    opts = {};
  }
  /*
  if (!opts.urlFilter) {
    opts.urlFilter = function () {
      return true;
    };
  }
  */

  return function (context) {
    var contextUrlObj = urlMod.parse(context.url),
        isBaseUrl =  contextUrlObj.path === '/',
        $ = cheerio.load(context.body)
    //    $ = context.$ || cheerio.load(context.body)
    
    var lang = $('html').attr('lang')

    if ((lang !== 'de')  && (lang !== 'de-DE'))
      return null

    //context.$ = $;

    return $("a[href], link[href][rel=alternate], area[href]").map(function () {
      var $this,
          targetHref,
          absoluteTargetUrl,
          urlObj,
          protocol,
          hostname;

      $this = $(this);
      targetHref = $this.attr("href");
      absoluteTargetUrl = urlMod.resolve(context.url, targetHref);
      urlObj = urlMod.parse(absoluteTargetUrl);
      protocol = urlObj.protocol;
      hostname = urlObj.hostname;

      if (protocol !== "http:" && protocol !== "https:") {
        return null;
      }


      /*
      // Restrict links to a particular group of hostnames.
      if (typeof opts.hostnames !== "undefined") {
        if (opts.hostnames.indexOf(hostname) === -1) {
          return null;
        }
      }
      ///////////////// 
      */ 
      //console.log(contextUrlObj)
      //console.log(urlObj)    
      
      //new baseUrl found, 
      if(contextUrlObj.host !== urlObj.host)
        return urlMod.format({
          protocol: urlObj.protocol,
          auth: urlObj.auth,
          host: urlObj.host,
          path: '/',
          search: urlObj.search
        });
      
      //only go 1 depth deep
      if (!isBaseUrl)
        return null

      return urlMod.format({
        protocol: urlObj.protocol,
        auth: urlObj.auth,
        host: urlObj.host,
        pathname: urlObj.pathname, 
        search: urlObj.search
      });

    }).get()
  };
};
