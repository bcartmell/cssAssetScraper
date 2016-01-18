const fs = require('fs');
const http = require('http');
const path = require('path');
const wget = require('wget-improved');

var stylesheetUrl = process.argv[2];
var stylesheetUrlArr = stylesheetUrl.split('/');
var baseDomain = stylesheetUrlArr[2];
var basePath = stylesheetUrlArr[stylesheetUrlArr.length-2];
var savePath = process.argv[3];

function cleanUrlString(urlString) {
  // Takes a string formatted as 'url(...)' and just the url inside the
  // parenthesis
  var cleanUrl;
  cleanUrl = urlString.match(/\((.+)\)/)[1];
  cleanUrl = cleanUrl.replace(/['"]/g,'');

  switch (cleanUrl.search(/\/\//)) {
  // checking for relative and protocal-independent urls
  default: // do nothing
    break;
  case 0:
    // protocal-independent url - use http
    cleanUrl = 'http:'+cleanUrl;
    break;
  case -1:
    // relative path - use baseDomain
    cleanUrl = basePath+cleanUrl;
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
  console.log('urlStr is', urlStr);

  var download = wget.download(urlStr, savePath);
  download.on('error', (err) => {
    console.log(err);
  });
  download.on('end', (output) => {
    console.log(output);
    if (callback) callback();
  });
}

console.log('downloading stylesheet from', stylesheetUrl);
downloadFile(stylesheetUrl, process.cwd() , () => {
  var filepath = './'+ fileNameFromPath(stylesheetUrl);
  console.log('using filepath', filepath);
  fs.readFile(filepath,'utf8', (err, data) => {
    if (err) throw err;
    findUrls(data, (err, assetUrls) => {
      assetUrls.forEach( (assetUrl) => {
        downloadFile(cleanUrlString(assetUrl), savePath);
      });
    });
  });
});

