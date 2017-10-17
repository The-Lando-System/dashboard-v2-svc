var request = require('request');

module.exports = {

  // Invoke a request using the provided client config
  makeRequest: function(clientConfig, requestCb) {

    // Build the request
    var options = {
      url: clientConfig.url,
      method: clientConfig.method
    };

    // Apply headers
    if (clientConfig.headers) {
      options.headers = clientConfig.headers
    }

    // Invoke the request
    request(options, requestCb);
  },
  
  // Make a request with OAuth2 authentication
  makeRequestOauth2: function(clientConfig, callback) {
  
    var authStr = new Buffer(
      clientConfig.oauth2_config.api_key + ':' + clientConfig.oauth2_config.api_secret
    ).toString('base64');

    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authStr
    }

    var options = {
      url: clientConfig.oauth2_config.auth_url,
      method: 'POST',
      headers: headers,
      form: {'grant_type': 'client_credentials'}
    };

    request(options, function(error, response, body) {
      
      try {
        body = JSON.parse(body);
      } catch(e) {
        return;
      }

      var headers = {
        'Authorization': 'Bearer ' + body.access_token
      };

      clientConfig.headers = headers;
    
      module.exports.makeRequest(clientConfig, callback);
    });
  },

  // Parse a value from JSON using the provided parsing rules
  parseResponse: function(tokens, json) {
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
  }

};