/**
 * Request handler
 */

var _data = require('./data');
var helpers = require('./helpers');
var config = require("./config");

/** Loading handlers */
var tokens = require('./handlers/tokens');
var users = require('./handlers/users');
var menus = require('./handlers/menus');
var carts = require('./handlers/carts');



 //Define handlers = {}
var handlers = {
    ping : function(data, callback) {
        callback(200);
    },
    notFound : function(data, callback) {
        callback(404);
    }
}

//adding token handler
handlers.tokens = tokens.tokens;
handlers._tokens = tokens._tokens;

//adding users handlers
handlers.users = users.users;

handlers.menus = menus.menus;

// carts handler
handlers.carts = carts.carts;

/**
 * Api for pizza delivery company.
 * INSTRUCTIONS
 * New users can be created, their information edited and can be deleted 
 * data : name, email address and street address
 * user can login and out by creating a token 
 * user can be able to see menu when logged in, menu can be hard coded 
 * 
 * A logged-in user can be able to fill a shopping cart with menu items.
 * 
 * A logged-in user should be able to create an order. You should integrate with sandbox of stripe to accept their payment.
 * 
 * When an order is placed, you should email the user a receipt. You should integrate with sandbox of mailgun for this 
 * 
 * NB:
 * Document how a user can user the api.
 */

module.exports = handlers;