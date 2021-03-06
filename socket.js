var clientExecutor = require('./services/client-executor');

module.exports = function(app,server) {

  var io = require('socket.io')(server);
  var websocket;

  io.on('connection', function(ws){
    websocket = ws;
  });

  app.post('/client/restart-clients', function(req,res) {
    clientExecutor.executeClients(websocket,req.id);
    res.send({'message':'Clients successfully restarted!'});
  });

};