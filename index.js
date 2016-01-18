const fs = require('fs');
const http = require('http');
const path = require('path');
const wget = require('wget-improved');

var stylesheetUrl = process.argv[2];
var stylesheetUrlArr = stylesheetUrl.split('/');
var baseDomain = 'http://'+stylesheetUrlArr[2];
var basePath = stylesheetUrlArr[stylesheetUrlArr.length-2]+'/';
var savePath = process.argv[3];

function cleanUrlString(urlString) {
  // Takes a string formatted as 'url(...)' and just the url inside the
  // parenthesis
  var cleanUrl;
  cleanUrl = urlString.match(/\((.+)\)/)[1];
  cleanUrl = cleanUrl.replace(/['"]/g,'');

  if (isData(cleanUrl)) return cleanUrl;

  switch (cleanUrl.search(/\/\//)) {
  // checking for relative and protocal-independent urls
  default: // do nothing
    break;
  case 0:
    // protocal-independent url - use http
    cleanUrl = 'http:'+cleanUrl;
    break;
  case -1:
    if (cleanUrl[0] === '/') {
      // using path relative to domain base
      cleanUrl = baseDomain+cleanUrl;
    }
    else {
      // using path relative to stylesheet
      cleanUrl = basePath+cleanUrl;
    }
    break;
  }

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
}

function fileNameFromPath(path) {
  // takes a path or url and returns just the filename
  return path.split('/').pop();
}

function downloadFile(urlStr, savePath, callback) {
  var fileName = fileNameFromPath(urlStr);

  savePath = path.resolve(savePath) +'/'+ fileName;
  console.log('getting', urlStr);

  var download = wget.download(urlStr, savePath);
  download.on('error', (err) => {
    console.log(err);
  });
  download.on('end', (output) => {
    if (callback) callback(output);
  });
}

function isData(assetUrl) {
  return (assetUrl.search('data:') === 0)
}

downloadFile(stylesheetUrl, process.cwd() , () => {
  var filepath = './'+ fileNameFromPath(stylesheetUrl);
  fs.readFile(filepath,'utf8', (err, data) => {
    if (err) throw err;
    findUrls(data, (err, assetUrls) => {
      assetUrls.forEach( (assetUrl) => {
        assetUrl = cleanUrlString(assetUrl);
        if (isData(assetUrl)) return;
        // If the url string is svg data, no need to try and download
        //
        downloadFile(assetUrl, savePath);
      });
    });
  });
});
