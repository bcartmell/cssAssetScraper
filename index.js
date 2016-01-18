const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
const wget = require('wget-improved');

function cleanUrlString(urlString) {
  // Takes a string formatted as 'url(...)' and just the url inside the
  // parenthesis
  var cleanUrl;
  cleanUrl = urlString.match(/\((.+)\)/)[1];
  cleanUrl = cleanUrl.replace(/['"]/g,'');
  return cleanUrl;
}

function findUrls(input, callback) {
  var assetUrls = input.match(/url\(.*?\)/gi);
  if (callback) {
    callback(null, assetUrls);
  }
  else return assetUrls;
}

function logData(err, data) {
  if (err) throw err;
  // console.log(data);
}

function downloadFile(urlStr, savePath, callback) {
  var fileName = urlStr.split('/').pop();
  var httpOptions;
  // console.log('filename is', fileName);
  // get just the filename with no path;

  savePath = path.resolve(savePath) +'/'+ fileName;
  // console.log('savePath is', savePath);
  console.log('urlStr is', urlStr);

  var download = wget.download(urlStr, savePath);
  download.on('error', (err) => {
    console.log(err);
  });
  download.on('end', (output) => {
    console.log(output);
  });
  

  /* This seems to be wanting to connect to localhost despite being passed
   * a url that is publically hosted.  I don't know why, but fuck it, I'll use
   * wget instead.
   *
   * http.get(url.parse(urlStr), (response) => {
   *   var fullPath = savePath +'/'+ fileName;
   *   console.log('writing file:', fullPath);
   *   fs.writeFile(fullPath, response.body, (fullPath) => {
   *     console.log('wrote file:', fullPath);
   *   })
   *   // write the file;
   * }).on('error', (error) => {
   *   console.log('Received error', error)
   * });;
   */
}

(function() {
  var filepath = process.argv[2];
  var savePath = process.argv[3];

  fs.readFile(filepath,'utf8', (err, data) => {
    if (err) throw err;
    findUrls(data, (err, assetUrls) => {
      assetUrls.forEach( (assetUrl) => {
        downloadFile(cleanUrlString(assetUrl), savePath);
      });
    });
  });

}());

// fs.writeFile('newfile', 'My new file has content!', => console.log('done'));
