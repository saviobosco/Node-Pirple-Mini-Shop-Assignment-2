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
// Required data: email
// Token Authorization : required
// Optional Data: none
handlers._users.get = function(data, callback) {
    //Check that the email is valid
    var email = typeof(data.queryStringObject.email) == "string" && data.queryStringObject.email.trim().length > 0 ?
    data.queryStringObject.email : false;
    if (email) {
        //Get the token from the header
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
        handlers._tokens.verifyToken(token, email, function(tokenIsValid) {
            if (tokenIsValid) {
                _data.read("users", email, function(err, data) {
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
        callback(400, {"Error" : "Missing required field"});
    }

};

// Users - post
// Required data: firstname, lastname, phone, password, tosAgreement
// Optional Data: none
handlers._users.post = function(data, callback) {
    //Check that all required data are present
    var firstName = typeof(data.payload.firstName) == "string" &&
     data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == "string" &&
     data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    var email = typeof(data.payload.email) == "string" &&
     data.payload.email.trim().length >= 10 ? data.payload.email.trim() : false;  

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
// Required : phone number
// @TODO: only let authenticated users
handlers._users.put = function(data, callback) {
    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length >= 10 ?
    data.payload.phone : false ;

    var firstName = typeof(data.payload.firstName) == "string" &&
     data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == "string" &&
     data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;  

    var password = typeof(data.payload.password) == "string" &&
     data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {

            //Get the token from the header
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                _data.read("users", phone, function(err, userData) {
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
                        // Store the new updates
                        _data.update("users", phone, userData, function(err) {
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
                callback(403, {"Error" : "Missing required token in header or token is invalid."})
            }
        });
        } else {
            callback(400, {"Error" : "Missing fields to update"});
        }

    } else {
        callback(400, {"Error" : " Missing required field"});
    }
};

// Users - delete
// Required field : phone 
// @Todo: Only authenticated users
handlers._users.delete = function(data, callback) {
    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length >= 10 ?
    data.payload.phone : false ;
    if (phone) {

        //Get the token from the header
        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                _data.read("users", phone, function(err, data) {
                    if (!err && data) {
                        _data.delete("users", phone, function(err) {
                            if (!err) {
                                // delete checks associated to that user
                                var userChecks = typeof(data.checks) == "object" && userData.checks instanceof Array ?
                                userData.checks : [] ;
                                var checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    var checksDeleted = 0;
                                    var deletionErrors = false;
                                    // loop through the checks 
                                    userChecks.forEach(function(checkId){
                                        _data.delete("checks", checkId, function(err) {
                                            if(err) {
                                                deletionErrors = true
                                            }
                                            checksDeleted++;
                                            if (checksDeleted == checksToDelete) {
                                                if(!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {"Error" : "Errors encountered while attempting to delete all of the user's check. All check may not have been completely delete"});
                                                }
                                            }
                                        });
                                    })
                                } else {
                                    callback(200);
                                }
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
        callback(400, {"Error" : "Required fields missing."})
    }
};

module.exports = handlers;