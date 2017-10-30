var uuidv4 = require('uuid/v4');

var configFile = require('./config');
var request = require('request');

var clientRequest = require('./client-request');

var WidgetTemplate = require('./widget-template');
var ClientConfig = require('./client-config');

module.exports = function(app) {

  // Google Auth ===================================

  app.get('/google/client-id', function (req, res) {
    if (configFile.google_client_id) {
      res.send({'client_id':configFile.google_client_id});
    } else {
      res.status(500);
      res.send({'ERROR':'Could not get the google client id! Check to see that it is present in config.js'});
    }
  });

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

  // Widgets =======================================

  app.post('/widget/template', function (req, res) {

    var newWidgetTemplate = {
      'id': uuidv4(),
      'userId': req.id,
      'name': req.body.name,
      'html': req.body.html,
      'clientIds': req.body.clientIds,
      'tokens': req.body.tokens
    };

    WidgetTemplate.create(newWidgetTemplate, function(err, template){
      if (err) { res.send(err); return; }
      res.send(template);
    });
  });

  app.get('/widget/template', function (req, res) {
    WidgetTemplate.find({'userId':req.id}, function(err, templates){
      if (err) { res.send(err); return; }
      res.json(templates);
      return;
    });
  });

  app.put('/widget/template/:id', function (req, res) {
    WidgetTemplate.find({'id':req.params.id}, function(err,widgetTemplates){
      if (err) { res.send(err); return; }
      if (widgetTemplates.length > 1) { res.send({'error':'Found more than one widget with id: ' + req.params.id}); return; }
      if (widgetTemplates.length === 0) { res.send({'error':'Found no widgets with id: ' + req.params.id}); return; }
      if (req.id !== widgetTemplates[0].userId) { res.send({'error':'User does not have permissions to edit widget with id: ' + req.params.id}); return; }

      var widgetTemplate = widgetTemplates[0];

      widgetTemplate.html       = req.body.html       || widgetTemplate.html;
      widgetTemplate.name       = req.body.name       || widgetTemplate.name;
      widgetTemplate.clientIds  = req.body.clientIds  || widgetTemplate.clientIds;
      widgetTemplate.tokens     = req.body.tokens     || widgetTemplate.tokens;
      widgetTemplate.position   = req.body.position   || widgetTemplate.position;
      
      widgetTemplate.save(function(err){
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'Widget Template with ID ' + req.params.id + ' was successfully updated!' });
        }
      });
    });
  });

  app.delete('/widget/template/:id', function(req,res) {
    WidgetTemplate.find({'id':req.params.id}, function(err,widgetTemplates){
      if (err) { res.send(err); return; }
      if (widgetTemplates.length > 1) { res.send({'error':'Found more than one widget with id: ' + req.params.id}); return; }
      if (widgetTemplates.length === 0) { res.send({'error':'Found no widgets with id: ' + req.params.id}); return; }
      if (req.id !== widgetTemplates[0].userId) { res.send({'error':'User does not have permissions to delete widget with id: ' + req.params.id}); return; }

      WidgetTemplate.remove({'id': req.params.id }, function(err,widget){
        if (err) {
          res.send(err);
          return;
        } else {
          res.send(widget);
          return;
        }
      });
    });
  });

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