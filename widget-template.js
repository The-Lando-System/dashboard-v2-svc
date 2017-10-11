var mongoose = require('mongoose');

module.exports = mongoose.model('WidgetTemplate', {
  id:           { type: String, default: '' },
  name:         { type: String, default: '' },
  html:         { type: String, default: '' },
  clientIds:    { type: [String], default: '' },
  tokens:       { type: [String], default: '' }
});