/**
 * The token handler
 */
var _data = require('./../data');
var helpers = require('./../helpers');

var handlers = {};

handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'put', 'get', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback)
    } else {
        callback(405);
    }
}

//token handler container
handlers._tokens = {};

//Token - posts
//Required data : phone, password
// Optional data : none
handlers._tokens.post = function(data, callback) {
    var email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ?
    data.payload.email : false ;
    var password = typeof(data.payload.password) == "string" &&
     data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (email && password) {
        _data.read("users", email, function(err, userData) {
            if(!err && userData) {
                //hash the sent password and compare it to the password stored in the user object
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    //if valid ,create a new token with the valid name, set expiration date 1 hour in the future
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        "email" : email,
                        "id" : tokenId,
                        "expires" : expires
                    };

                    if (tokenId) {
                        //Store the token
                        _data.create("tokens", tokenId, tokenObject, function(err) {
                            if(!err) {
                                callback(200, tokenObject);
                            } else {
                                callback(500, {"Error" : "Could not create the new token."});
                            }
                        });
                    } else {
                        callback(500, {"Error" : "Could not create new token."});
                    }
                } else {
                    callback(400, {"Error" : "Password did not match the specified user's stored password."});
                }

            }

        })
    } else {
        callback(400, {"Error" : "Missing required field(s)."})
    }

};

//Tokens - get
//Required : id
//Optional data : none
handlers._tokens.get = function(data, callback) {
    //Check that the id is valid
    var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length >= 20 ?
    data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read("tokens", id, function(err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, {"Error" : "Missing required field"});
    }
};

//Tokens - put
// Required data : id, extend,
//Optional data : none
handlers._tokens.put = function(data, callback) {
    var id = typeof(data.payload.id) == "string" && data.payload.id.trim().length >= 20 ?
    data.payload.id : false ;
    var extend = typeof(data.payload.extend) == "boolean" && data.payload.extend == true ?
    true : false ;
    if (id && extend) {
        _data.read("tokens", id, function(err, tokenData) {
            if (!err && tokenData) {
                //Check to make sure the token isnt already expired
                if (tokenData.expires > Date.now()) {
                    // set the expiration an hour from now 
                    tokenData.expires = Date.now() + 1000 * 60 * 60 ;

                    // Store the now updates
                    _data.update("tokens", id, tokenData, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {"Error" : "Could not update the token's expiration."})
                        }
                    })
                } else {
                    callback(400, {"Error" : "The token has already expired and cannot be extended."})
                }
            } else {
                callback(400, {"Error" : "Specified token does not exists."})
            }
        })
    } else {
        callback(400, {"Error" : "Missing required fields or fields is invalid."})
    }
};

//Token - delete
// Required data : id
// Optional data : none
handlers._tokens.delete = function(data, callback) {
    var id = typeof(data.payload.id) == "string" && data.payload.id.trim().length >= 20 ?
    data.payload.id : false ;
    if (id) {
        _data.read("tokens", id, function(err, data) {
            if (!err && data) {
                _data.delete("tokens", id, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(400, {"Error" : "could not delete the token."});
                    }
                });
            } else {
                callback(400, {"Error" : "Specified token does not exist!."})
            }
        });
    } else {
        callback(400, {"Error" : "Required fields missing."})
    }
};

// Verify that a given id is currently valid for a given user
handlers._tokens.verifyToken = function(id, email, callback) {
    //lookup the token
    _data.read("tokens", id, function(err, tokenData) {
        if (!err && tokenData) {

            if (tokenData.email == email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

module.exports = handlers;