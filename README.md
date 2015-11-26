#bird v2
## origin: https://github.com/weger/bird
## rebuild bird
## with random json
## usage
        var config3 = {
          servers: {
                9085: {  //服务器启动的端口
                    basePath: '../'
                }
            },
            transRules: {
                 9085: { 
                    targetServer: { //将要转发到的服务器
                        host: 'erp.com',
                        port: '8888'
                    },
                    regExpPath: { //匹配路径
                        '/': {
                            path: '/',
                            attachHeaders: {
                                cookie: 'JSESSIONID=06444BCB824DDA4E495E306680070256'
                            },
                            getSession: {
                                "type": 'uuap',
                                'cookie':'SSID=xxxx; UUATGC=xxx',
                                'host': 'uuap-login.com',
                                'port': '8212',
                                'path': '/login',
                                'project': '/project-path/'
                            }
                        }
                    }
                },
                "ajaxOnly": false // false是意思是转发所有请求
              }
        }
        bird.start(config3.servers, config3.transRules);
