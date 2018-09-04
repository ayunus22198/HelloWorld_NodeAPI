/*
* Primary File for API
*/

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
//We are instantiating the HTTP Server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req,res);
});
//Start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, function(){
  console.log("The server is listening on port "+config.httpPort);
});

//Instantiate the https server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req,res);
});
//Start the https server
httpsServer.listen(config.httpsPort, function(){
  console.log("The server is listening on port "+config.httpsPort);
});

// All the server logic for both the http and https create server

var unifiedServer = function(req, res) {
    //get the url and parse interval
  var parsedUrl = url.parse(req.url,true);
  //get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');
  //get the query string as an object
  var queryStringObject = parsedUrl.query;

  //get the HTTP method
  var method = req.method.toLowerCase();
  //get the headers as an object
  var headers = req.headers;
  //Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });
  req.on('end', function(){
    buffer += decoder.end();

    //Choose the handler this request should go to. If one is not found, go to not found fxn
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //Construct the data object t send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };

    //Routet he request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {
      //use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      //use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};
      //Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      //Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      //log the request
      console.log('Returning this response: ', statusCode, payloadString);
    });
    //send the response
    res.end("Hello World\n");
});
  };
// Define handlers
var handlers = {};

//Sample handlers
handlers.ping = function(data, callback) {
  callback(200);
};

//not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

handlers.hello = function(data, callback) {
  if(data.method == "post") {
      callback(200, {msg: "Hello World!"});
  }
};

var router = {
  'ping' : handlers.ping, 
   'hello': handlers.hello
};
