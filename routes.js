var uuidv4 = require('uuid/v4');

var WidgetTemplate = require('./widget-template');
var ClientConfig = require('./client-config');

module.exports = function(app) {

    // Widgets =======================================

    app.post('/widget/template', function (req, res) {

        var widgetTemplate = req.body.widget_template;
        var newWidgetTemplate = {
            'id': uuidv4(),
            'name': widgetTemplate.name,
            'html': widgetTemplate.html,
            'clientIds': widgetTemplate.clientIds,
            'tokens': widgetTemplate.tokens
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

    app.put('/client/:id', function (req, res) {
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

    app.get('/client', function (req, res) {
        ClientConfig.find({}, function(err, configs){
            if (err) { res.send(err); return; }
            res.json(configs);
            return;
        });
    });
};