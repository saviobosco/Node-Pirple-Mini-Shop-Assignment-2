/**
 * Users handlers
 */
var _data = require('./../data');
var helpers = require('./../helpers');
var tokens = require('./tokens');


 var handlers = {};

 handlers._tokens = tokens._tokens;

 handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'put', 'get', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback)
    } else {
        callback(405);
    }
}

// Container for users endpoint handler
handlers._users = {};


// Users - get
// Token Authorization : required
// Optional Data: none
handlers._users.get = function(data, callback) {
    //Get the token from the header
    var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
    _data.read("tokens", token, function(err, tokenData) {
        if (!err && tokenData) {
            handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid) {
                if (tokenIsValid) {
                    _data.read("users", tokenData.email, function(err, data) {
                        if (!err && data) {
                            // remove the hashed password
                            delete data.hashedPassword;
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
};

// Users - post
// Required data: firstname, lastname, email, password, address, tosAgreement
// Optional Data: none
handlers._users.post = function(data, callback) {
    //Check that all required data are present
    var firstName = typeof(data.payload.firstName) == "string" &&
     data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == "string" &&
     data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    var email = typeof(data.payload.email) == "string" &&
     data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;  

    var password = typeof(data.payload.password) == "string" &&
     data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    var address = typeof(data.payload.address) == "string" &&
     data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;   

    var tosAgreement = typeof(data.payload.tosAgreement) == "boolean" &&
     data.payload.tosAgreement == true ? true : false;
    if (firstName && lastName && email && address && password && tosAgreement) {
        // Make sure user does not exist
        _data.read('users', email, function(err) {
            if (err) {
                // Hash the password
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    // create user
                    var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'email' : email,
                        'address' : address,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : tosAgreement
                    };

                    _data.create('users', email, userObject, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {"Error" : "Could not create the new user."}, err);
                        }
                    });
                } else {
                    callback(500, {"Error" : "Could not hash the user password"});
                }

            } else {
                callback(400, {"Error" : "A user with that email already exists!"});
            }
        })
    } else {
        callback(400, {"Error" : "Missing required fields."});
    }
};

// Update details
// Required : email
// @TODO: only let authenticated users
handlers._users.put = function(data, callback) {

    //Get the token from the header
    var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
        _data.read("tokens", token, function(err, tokenData) {
            if (!err && tokenData) {
                handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid) {
                    if (tokenIsValid) {
        
                        var firstName = typeof(data.payload.firstName) == "string" &&
                        data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
        
                        var lastName = typeof(data.payload.lastName) == "string" &&
                        data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;  
        
                        var password = typeof(data.payload.password) == "string" &&
                        data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
        
                        var address = typeof(data.payload.address) == "string" &&
                        data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;  

                        if (firstName || lastName || password || address) {
                            _data.read("users", tokenData.email, function(err, userData) {
                                if (!err && data) {
                                    // update the fields
                                    if (firstName) {
                                        userData.firstName = firstName;
                                    }
                                    if (lastName) {
                                        userData.lastName = lastName;
                                    }
                                    if (password) {
                                        userData.hashedPassword = helpers.hash(password);
                                    }
                                    if (address) {
                                        userData.address = address;
                                    }
                                    // Store the new updates
                                    _data.update("users", tokenData.email, userData, function(err) {
                                        if (!err) {
                                            callback(200)
                                        } else {
                                            console.log(err);
                                            callback(500, {"Error" : "Could not update the user."})
                                            
                                        }
                                    });
                                } else {
                                    callback(400, {"Error" : "Specified user does not exist"});
                                }
                            });
        
                        } else {
                            callback(400, {"Error" : "Missing fields to update"});
                        }
                    } else {
                        callback(403, {"Error" : "Missing required token in header or token is invalid."})
                    }
                });
            } else {
                callback(403, {"Error" : "Missing required token in header or token is invalid."})
            }
        });
};

// Users - delete
// Required field : none
// Optional field(s) : none
// @Todo: Only authenticated users
handlers._users.delete = function(data, callback) {
    //Get the token from the header
    var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

    _data.read("tokens", token, function(err, tokenData) {
        if (!err && tokenData) {
            handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid) {
                if (tokenIsValid) {
                    _data.read("users", tokenData.email, function(err, data) {
                        if (!err && data) {
                            _data.delete("users", tokenData.email, function(err) {
                                if (!err) {
                                    // delete user associated data
                                    _data.delete("carts", tokenData.email, function(err) {
                                        if (!err) {
                                            _data.delete("purchasedItems", tokenData.email, function(err) {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    // return status 200 because user has no purchased item
                                                    callback(200);
                                                }
                                            });
                                        } else {
                                            _data.delete("purchasedItems", tokenData.email, function(err) {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    // return status 200 because user has no purchased item
                                                    callback(200);
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    callback(400, {"Error" : "could not delete the user."});
                                }
                            });
                        } else {
                            callback(400, {"Error" : "Specified user does not exist!."})
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

};

module.exports = handlers;