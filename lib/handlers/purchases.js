/**
 * purchases handler
 */

var _data = require('./../data');
var helpers = require('./../helpers');
var tokens = require('./tokens');

var handlers = {};

handlers._tokens = tokens._tokens;

handlers.purchases = function(data, callback) {
    var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
    _data.read("tokens", token, function(err, tokenData) {
        if (!err && tokenData) {
            handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid) {
                if (tokenIsValid) {
                    //adding logged in user to the data variable
                    data.loggedInUser = tokenData;
                    var acceptableMethods = ['post', 'put', 'get', 'delete'];
                    if (acceptableMethods.indexOf(data.method) > -1) {
                        handlers._purchases[data.method](data, callback)
                    } else {
                        callback(405);
                    }
                } else {
                    callback(403, {"Error" : "Missing required token in header or token is invalid."})
                }
            });
        } else {
            callback(403, {"Error" : "Missing required token in header or token is invalid."})
        }
    });
    
}

handlers._purchases = {};

/**
 * required data : none
 * optional data : none
 * returns the user purchased item(s)
 */
handlers._purchases.get = function(data, callback) {
    _data.read("purchasedItems", data.loggedInUser.email, function(err, purchases) {
        if (!err && purchases) {
            callback(200, purchases);
        } else {
            callback(200, {"message" : "You have not purchases yet!"});
        }
    })
}


module.exports = handlers;