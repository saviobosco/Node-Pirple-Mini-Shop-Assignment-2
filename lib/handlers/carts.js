/**
 * Carts handler
 */
var _data = require('./../data');
var helpers = require('./../helpers');
var tokens = require('./tokens');

 var handlers = {};

 handlers._tokens = tokens._tokens;

 handlers.carts = function(data, callback) {
    var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
    _data.read("tokens", token, function(err, tokenData) {
        if (!err && tokenData) {
            handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid) {
                if (tokenIsValid) {
                    //adding logged in user to the data variable
                    data.loggedInUser = tokenData;
                    var acceptableMethods = ['post', 'put', 'get', 'delete'];
                    if (acceptableMethods.indexOf(data.method) > -1) {
                        handlers._carts[data.method](data, callback)
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

handlers._carts = {};

handlers._carts.get = function(data, callback) {
    // get the user token 
    // get the user email from the token 
    // get the cart with the user email
    // 
}

handlers._carts.post = function(data, callback) {
    // validate the passed data
    // using the menu id read the menu details
    var menuId = typeof(data.payload.id) == "number" && data.payload.id > 0 ?
    data.payload.id : false;
    var quantity = typeof(data.payload.quantity) == "number" && data.payload.quantity > 0 ?
    data.payload.quantity : false;
                    if (menuId && quantity) {
                        _data.read("menus", "menu", function(err, menuData) {
                            if (!err && menuData) {
                                // get the item from the menu
                                var menuItem = menuData.filter(function(item){
                                    return +item.id === +menuId
                                });
                                if (typeof(menuItem) == "object" && menuItem instanceof Array && menuItem[0]) {

                                    menuItem = menuItem[0];
                                    // get the user cart 
                                    _data.read("carts", data.loggedInUser.email, function(err, cartData) {
                                        if (!err && cartData) {
                                            var userCart = typeof(cartData) == "object" ?
                                            cartData : { "items" : [], "totalPrice" : 0} ;
                                            // create new cart item
                                            var newCartItem = {
                                                "id" : menuItem.id,
                                                "name" : menuItem.name,
                                                "quantity" : quantity,
                                                "price" : quantity * parseFloat(menuItem.price)
                                            }
                                            // check if the item is in cart 
                                            itemExistsInCart = userCart.items.filter(function(cartItem) {
                                                return +cartItem.id === +newCartItem.id
                                            });

                                            if (typeof(itemExistsInCart) == "object" && itemExistsInCart instanceof Array && itemExistsInCart[0]) {
                                                itemExistsInCart = itemExistsInCart[0];
                                                // merge item quantity and re compute price with the new one
                                                /*newCartItem.quantity = newCartItem.quantity + itemExistsInCart.quantity;
                                                newCartItem.price = newCartItem.quantity * parseFloat(menuItem.price);*/

                                                // remove old item from cart
                                                userCart.items = userCart.items.filter(function(cartItem) {
                                                    return +cartItem.id !== +newCartItem.id;
                                                });
                                                userCart.totalPrice = userCart.totalPrice - itemExistsInCart.price;
                                            }

                                            userCart.items.push(newCartItem);
                                            userCart.totalPrice = userCart.totalPrice + newCartItem.price;
                                            _data.update("carts", data.loggedInUser.email, userCart, function(err) {
                                                if (!err) {
                                                    callback(200, userCart);
                                                } else {
                                                    callback(500, {"Error" : "Could not add item to cart. Please try again."})
                                                }
                                            });
                                            
                                        } else {
                                            // create new user cart file
                                            var userCart = { "items" : [], "totalPrice" : 0};
                                            // create new cart item
                                            var newCartItem = {
                                                "id" : menuItem.id,
                                                "name" : menuItem.name,
                                                "quantity" : quantity,
                                                "price" : quantity * parseFloat(menuItem.price)
                                            }
                                            userCart.items.push(newCartItem);
                                            userCart.totalPrice = userCart.totalPrice + newCartItem.price;
                                            _data.create("carts", data.loggedInUser.email, userCart, function(err) {
                                                if (!err) {
                                                    callback(200, userCart);
                                                } else {
                                                    callback(500, {"Error" : "Could not add item to cart. Please try again."})
                                                }
                                            });
                                        }
                                    });
                                    // and append the item and quantity
                                    // 
                                } else {
                                    callback(404, {"Error" : "Could not get menu item"});
                                }
                            } else {
                                callback(500, {"Error" : "Could not read menu data"});
                            }
                        })
                    } else {
                        callback(400, {"Error" : "Missing required field"});
                    }
    // get the user token 
    // get the user email from the token
    // read of create a new cart for the users
    // output the new cart content to the user
}

handlers._carts.get = function(data, callback) {
    _data.read("carts", data.loggedInUser.email, function(err, data) {
        if (!err && data) {
            // remove the hashed password
            callback(200, data);
        } else {
            callback(400, {"Error" : "No item in cart yet"})
        }
    });
}

handlers._carts.delete = function(data, callback) {
    var menuItemId = typeof(data.payload.id) == "number" && data.payload.id > 0 ?
    data.payload.id : false;
    if (menuItemId) {
        _data.read("carts", data.loggedInUser.email, function(err, userCart) {
            if (!err && userCart) {
                // get the item from the userCart 
                removeItem = userCart.items.filter(function(cartItem) {
                    return +cartItem.id === +menuItemId;
                })
                if (typeof(removeItem) == "object" && removeItem instanceof Array && removeItem[0]) {
                    removeItem = removeItem[0];

                    userCart.items = userCart.items.filter(function(cartItem) {
                        return +cartItem.id !== +menuItemId
                    });

                    userCart.totalPrice = userCart.totalPrice - removeItem.price;

                    _data.update("carts", data.loggedInUser.email, userCart, function(err) {
                        if (!err) {
                            callback(200, userCart);
                        } else {
                            callback(500, {"Error" : "Could not add item to cart. Please try again."})
                        }
                    });

                } else {
                    callback(400, {"Error" : "Item does not exist in cart."});
                }
            } else {
                callback(400, {"Error" : "No item in cart yet"})
            }
        })
    } else {
        callback(400, {"Error" : "Missing required field"});
    }
    // read the user cart data
    // check if item exists 
    // if true remove item
    // notify the user
}

 module.exports = handlers;