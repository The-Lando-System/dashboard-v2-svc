var uuidv4 = require('uuid/v4');

var Dashboard = require('../models/dashboard');

module.exports = function(app) {

  // Dashboards =======================================

  app.post('/dashboard', function (req, res) {

    var newDashboard = {
      'id': uuidv4(),
      'userId': req.id,
      'name': req.body.name,
      'widgetIds': req.body.widgetIds
    };

    Dashboard.create(newDashboard, function(err, dashboard){
      if (err) { res.send(err); return; }
      res.send(dashboard);
    });
  });

  app.get('/dashboard', function (req, res) {
    Dashboard.find({'userId':req.id}, function(err, dashboards){
      if (err) { res.send(err); return; }
      res.json(dashboards);
      return;
    });
  });

  app.put('/dashboard/:id', function (req, res) {
    Dashboard.find({'id':req.params.id}, function(err,dashboards){
      if (err) { res.send(err); return; }
      if (dashboards.length > 1) { res.send({'error':'Found more than one dashboard with id: ' + req.params.id}); return; }
      if (dashboards.length === 0) { res.send({'error':'Found no dashboards with id: ' + req.params.id}); return; }
      if (req.id !== dashboards[0].userId) { res.send({'error':'User does not have permissions to edit dashboard with id: ' + req.params.id}); return; }

      var dashboard = dashboards[0];

      dashboard.name = req.body.name || dashboard.name;
      dashboard.widgetIds = req.body.widgetIds || dashboard.widgetIds;
      dashboard.previewImage = req.body.previewImage || dashboard.previewImage;
      dashboard.backgroundImage = req.body.backgroundImage || dashboard.backgroundImage;
      dashboard.isPrimary = req.body.isPrimary || dashboard.isPrimary;
      
      dashboard.save(function(err){
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'Dashboard with ID ' + req.params.id + ' was successfully updated!' });
        }
      });
    });
  });

  app.delete('/dashboard/:id', function(req,res) {
    Dashboard.find({'id':req.params.id}, function(err,dashboards){
      if (err) { res.send(err); return; }
      if (dashboards.length > 1) { res.send({'error':'Found more than one dashboard with id: ' + req.params.id}); return; }
      if (dashboards.length === 0) { res.send({'error':'Found no dashboards with id: ' + req.params.id}); return; }
      if (req.id !== dashboards[0].userId) { res.send({'error':'User does not have permissions to delete dashboard with id: ' + req.params.id}); return; }

      Dashboard.remove({'id': req.params.id }, function(err,dashboard){
        if (err) {
          res.send(err);
          return;
        } else {
          res.send(dashboard);
          return;
        }
      });
    });
  });
  
};