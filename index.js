var express = require('express');
var request = require('request');
var pathLib = require('path');


// App Setup =========================

var base = pathLib.resolve(__dirname);

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(ws){
  // Get a list of the relevant client configs
  var clientConfigs = getTestClientConfigs();
  
  // Invoke a client for each configuration
  for(var config of clientConfigs) {
    invokeClient(config,ws);
  }
});

server.listen(3000, function () {
  console.log('dashboard-v2 svc listening on port 3000!');
});

// Helper Functions =========================

// Invoke a client with a provided configuration
var invokeClient = function(config,ws){

  // Set a repeat interval for invoking the client
  setInterval(function(){
    
    // Build the request
    var options = {
      url: config.url,
      method: config.method
    }

    // Invoke the request
    request(options, function(error, response, body) {
      if (error || response.statusCode != 200) {
        console.log(error);
        return;
      }
    
      // Parse the value from the response
      var parsedValue = parseResponse(config.response_parse_rules, JSON.parse(body));

      // Send the websocket message
      var message = {
        'client_id' : config.id,
        'token_name' : config.token,
        'token_value': parsedValue
      };
      ws.emit('TOKEN_UPDATE', message);
    
    });

  }, config.interval);
};

// Parse a value from JSON using the provided parsing rules
var parseResponse = function(parseRules, json) {
  var parsedValue = json;
  
  for (var rule of parseRules){

    // Get the value of a property
    if (rule.indexOf('@') != -1) {
      rule = rule.replace('@','');
      parsedValue = parsedValue[rule];
    }

    // Select an element from an array
    if (rule.indexOf('#') != -1) {
      rule = rule.replace('#','');
      parsedValue = parsedValue[parseInt(rule)];
    }

  }

  return parsedValue;
};

// Build request parameters
var buildRequestParams = function(params) {
  var reqParamStr = '?';
  for (var paramKey in params) {
    reqParamStr += paramKey + '=' + params[paramKey];
    reqParamStr += '&'
  }
  return reqParamStr.slice(0, -1);
};

// For Testing =================================

var getTestClientConfigs = function() {
  var configs = [];
  configs.push({
    'id': '1',
    'name': 'Dictionary Search 1',
    'token': 'WORD1',
    'url':'http://localhost:3003/word-map/common-words',
    'method': 'GET',
    'response_parse_rules': ['@a'],
    'interval': 5000
  });
  configs.push({
    'id': '2',
    'name': 'Dictionary Search 2',
    'token': 'WORD2',
    'url':'http://localhost:3003/word-map/common-words',
    'method': 'GET',
    'response_parse_rules': ['@you'],
    'interval': 1000
  });
  // configs.push({
  //   'id': '1',
  //   'name': 'Google Places Search - Italian',
  //   'url':'http://localhost:3002/google/places/query/38.8339,-104.8214/50000/italian',
  //   'method': 'GET',
  //   'response_parse_rules': ['@results','#1','@name'],
  //   'interval': 5000
  // });
  // configs.push({
  //   'id': '2',
  //   'name': 'Google Places Search - Beer',
  //   'url':'http://localhost:3002/google/places/query/38.8339,-104.8214/50000/beer',
  //   'method': 'GET',
  //   'response_parse_rules': ['@results','#1','@name'],
  //   'interval': 1000
  // });
  return configs;
}