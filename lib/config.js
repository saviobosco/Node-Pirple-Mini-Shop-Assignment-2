/**
 * Create and Export Configuration variable
 */

 //Container for all the environment
 var environments = {};

 // Staging (default) environment
 environments.staging = {
     'httpPort' : 3000,
     'httpsPort' : 3001,
     'envName' : 'staging',
     'hashingSecret' : 'thisIsASecret',
     "stripe" : {
         "secretKey" : "sk_test_fmcowRuzSONhIoJh6QAc3DrQ",
         "publishablekey" : "pk_test_PxlskblxivXr4tZNEbx7u8EZ"
     },
     "templateGlobals" : {
        "appName" : "Royalty Pizza Delivery",
        "companyName" : "Royalty Tech, Inc.",
        "yearCreated" : "2018",
        "baseUrl" : "http://localhost:3000"
    }
 };

environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5
};

//Determine which environment was passed as a command-line argument
var currentEnviroment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environment above, if not, default to staging
var environmentToExport = typeof(environments[currentEnviroment]) == 'object' ? environments[currentEnviroment] : environments.staging ;

// Export the module
module.exports = environmentToExport;