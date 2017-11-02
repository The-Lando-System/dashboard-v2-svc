var configFile = require('../config');
var request = require('request');

module.exports = function(app) {

  // Google Auth ===================================

  // Get the Google OAuth client ID from a config file
  app.get('/google/client-id', function (req, res) {
    if (configFile.google_client_id) {
      res.send({'client_id':configFile.google_client_id});
    } else {
      res.status(500);
      res.send({'ERROR':'Could not get the google client id! Check to see that it is present in config.js'});
    }
  });

  // Verify the OAuth access token against Google's identity provider
  app.use(function(req,res,next){
    var access_token = req.headers['x-access-token'];

    if (!access_token) {
      return res.status(400).json({
        'error' : 'No access token provided!',
        'details' : 'The header [x-access-token] must be provided in the request'
      });
    }

    var options = {
      url: `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`,
      method: 'POST'
    };
    request(options, function(error, response, body) {
      
      let tokenInfo;
      try {
        tokenInfo = JSON.parse(body);
      } catch(e) {
        console.log(e);
        return res.status(500).json({
          'error' : 'Unknown error occurred',
          'details' : e
        });
      }

      if (!tokenInfo || !tokenInfo.email) {
        var error_message = {
          'error' : `Failed to verify access token [${access_token}]`
        };
        if (error && error.message) {
          error_message.details = error.message;
        }
        return res.status(400).json(error_message);
      }
      req.id = tokenInfo.email;
      next();
    });
  });

};