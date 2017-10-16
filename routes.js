var uuidv4 = require('uuid/v4');
var request = require('request');

var WidgetTemplate = require('./widget-template');
var ClientConfig = require('./client-config');

module.exports = function(app) {

    // Widgets =======================================

    app.post('/widget/template', function (req, res) {

      var newWidgetTemplate = {
        'id': uuidv4(),
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
      WidgetTemplate.find({}, function(err, templates){
        if (err) { res.send(err); return; }
        res.json(templates);
        return;
      });
    });

    app.put('/widget/template/:id', function (req, res) {
      WidgetTemplate.find({'id':req.params.id}, function(err,widgetTemplates){
        if (err) { res.send(err); return; }
        if (widgetTemplates.length > 1) { res.send({'ERROR':'Found more than one widget with id: ' + req.params.id}); return; }
        if (widgetTemplates.length === 0) { res.send({'ERROR':'Found no widgets with id: ' + req.params.id}); return; }

        var widgetTemplate = widgetTemplates[0];

        widgetTemplate.html       = req.body.html       || widgetTemplate.html;
        widgetTemplate.name       = req.body.name       || widgetTemplate.name;
        widgetTemplate.clientIds  = req.body.clientIds  || widgetTemplate.clientIds;
        widgetTemplate.tokens     = req.body.tokens     || widgetTemplate.tokens;
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

    // Clients =======================================

    app.post('/client', function (req, res) {

      var newClientConfig = {
        'id': uuidv4(),
        'name': req.body.name,
        'tokens': req.body.tokens,
        'url': req.body.url,
        'method' : req.body.method,
        'interval' : req.body.interval
      };

      ClientConfig.create(newClientConfig, function(err, template){
        if (err) { res.send(err); return; }
        res.send(template);
      });
    });

    app.put('/client/:id', function(req,res) {
      ClientConfig.find({'id':req.params.id}, function(err,clientConfigs){
        
        var clientConfig = clientConfigs[0];
        
        clientConfig.name     = req.body.name     || clientConfig.name;
        clientConfig.url      = req.body.url      || clientConfig.url;
        clientConfig.tokens   = req.body.tokens   || clientConfig.tokens;
        clientConfig.method   = req.body.method   || clientConfig.method;
        clientConfig.interval = req.body.interval || clientConfig.interval;

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
        ClientConfig.find({}, function(err, configs){
          if (err) { res.send(err); return; }
          res.json(configs);
          return;
        });
    });

    app.delete('/client/:id', function(req,res) {
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

    app.post('/client/test', function(req,res) {
      
      var clientConfig = req.body;

      // Perform OAuth2 if specified
      if (clientConfig.oauth2_config) {
        getAccessToken(clientConfig.oauth2_config, function(error, response, body) {

          body = JSON.parse(body);

          var headers = {
            'Authorization': 'Bearer ' + body.access_token
          };

          clientConfig.headers = headers;
        
          testRequest(res,clientConfig);
          return;
        });
      }
      
      testRequest(res,clientConfig);

    });
};

var testRequest = function(res,clientConfig) {
  
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
  request(options, function(error, response, body) {
    if (error || response.statusCode != 200) {
      res.status(400).send(error.message);
      return;
    }
    res.json(body);
  });
};

var getAccessToken = function(authConfig, callback) {
    
  var authStr = new Buffer( authConfig.api_key + ':' + authConfig.api_secret).toString('base64');

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + authStr
  }
  
  var options = {
    url: authConfig.auth_url,
    method: 'POST',
    headers: headers,
    form: {'grant_type': 'client_credentials'}
  }
  
  request(options, callback);
};