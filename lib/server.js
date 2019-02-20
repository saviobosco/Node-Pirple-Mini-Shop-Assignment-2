/**
 * The main request an response controller
 */

var http = require('http');
var https = require('https');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var path = require("path");

//
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
        headers.token = (typeof(headers.authorization) === "string") ? headers.authorization.split(" ")[1] : false;
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

            var data = {
                'trimmedPath' : trimmedPath,
                'queryStringObject' : queryStringObject,
                'method' : method,
                'headers' : headers,
                'payload' : helpers.parseJSONToObject(buffer)
            };

            // Route the request to the specified handler
            chosenHandler(data, function(statusCode, payload) {
                //Use the default
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

                //payload
                payload = typeof(payload) == 'object' ? payload : {};

                // convert payload to string
                var payloadString = JSON.stringify(payload);

                //returning content type
                res.setHeader('Content-Type', 'application/json')
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
        'ping' : handlers.ping,
        'users' : handlers.users,
        'tokens' : handlers.tokens,
        'menu' : handlers.menus,
        'carts' : handlers.carts
        /*'checks' : handlers.checks*/
    }
 };

 /*server.init = function() {
    console.log("server initialized");
}*/

 module.exports = server;