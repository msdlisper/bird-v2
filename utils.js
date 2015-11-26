var Q = require('q');
var http = require('http');
var qs = require('querystring');
exports.parseRange = function (str, size) {
    if (str.indexOf(",") !== -1) {
        return;
    }
    var range = str.split("-"),
        start = parseInt(range[0], 10),
        end = parseInt(range[1], 10);
    // Case: -100
    if (isNaN(start)) {
        start = size - end;
        end = size - 1;
        // Case: 100-
    } else if (isNaN(end)) {
        end = size - 1;
    }
    // Invalid
    if (isNaN(start) || isNaN(end) || start > end || end > size) {
        return;
    }
    return {start: start, end: end};
};

exports.requ = function (opt, data, contentType){
    var deferred = Q.defer();
    var request  =  http.request(opt, function (res){
        var body = '';
        res.on('data', function(chunk) {
           body += chunk;
         });
        res.on('end', function() {
          res.body = body;
          deferred.resolve(res);
        });
    }).on('err', function(e){
       throw e;
    });
    if (data) {
        if (contentType === 'json') {
            //'Content-Type': 'application/json',
            request.write(JSON.stringify(data));
        } else {
            request.write(qs.stringify(data));
        }
    }
    request.end();
    return deferred.promise;
};

exports.getCookie = function (source, key) {
  var Cookies = {};
  source.split(';').forEach(function (Cookie) {
    var parts = Cookie.split('=');
    Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  })
  if (key) {
    return Cookies[key];
  } else {
    return Cookies;
  }
}