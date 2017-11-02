var uuidv4 = require('uuid/v4');

var WidgetTemplate = require('../models/widget-template');

module.exports = function(app) {

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

};