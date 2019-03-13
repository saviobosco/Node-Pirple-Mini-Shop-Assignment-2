/**
 * checkout handler
 */
var _data = require('./../data');
var helpers = require('./../helpers');
var tokens = require('./tokens');

var handlers = {};

 handlers._tokens = tokens._tokens;

 handlers.checkout = function(data, callback) {
    var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
    _data.read("tokens", token, function(err, tokenData) {
        if (!err && tokenData) {
            handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid) {
                if (tokenIsValid) {
                    //adding logged in user to the data variable
                    data.loggedInUser = tokenData;
                    var acceptableMethods = ['post'];
                    if (acceptableMethods.indexOf(data.method) > -1) {
                        handlers._checkout[data.method](data, callback)
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

handlers._checkout = {};

/**
 * Checkout - POST : checkout items
 * required data : currency
 * optional data : none
 * Authentication required
 */
handlers._checkout.post = function(data, callback) {
    var currency = typeof(data.payload.currency) == "string" &&
    ['usd', 'eur'].indexOf(data.payload.currency.toLowerCase()) > -1 ?
    data.payload.currency.toLowerCase() : false;

    _data.read("carts", data.loggedInUser.email, function(err, cartData) {
        if (!err && cartData) {
            if (typeof(cartData.totalPrice) !== "undefined" && cartData.totalPrice > 0 ) {
                helpers.createStripePayment(cartData.totalPrice * 100, currency, "tok_amex", "payment for items by " + data.loggedInUser.email, function(err) {
                    if (!err) {
                        // create the purchased items
                        // save the purchased items
                        _data.read("purchasedItems", data.loggedInUser.email, function(err, purchasedItems) {
                            if (!err && purchasedItems) {
                                var purchasedItems = typeof(purchasedItems) == "object" && Array.isArray(purchasedItems) === true ?
                                purchasedItems : [] ;

                                // create a new purchased record
                                var purchase = {};
                                purchase.id = helpers.createRandomString(10);
                                purchase.items = cartData.items;
                                purchase.totalPrice = cartData.totalPrice;
                                purchase.created_at = Date.now();
                                purchasedItems.push(purchase);
                                _data.update("purchasedItems", data.loggedInUser.email, purchasedItems, function(err) {
                                    if (!err) {
                                        // clear the cart
                                        _data.update("carts", data.loggedInUser.email, {"items":[], "totalPrice": 0}, function(err) {
                                            if (!err) {
                                                callback(200, {"message" : "Checkout successful!"});
                                            } else {
                                                callback(500, {"Error" : "Could not empty cart"});
                                            }
                                        });
                                    } else {
                                        callback(500, {"Error" : "Could not save your purchased items"});
                                    }
                                })
                            } else {
                                var purchasedItems = [];

                                // create a new purchased record
                                var purchase = {};
                                purchase.id = helpers.createRandomString(10);
                                purchase.items = cartData.items;
                                purchase.totalPrice = cartData.totalPrice;
                                purchase.created_at = Date.now();
                                purchasedItems.push(purchase);
                                _data.create("purchasedItems", data.loggedInUser.email, purchasedItems, function(err) {
                                    if (!err) {
                                        // clear the cart
                                        _data.update("carts", data.loggedInUser.email, {"items":[], "totalPrice": 0}, function(err) {
                                            if (!err) {
                                                callback(200, {"message" : "Checkout successful!"});
                                            } else {
                                                callback(500, {"Error" : "Could not empty cart"});
                                            }
                                        });
                                    } else {
                                        callback(500, {"Error" : "Could not save your purchased items"});
                                    }
                                });
                            }
                        });
                    } else {
                        callback(500, err);
                    }
                });
            } else {
                callback(400, {"Error" : "No item in cart yet. Please add items to cart"})
            }
        } else {
            callback(400, {"Error" : "No item in cart yet. Please add items to cart"})
        }
    });
}

module.exports = handlers;