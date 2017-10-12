var express = require('express');
var cors = require('cors');
var request = require('request');
var pathLib = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// App Setup =========================
var base = pathLib.resolve(__dirname);
var app = express();
var config = require('./config');

// Connect to DB
mongoose.connect(config.db, { useMongoClient: true }, function(err){
	if (err){
		console.log('ERROR! Could not connect to MongoDB!')
		if (err.message.includes('ECONNREFUSED')){
			console.log('The MongoDB connection was refused... Is your MongoDB running?');
		}
	}
});
mongoose.Promise = global.Promise;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./routes')(app);
require('./socket')(app); // Server starts in here; leave at the end