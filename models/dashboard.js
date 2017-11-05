var mongoose = require('mongoose');

module.exports = mongoose.model('Dashboard', {
  id:              { type: String,    default: ''    },
  userId:          { type: String,    default: ''    },
  name:            { type: String,    default: ''    },
  widgetIds:       { type: [String],  default: ''    },
  previewImage:    { type: String,    default: ''    },
  backgroundImage: { type: String,    default: ''    },
  isPrimary:       { type: Boolean,   default: false }
});