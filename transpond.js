var http = require("http");
var path = require("path");
var getSession = require('./getSession');
var l = console.log;

module.exports = function () {
    this.transpond = function (req, res, transRules) {
        var port = req.headers.host.split(":")[1] || 80;
        delete require.cache[path.join(__dirname, "../../config.js")];
        
        if (transRules.ajaxOnly && !req.headers.accept.match(/application\/json, text\/javascript/)) {
            res.writeHead("404");
            res.write("404");
            res.end();
            console.log("transpond \033[31m%s\033[m canceled, modify the config.js to transpond this.", req.headers.host + req.url);
            return false;
        }
        var transCurrent = transRules[port];
        if (!transCurrent) {
            console.error('The transponding rules of port"' + port + '" is not defined, please check the config.js!');
            return false;
        }
        var options = {
            host: transCurrent.targetServer.host,
            port: transCurrent.targetServer.port || 80
        };
        options.headers = req.headers;
        options.path = req.url;
        options.method = req.method;
        //匹配regExpPath做特殊转发
        var i;
        for (i in transCurrent.regExpPath) {
            if (req.url.match(i)) {
                options.host = transCurrent.regExpPath[i].host || options.host;
                options.port = transCurrent.regExpPath[i].port || options.port;
                options.path = req.url.replace(i, transCurrent.regExpPath[i].path);
                if (transCurrent.regExpPath[i].attachHeaders) {
                    _transpond(req, res, options, transCurrent.regExpPath[i], transCurrent.targetServer);
                    
                }
                break;
            }
        }
        // console.log(options)

        console.log("transpond \033[31m%s\033[m to \033[35m%s\033[m", req.headers.host + req.url, options.host + ":" + options.port + options.path);
     
    };
};
function _transpond (req, res, options, regExpPath, targetServer) {
    var j;
    if (regExpPath.attachHeaders['cookie'] ) {
            // l(regExpPath.attachHeaders['cookie'])
        for (j in regExpPath.attachHeaders) {
            options.headers[j] = regExpPath.attachHeaders[j];
        }   
        _http(req, res, options, regExpPath, targetServer);
    } else if (regExpPath.getSession){
        getSession.get(regExpPath.getSession, targetServer).then(function (r) {
            regExpPath.attachHeaders['cookie'] = r;
            for (j in regExpPath.attachHeaders) {
                options.headers[j] = regExpPath.attachHeaders[j];
            } 
            // l(options)
            _transpond(req, res, options, regExpPath);
        });
        
    } else {
        l('please config regExpPath.getSession || regExpPath.attachHeaders.cookie')
    }

    
}

function _http(req, res, options, regExpPath, targetServer) {
    var serverReq = http.request(options, function (serverRes) {
        // console.log(req.url + " " + serverRes.statusCode);
        // check Uuuap Session not timeout, this funciton can't check ajax request
        if (serverRes.headers.location){ // 重定向了，说明cookie过时了
            getSession.remove('uuap');
            delete regExpPath.attachHeaders['cookie'];
            // _transpond(req, res, options, regExpPath, targetServer);
            // l(serverReq.abort)
            delete serverRes.headers.location;
            serverRes.headers.birdMessage = 'the cookie  ' + options.headers['cookie'] + '  is expire, please press [ctrl+R | f5] to get a new one';
            res.writeHead(208, serverRes.headers);
            // res.write('the cookie  ' + options.headers['cookie'] + '  is expire, please press [ctrl+R | f5] to get a new one') //不知为什么输不出来
            
            res.end();
            l('the cookie  ' + options.headers['cookie'] + '  is expire, please press [ctrl+R | f5] to get a new one')
            // return;
        } else {
            res.writeHead(serverRes.statusCode, serverRes.headers);
            serverRes.on('data', function (chunk) {
                res.write(chunk);
            });
            serverRes.on('end', function () {
                res.end();
            });
        }
        
    });

    serverReq.on('error', function (e) {
        console.error('problem with request: ' + e.message);
        serverReq.abort();
    });

    req.addListener('data', function (chunk) {

        serverReq.write(chunk);
    });

    req.addListener('end', function () {
        serverReq.end();
    });
}