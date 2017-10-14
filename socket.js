var request = require('request');

var ClientConfig = require('./client-config');

module.exports = function(app) {

    var server = require('http').createServer(app);
    var io = require('socket.io')(server);

    io.on('connection', function(ws){

      // Get a list of the relevant client configs
      ClientConfig.find({}, function(err, configs){
        if (err) { console.log(err); }

        // Invoke a client for each configuration
        for(var config of configs) {
          config.error_count = 0;
          startClient(config,ws);
        }
        
      });

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

    if (config.error_count === 6) {
      config.error_count++;
      console.log(`Ignoring client name [${config.name}] with id [${config.id}]\n--> Failed more than 5 requests`);
      return;
    }
    if (config.error_count > 6) { return; }

    // Build the request
    var options = {
      url: config.url,
      method: config.method
    }

    // Invoke the request
    request(options, function(error, response, body) {
      if (error || response.statusCode != 200) {
        console.log(`ERROR: Client name [${config.name}] with id [${config.id}] encountered and error:\n--> ${error.message}`);
        config.error_count++;
        console.log(`--> Incrementing error count to ${config.error_count}`);
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