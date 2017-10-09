var request = require('request');

module.exports = function(app) {

    var server = require('http').createServer(app);
    var io = require('socket.io')(server);

    io.on('connection', function(ws){
      // Get a list of the relevant client configs
      var clientConfigs = getTestClientConfigs();
      
      // Invoke a client for each configuration
      for(var config of clientConfigs) {
        startClient(config,ws);
      }
    });

    server.listen(3000, function () {
        console.log('dashboard-v2 svc listening on port 3000!');
    });

};

// Helper Functions =========================

// Invoke a client with a provided configuration
var startClient = function(config,ws){

  // Declare the function to invoke a client
  var invokeClient = function() {
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
      var parsedValues = parseResponse(config.tokens, JSON.parse(body));

      // Send the websocket message
      var message = {
        'client_id' : config.id,
        'token_name' : config.token,
        'parsed_values': parsedValues
      };
      ws.emit('TOKEN_UPDATE', message);
    
    });
  };

  // Invoke the client for the first time
  invokeClient();

  // Set a repeat interval for invoking the client
  setInterval(invokeClient, config.interval);
};

// Parse a value from JSON using the provided parsing rules
var parseResponse = function(tokens, json) {
  var parsedValues = [];

  for (var token of tokens) {

    var parsedValue = json;

    for (var rule of token.parse_rules){
      
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

    parsedValues.push({
      'token_name' : token.name,
      'parsed_value' : parsedValue
    })

  }

  return parsedValues;
};

// For Testing =================================

var getTestClientConfigs = function() {
  var configs = [];
  configs.push({
    'id': '1',
    'name': 'Dictionary Search 1',
    'tokens': [
    {
      'name':'WORD1',
      'parse_rules':['@a']
    }
    ],
    'url':'http://localhost:3003/word-map/common-words',
    'method': 'GET',
    'interval': 5000
  });
  configs.push({
    'id': '2',
    'name': 'Springs Weather',
    'tokens': [
    {
      'name':'CURRENT_TEMP',
      'parse_rules':['@current_observation','@temperature_string']
    },
    {
      'name':'CURRENT_TEMP_ICON',
      'parse_rules':['@current_observation','@icon_url']
    },
    {
      'name':'OBS_TIME',
      'parse_rules':['@current_observation','@observation_time']
    }
    ],
    'url':'http://api.wunderground.com/api/018eb35a6a033212/conditions/q/CO/Colorado_Springs.json',
    'method': 'GET',
    'interval': 30000
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