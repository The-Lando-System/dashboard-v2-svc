var uuidv4 = require('uuid/v4');

var clientRequest = require('../services/client-request');
var ClientConfig = require('../models/client-config');

module.exports = function(app) {

  // Clients =======================================

  app.post('/client', function (req, res) {

    var newClientConfig = {
      'id': uuidv4(),
      "userId": req.id,
      'name': req.body.name,
      'tokens': req.body.tokens,
      'url': req.body.url,
      'method' : req.body.method,
      'interval' : req.body.interval,
      'oauth2_config' : req.body.oauth2_config
    };

    ClientConfig.create(newClientConfig, function(err, template){
      if (err) { res.send(err); return; }
      res.send(template);
    });
  });

  app.put('/client/:id', function(req,res) {
    ClientConfig.find({'id':req.params.id}, function(err,clientConfigs){
      
      if (err) { res.send(err); return; }
      if (clientConfigs.length > 1) { res.send({'error':'Found more than one client with id: ' + req.params.id}); return; }
      if (clientConfigs.length === 0) { res.send({'error':'Found no clients with id: ' + req.params.id}); return; }
      if (req.id !== clientConfigs[0].userId) { res.send({'error':'User does not have permissions to edit client with id: ' + req.params.id}); return; }

      var clientConfig = clientConfigs[0];
      
      clientConfig.name = req.body.name || clientConfig.name;
      clientConfig.url = req.body.url || clientConfig.url;
      clientConfig.tokens = req.body.tokens || clientConfig.tokens;
      clientConfig.method = req.body.method || clientConfig.method;
      clientConfig.interval = req.body.interval || clientConfig.interval;
      clientConfig.oauth2_config = req.body.oauth2_config || clientConfig.oauth2_config;

      clientConfig.save(function(err){
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'Client Config with ID ' + req.params.id + ' was successfully updated!' });
        }
      });
    });
  });

  app.get('/client', function(req,res) {
      ClientConfig.find({'userId':req.id}, function(err, configs){
        if (err) { res.send(err); return; }
        res.json(configs);
        return;
      });
  });

  app.delete('/client/:id', function(req,res) {
    ClientConfig.find({'id':req.params.id}, function(err,clientConfigs){
      if (err) { res.send(err); return; }
      if (clientConfigs.length > 1) { res.send({'error':'Found more than one client with id: ' + req.params.id}); return; }
      if (clientConfigs.length === 0) { res.send({'error':'Found no clients with id: ' + req.params.id}); return; }
      if (req.id !== clientConfigs[0].userId) { res.send({'error':'User does not have permissions to delete client with id: ' + req.params.id}); return; }

      ClientConfig.remove({'id': req.params.id }, function(err,clientConfig){
        if (err) {
          res.send(err);
          return;
        } else {
          res.send(clientConfig);
          return;
        }
      });
    });
  });

  app.post('/client/test', function(req,res) {
    
    var clientConfig = req.body;

    var sendResponse = function(error, response, body) {
      if (error || response.statusCode != 200) {
        res.status(400).send(error ? error.message : 'unknown error occurred');
        return;
      }
      res.json(body);
    };

    // Perform OAuth2 if specified
    if (clientConfig.oauth2_config && Object.keys(clientConfig.oauth2_config).length > 0) {
      clientRequest.makeRequestOauth2(clientConfig, sendResponse);
    } else {
      clientRequest.makeRequest(clientConfig, sendResponse);
    }
  });
};