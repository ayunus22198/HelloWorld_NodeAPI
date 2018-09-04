/*
* Create and export configuration variables
*/

// Container for all the environments
var environments = {};

//Staging(default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort':3001,
  'envName': 'staging'
};

//Production environment
environments.production = {
  'port': 5000,
    'httpsPort':5001,
  'envName': 'production'
};

//Determine which environment was passes as a cmd arg

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
//Check that the curretn environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;
module.exports = environmentToExport;
