/**
 * helpers for various tasks
 */
var crypto = require('crypto');
var config = require('./config');
var https = require("https");
var querystring = require("querystring");
var path = require("path");
var fs = require("fs");


 var helpers = {};

 // Create a SHA256 hash
helpers.hash = function(str) {
    if (typeof(str) == "string" && str.length > 0) {
        var hash = crypto.createHmac("sha256", config.hashingSecret).update(str).digest("hex");
        return hash;
    } else {
        return false
    }
}

// Parse a JSON string to an object without throwing 
helpers.parseJSONToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
}

//Create a string of alphanumeric characters of a given length 
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == "number" && strLength > 0 ? strLength : false;
    if(strLength) {
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        //Start the final string
        var str = "";
        for(i = 1; i <= strLength; i++) {
            //get a random character from the possible character string
            var randomCharacter  = possibleCharacters.charAt(Math.random() * possibleCharacters.length);

            str+= randomCharacter;
        }
        return str;
    } else {
        return false;
    }
}

helpers.createStripePayment = function(amount, currency, source, description, callback) {

    var amount = typeof(amount) === "number" && amount >= 0 ? amount : false;
    var currency = typeof(currency) === "string" && ['usd', 'eur'].indexOf(currency.toLowerCase()) > -1 ? currency.toLowerCase() : false;
    var source = typeof(source) ===  "string" && source.length > 0 ? source : false;
    var description = typeof(description) === "string" && description.length > 0 ? description : false;
    if (amount && currency && source && description) {
        // Configure the request payload.
        var payload = {
            'amount' : amount,
            'currency' : currency,
            'source' : source,
            'description' : description
        };

        // stringfy the payload 
        var stringPayload = querystring.stringify(payload);
        var requestDetails = {
            'protocol' : "https:",
            "hostname" : "api.stripe.com",
            "method" : "POST",
            "path" : "/v1/charges",
            "headers" : {
                "Authorization" : "Bearer " + config.stripe.secretKey,
                "Content-Type" : "application/x-www-form-urlencoded",
                "Content-Length" : Buffer.byteLength(stringPayload)
            }
        }

        // Instantiate the request object 
        var req = https.request(requestDetails, function(res) {            
            // Grab status
            var status = res.statusCode;
            // Notify caller
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback('Status code returned was ' + status);
            }
            /*res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
              });*/
        });

        // Bind to an error event so it doesn't get thrown
        req.on("error", function(e) {
            callback(e);
        });

        

        // Add the payload 
        req.write(stringPayload);

        // send the request
        req.end();

    } else {
        callback("Given parameter were missing or invalid");
    }
}

helpers.getTemplate = function(templateName, data, callback) {
    templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) === "object" && data !== null ? data : {};

    if (templateName) {
        var templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(templateDir + templateName + ".html", "utf8", function(err, str) {
            if (!err && str && str.length > 0) {

                //Do interpolation on the string
                var finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback("No template could be found");
            }
        });
    } else {
        callback("A valid template name was not specified");
    }
};

// Take a give string and a data object and find/replace all the keys within it.
helpers.interpolate = function(str, data) {
    str = typeof(str) === "string" && str.length > 0 ? str : '';
    data = typeof(data) === "object" && data !== null ? data : {};

    // Add the templateGlobals to the data objects, prepending thier key name with global
    for (var keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data["global."+keyName] = config.templateGlobals[keyName];
        }
    }
    //For each key in the data object, insert its value into the string at the corresponding plaeholders
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof(data[key]) === "string") {
            var replace = data[key];
            var find = "{" + key + "}";
            str = str.replace(find, replace);
        }
    }
    return str;
}

// Add the unviveral header and footer 
helpers.addUniversalTemplates = function(str, data, callback) {
    str = typeof(str) === "string" && str.length > 0 ? str : '';
    data = typeof(data) === "object" && data !== null ? data : {};

    //Get the header 
    helpers.getTemplate("_header", data, function(err, headerString) {
        if (!err && headerString) {
            // Get the footer
            helpers.getTemplate("_footer", data, function(err, footerString) {
                if (!err && footerString) {
                    // Add the three strings together 
                    var fullString = headerString + str + footerString;
                    callback(false, fullString);
                } else {
                    callback("could not find the footer template");
                }
            });
        } else {
            callback("Could not find the header template");
        }
    })
}

// Get the contents of a static(public) asset
helpers.getStaticAsset = function(fileName, callback) {
    fileName = typeof(fileName) == "string" && fileName.length > 0 ? fileName : false;
    if (fileName) {
        var publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir + fileName, function(err, data) {
            if (!err && data) {
                callback(false, data);
            } else {
                callback("Not file could be found");
            }
        })
    } else {
        callback("a valid file name was not specified");
    }
}

 module.exports = helpers;