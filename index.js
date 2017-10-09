var express = require('express');
var request = require('request');
var pathLib = require('path');
var mongoose = require('mongoose');

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


// Set CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require('./routes')(app);
require('./socket')(app); // Server starts in here; leave at the end