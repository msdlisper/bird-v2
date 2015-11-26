var http = require("http");
var Q = require('q');
var util = require('./utils');
var session = {};
var l = console.log;
module.exports = {
  
  get: function (conf, target) {
    var deferred = Q.defer();
    if (conf.type === "uuap") {
      this.uuap(conf, target, deferred);
    }
    return deferred.promise;
  },
  uuap: function(conf, target, deferred) {
    var opt = {
      host: conf.host,
      port: conf.port,
      path: conf.path + '?service=http://' + target.host + ':' + target.port + conf.project ,
      headers: {
        cookie: conf.cookie
      }
    }
    var opt2 = {
      host: target.host,
      port: target.port,
      path: conf.project 
    };
    if (session['uuap']) {
      deferred.resolve(session['uuap']);
      l('use session: ', session['uuap']);
      //检测uuap可用
      opt2.headers = {
        accept: 'application/json, text/plain, */*',
         'content-type': 'application/x-www-form-urlencoded',
         'x-requested-with': 'xmlhttprequest',
         connection: 'keep-alive',
         referer: 'http://www.cnodejs.org/',
         host: 'localhost:9085',
         cookie: session['uuap'] 
      }
      // l(opt2);
      util.requ(opt2).then(function (r) {
        if (r.body &&  /\"code\"\:208/.exec(r.body)) {
          l('--------the sessoin: ' + session['uuap'] + ' is timeout, try to get a new session------');
          delete session['uuap'];
        }
      });
    } else {
      util.requ(opt).then(function (r) {
        // l(opt)
        // l(r.headers)
        var path = r.headers.location.split('?');
        var opt3 = {
          host: target.host,
          port: target.port,
          path: conf.project + '?' + path[1]
        };
        return util.requ(opt3);
      }).then(function (r) {
        var cookie = util.getCookie(r.headers['set-cookie'][0],'JSESSIONID');
        if (cookie) {
          session['uuap'] = 'JSESSIONID=' + cookie ;
          l('---------get a new sessoin--------: ', session['uuap']);
          deferred.resolve(session['uuap']);
        } else {
          console.error('getSession error: can not get a new session, please call 15982957557');
        }
      });
    }
  },
  remove: function (key) {
    if (key) {
      delete session[key];
    } else {
      session = {};
    }
  }
}