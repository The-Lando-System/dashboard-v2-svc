var WidgetTemplate = require('./widget-template');
var uuidv4 = require('uuid/v4');

module.exports = function(app) {
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
};