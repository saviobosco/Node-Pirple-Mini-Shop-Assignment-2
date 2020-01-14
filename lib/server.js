/**
 * The main request an response controller
 */

var http = require('http');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;

// loading local modules
var config = require("./config");
var handlers = require("./handlers");
var helpers = require("./helpers");

// Instatiate a server module object 
var server = {

    unifiedServer : function(req, res) {
            // Get the url and parse it 
        var parsedUrl = url.parse(req.url, true);

        // Get the path 
        var path = parsedUrl.pathname;

        var trimmedPath = path.replace(/^\/+|\/+$/g, '')

        // Get the query string as an object 
        var queryStringObject = parsedUrl.query;
        //Get the HTTP Method
        var method = req.method.toLowerCase();

        //Get reques headers
        var headers = req.headers;

        // modify the header token 
        headers.token = (typeof(headers.authorization) === "string") ? headers.authorization.split(" ")[1] : headers.token;
        headers.token =  typeof(headers.token) === "string" ? headers.token : false;

        //Get the payload
        var decoder = new stringDecoder('utf-8');
        var buffer = '';
        req.on('data', function(data) {
            buffer += decoder.write(data);
        });
        req.on('end', function() {
            buffer += decoder.end();
            

            // Choose the request handler, if not found us not found handler
            var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

            // if the request is within the public directory, use the public handler instead
            chosenHandler = trimmedPath.indexOf("public/") > -1 ? handlers.public : chosenHandler;

            var data = {
                'trimmedPath' : trimmedPath,
                'queryStringObject' : queryStringObject,
                'method' : method,
                'headers' : headers,
                'payload' : helpers.parseJSONToObject(buffer)
            };

            // Route the request to the specified handler
            chosenHandler(data, function(statusCode, payload, contentType) {
                //Use the default
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

                // Detemine the type of response (fallback to JSON)
                contentType = typeof(contentType) == 'string' ? contentType : 'json';

                //return the response parts that are content-specific 
                var payloadString = '';
                if (contentType === 'json') {
                    res.setHeader('Content-Type', 'application/json')
                    payload = typeof(payload) == 'object' ? payload : {};
                    payloadString = JSON.stringify(payload);
                }

                if (contentType === 'html') {
                    res.setHeader('Content-Type', 'text/html')
                    payloadString = typeof(payload) === 'string' ? payload : '';
                }
                
                if (contentType === 'favicon') {
                    res.setHeader('Content-Type', 'image/x-icon')
                    payloadString = typeof(payload) !== undefined ? payload : '';
                }
                if (contentType === 'css') {
                    res.setHeader('Content-Type', 'text/css')
                    payloadString = typeof(payload) !== undefined ? payload : '';
                }
                if (contentType === 'png') {
                    res.setHeader('Content-Type', 'image/png')
                    payloadString = typeof(payload) !== undefined ? payload : '';
                }
                if (contentType === 'jpg') {
                    res.setHeader('Content-Type', 'image/jpeg')
                    payloadString = typeof(payload) !== undefined ? payload : '';
                }
                if (contentType === 'plain') {
                    res.setHeader('Content-Type', 'text/plain')
                    payloadString = typeof(payload) !== undefined ? payload : '';
                }

                // return response
                res.writeHead(statusCode);

                res.end(payloadString);

                // if the response is 200 print green else print red
                if (statusCode === 200) {
                    console.log("\x1b[32m%s\x1b[0m", method.toUpperCase() + " /" + trimmedPath + " " + statusCode);
                } else {
                    console.log("\x1b[31m%s\x1b[0m", method.toUpperCase() + " /" + trimmedPath + " " + statusCode);
                }

            });

        });
    },

    httpServer : http.createServer(function(req, res) {
        server.unifiedServer(req, res);
    }),

     init : function() {
        this.httpServer.listen(config.httpPort, function() {
            console.log("\x1b[36m%s\x1b[0m", "The server is listening on port " + config.httpPort + " in " + config.envName + " now");
        });
    },

    router : {
        '': handlers.index,
        'account/create': handlers.accountCreate,
        'account/edit': handlers.accountEdit,
        'account/deleted': handlers.accountDeleted,
        'session/create': handlers.sessionCreate,
        'session/deleted': handlers.sessionDeleted,
        'carts/all': handlers.cartsList,
        'purchases/all': handlers.purchasesList,
        'checkout/create': handlers.checkoutCreate,
        'checkout/success' : handlers.checkoutSuccess,
        'menus/all': handlers.menusList,
        'menus/view': handlers.menusView,
        'ping' : handlers.ping,
        'api/users' : handlers.users,
        'api/tokens' : handlers.tokens,
        'api/menu' : handlers.menus,
        'api/carts' : handlers.carts,
        'api/checkout' : handlers.checkout,
        'api/purchases' : handlers.purchases
    }
 };

 module.exports = server;