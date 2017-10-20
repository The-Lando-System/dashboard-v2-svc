var clientExecutor = require('./client-executor');

module.exports = function(app,server) {

  var io = require('socket.io')(server);

  io.on('connection', function(ws){
    app.post('/restart-clients', function(req,res) {
      clientExecutor.executeClients(ws);
      res.send({'message':'Clients successfully restarted!'});
    });
  });

};