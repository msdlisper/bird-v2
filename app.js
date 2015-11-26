var fileServer = require("./index");
var qs = require('querystring');
var http = require("http");
var serverSettings = {
  "8787": {
    "basePath": "E:/baidu-svn/gcrm/src/main/webapp/front"
  },
  "7676": {
      "basePath": "../resources"
    }
};

fileServer.start(serverSettings, transRules);
