/**
 * Html handlers
 */

 var helpers = require("../../helpers");

 var handlers = {}

 handlers.index = function(data, callback)
 {
     if (data.method === 'get') {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Welcome to Royalty pizza delivery.",
            "head.description" : "This is the meta description",
            "body.title" : "Hello templated world",
            "body.class" : "index" 
        }

        helpers.getTemplate('index', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
     } else {
         callback(405, undefined, "html");
     }
 }

 handlers.accountCreate = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Create an account.",
            "head.description" : "Create Account",
            "body.title" : "Create an account to get Started!",
            "body.class" : "accountCreate"
        }

        helpers.getTemplate('accountCreate', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

handlers.accountEdit = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Account Settings.",
            "body.title" : "Edit your account.",
            "body.class" : "accountEdit"
        }

        helpers.getTemplate('accountEdit', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

handlers.sessionCreate = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Log into your account.",
            "head.description" : "Login ",
            "body.title" : "Continue your Session!",
            "body.class" : "sessionCreate"
        }

        helpers.getTemplate('sessionCreate', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

//Session deleted
handlers.sessionDeleted = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Logged Out!",
            "head.description" : "You have been logged out of your account.",
            "body.class" : "sessionDeleted" 
        }

        helpers.getTemplate('sessionDeleted', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
}


handlers.menusList = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Menu Listings",
            "body.title" : "See all menu listings",
            "body.class" : "menusList"
        }

        helpers.getTemplate('menusList', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

handlers.menusView = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "View Menu Item",
            "body.title" : "menu Item",
            "body.class" : "menusView"
        }

        helpers.getTemplate('menusView', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

handlers.cartsList = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "My Carts",
            "body.title" : "Carts",
            "body.class" : "cartsList"
        }

        helpers.getTemplate('cartsList', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

handlers.checkoutCreate = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Items Checkout",
            "body.title" : "Checkout",
            "body.class" : "checkoutCreate"
        }

        helpers.getTemplate('checkoutCreate', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

handlers.checkoutSuccess = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Checkout Successful",
            "body.title" : "Checkout",
            "body.class" : "checkoutSuccess"
        }

        helpers.getTemplate('checkoutSuccess', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

handlers.purchasesList = function(data, callback) {
    if (data.method === "get") {
        // prepare data for page interpolations
        var templateData = {
            "head.title" : "Purcased Items",
            "body.title" : "purchases",
            "body.class" : "purchasesList"
        }

        helpers.getTemplate('purchasesList', templateData, function(err, str) {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        callback(200, str, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, "html");
    }
}

 handlers.public = function(data, callback) {
    if (data.method === "get") {
        // Get the file name being requested 
        var trimmedAssetName = data.trimmedPath.replace('public/', '');
        if (trimmedAssetName.length > 0) {
            helpers.getStaticAsset(trimmedAssetName, function(err, data) {
                if (!err && data) {
                    // Determine the content type (default to plain type)
                    var contentType = "plain";
                    if(trimmedAssetName.indexOf(".css") > -1) {
                        contentType = "css"
                    }
                    if(trimmedAssetName.indexOf(".png") > -1) {
                        contentType = "png"
                    }
                    if(trimmedAssetName.indexOf(".jpg") > -1) {
                        contentType = "jpg"
                    }
                    if(trimmedAssetName.indexOf(".ico") > -1) {
                        contentType = "favicon"
                    }
                    callback(200, data, contentType);
                } else {
                    // Determine the content type (default to plain type)
                    var contentType = "plain";
                    if(trimmedAssetName.indexOf(".css") > -1) {
                        contentType = "css"
                    }
                    if(trimmedAssetName.indexOf(".png") > -1) {
                        contentType = "png"
                    }
                    if(trimmedAssetName.indexOf(".jpg") > -1) {
                        contentType = "jpg"
                    }
                    if(trimmedAssetName.indexOf(".ico") > -1) {
                        contentType = "favicon"
                    }
                    callback(404, undefined, contentType);
                }
            })
        } else {
            callback(404);
        }
        
    } else {
        callback(405);
    }
}




 module.exports = handlers;