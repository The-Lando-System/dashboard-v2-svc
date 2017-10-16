var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;

module.exports = mongoose.model('ClientConfig', {
  id:            { type: String, default: '' },
  name:          { type: String, default: '' },
  tokens:        { type: [Mixed] },
  url:           { type: String, default: '' },
  method:        { type: String, default: '' },
  interval:      { type: Number, default: 60000 },
  oauth2_config: { type: Mixed }
});