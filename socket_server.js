var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(8100, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});


var clients = [] 

function sendToClient( type,data , connection){
	if ('object' == typeof data ) data.time = new Date

	var dataToClient = JSON.stringify( { type: type, data: data } )
	if (null != connection)
		connection.sendUTF(dataToClient)
	else
		wsServer.broadcast(dataToClient)
	}
function htmlEncode(data){
	return data.replace('<','&lt;').replace('>' , '&gt;')
	}
// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin)
	var userIno = {'ip' : connection.remoteAddress , 'nicky' :''}
	var index = clients.push(userIno) -1 

	sendToClient( 'users', clients , connection)
    // This is the most important callback for us, we'll handle
    // all messages from users here.
	var nicky = ''
    connection.on('message', function(message) {
        if (message.type !== 'utf8') return
		var msg = JSON.parse(message.utf8Data),
			data = msg.data
		if (data && 'string' == typeof data) data = htmlEncode(data)
		switch (msg.type){
			case 'login':
				sendToClient('msg' , {
					'from' : 'sys',
					'data': '<i>' + data + '</i> check in '
					})
			case 'setName':
				clients[index].nicky = nicky = data
				sendToClient('users' , clients)
				break
			case 'sendMsg':
				sendToClient('msg' , {
					'from' : nicky
					,'data': data 
					,'color' : htmlEncode(msg.color.trim())
					})
				
				break
			}
    });

    connection.on('close', function(connection) {
        // close user connection
		sendToClient('msg' , {
			'from' : 'sys',
			'data': '<i>'+ nicky + '</i> check out '
			//toLocaleTimeString()
			})
		clients.splice(index,1)
    });
});
