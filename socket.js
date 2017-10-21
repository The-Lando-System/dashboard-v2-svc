var clientExecutor = require('./client-executor');

module.exports = function(app,server) {

  var io = require('socket.io')(server);
  var websocket;

  io.on('connection', function(ws){
    websocket = ws;
  });

  app.post('/client/restart-clients', function(req,res) {
    clientExecutor.executeClients(websocket);
    res.send({'message':'Clients successfully restarted!'});
  });

};