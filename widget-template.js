var mongoose = require('mongoose');

module.exports = mongoose.model('WidgetTemplate', {
  id:           { type: String, default: '' },
  userId:       { type: String, default: '' },
  name:         { type: String, default: '' },
  html:         { type: String, default: '' },
  clientIds:    { type: [String], default: '' },
  tokens:       { type: [String], default: '' },
  position:     { type: String, default: '-1' }
});