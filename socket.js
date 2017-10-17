var request = require('request');

var clientRequest = require('./client-request');

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

    var handleResponse = function(error, response, body) {
      if (error || response.statusCode != 200) {
        console.log(`ERROR: Client name [${config.name}] with id [${config.id}] encountered an error:\n--> ${error.message}`);
        config.error_count++;
        console.log(`--> Incrementing error count to ${config.error_count}`);
        return;
      }
    
      // Parse the value from the response
      var parsedValues = clientRequest.parseResponse(config.tokens, JSON.parse(body));
  
      // Send the websocket message
      var message = {
        'client_id' : config.id,
        'token_name' : config.token,
        'parsed_values': parsedValues
      };
      ws.emit('TOKEN_UPDATE', message);
    };

    // Perform OAuth2 if specified
    if (config.oauth2_config && Object.keys(config.oauth2_config).length > 0) {
      clientRequest.makeRequestOauth2(config, handleResponse);
    } else {
      clientRequest.makeRequest(config, handleResponse);
    }
    
  };

  // Invoke the client for the first time
  invokeClient();

  // Set a repeat interval for invoking the client
  setInterval(invokeClient, config.interval);
};