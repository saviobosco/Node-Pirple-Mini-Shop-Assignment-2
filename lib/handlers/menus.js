/**
 * Request handler for menu
 */
var _data = require('./../data');
var helpers = require('./../helpers');
var tokens = require('./tokens');

 var handlers = {};

 handlers._tokens = tokens._tokens;

 handlers.menus = function(data, callback) {
    var acceptableMethods = ['post', 'put', 'get', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._menus[data.method](data, callback)
    } else {
        callback(405);
    }
}

handlers._menus = {};

/**
 * Menu - GET : get menu items
 * required data : none
 * optional data : none
 * Authentication required
 */
handlers._menus.get = function(data, callback) {
    
    //Get the token from the header
    var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
    // getting the user email
    _data.read("tokens", token, function(err, tokenData) {
        if (!err && tokenData) {
            handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid) {
                if (tokenIsValid) {
                    _data.read("menus", 'menu', function(err, data) {
                        if (!err && data) {
                            // remove the hashed password    
                            callback(200, data);
                        } else {
                            callback(404)
                        }
                    });
                } else {
                    callback(403, {"Error" : "Missing required token in header or token is invalid."})
                }
            });
        } else {
            callback(403, {"Error" : "Missing required token in header or token is invalid."})
        }
    });
}

module.exports = handlers;