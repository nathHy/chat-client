// Tutorial at http://socket.io/get-started/chat/
// Another tutorial http://ahoj.io/nodejs-and-websocket-simple-chat-tutorial
// ^^ has history along with colours. 
// http://www.tamas.io/further-additions-to-the-node-jssocket-io-chat-app/
// 
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path')
var fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/hello', function(req, res)
{
	res.write('hello')
});
app.get('/', function(req, res)
{
	res.sendfile('public/index.html');
});

// app.get('/user.html',function(req,res){
// 	res.sendfile('private.html');
// });
// app.use(express.static(path.join(__dirname, 'public')));

http.listen(3000, function()
{
	console.log('listening on *:3000');
});


var clients = [];

var history = [];

var colours = ['red', 'blue', 'green', 'yellow', 'cyan', 'pink'];


io.on('connection', function(socket)
{
	console.log('a user connected');
	// fs.readFile('/home/user/chatclient/logs/mainChat.log',function read(err,data){
	// 	if (err){
	// 		return console.log(err);
	// 	}
	// 	var history = data;
	// socket.emit('send history',history)


	socket.on('disconnect', function()
	{
		client = getClient(socket.id);
		console.log('user disconnected');
		var obj = {
			type: 'system',
			time: (new Date().toString()),
			text: 'Goodbye ',
			author: client.username,
			colour: client.colour,
			textColour:'black'
		};
		io.emit('chat message', obj);
		for (var i = clients.length - 1; i >= 0; i--)
		{
			if (clients[i]['id'] == socket.id)
			{
				clients.splice(i, 1); // remove user that is leaving
				io.emit('users', clients); // update all online clients
				return false;
			}
		};
	});


	socket.on('chat message', function(data)
	{
		msg=data.msg
		room=data.room
		var user = getClient(socket.id);
		if (msg == '')
		{
			return false;
		}

		PM=false;

		if (msg.indexOf("W:") == 0 ) {
			targetUser = msg.slice(2,msg.search(/\s/));//slice after W: but before the first space.
			croppedMsg = msg.slice(msg.search(/\s/)+1);//slice after first space
			PM=true;
			var obj = {
				type: 'private message',
				time: (new Date().toString()),
				text: croppedMsg,
				author: user['username'],
				colour: user['colour'],
				textColour: 'rgb(242,0,255)'
			}; // TODO fix this. it sends to all clients still somehow.
		} else {

			var obj = {
				type: 'message',
				time: (new Date().toString()),
				text: msg,
				author: user['username'],
				colour: user['colour'],
				textColour:'black'
			};
		}
		history.push(obj);
		history = history.slice(-100);
		console.log('sending msg');
		if (PM) {
			console.log('this is a PM to ',targetUser)
			targetID=getClientByName(targetUser);
			console.log(targetID)
			if (targetID) {
				console.log('Sending msg to ', targetID['id'])
				io.to(targetID['id']).emit('chat message',obj);
				io.to(socket.id).emit('chat message',obj)
			}
		} else {
			io.sockets.in(room).emit('chat message', obj);
		}
});


socket.on('join room', function (room) {
	console.log('join room - ' + room)
	socket.join(room);
	socket.rooms[room]=room;
});

socket.on('leave room', function (room) {
	console.log('leaving room - ' + room)
	socket.leave(room);
	delete socket.room[room];
});

socket.on('login', function(user,fn)
{
	console.log('login is : ' + user + ' with socket id ' + socket.id);
	valid = validateUserName(user);
	if (!valid) {
		console.log('login failed for ',socket.id, ' ',user)
		socket.emit('login',{success:false,response:"username taken already",username:user})
		return false;
	}
	colour = colours.shift();
	colours.push(colour);
	client = {
		id: socket.id,
		username: user,
		colour: colour
	};
	clients.push(client);
	var obj = {
		type: 'system',
		time: (new Date().toString()),
		text: 'Welcome',
		author: client.username,
		colour: client.colour,
		textColour:'black'
	};
	for (var i = clients.length - 1; i >= 0; i--)
	{
		client = clients[i];
		console.log(client['username']);
		if (client['username'] != 'undefined')
		{
			io.to(clients[i]['id']).emit('chat message', obj)
		}
	}
	socket.emit('login', {success:true,response:'Enjoy your stay!'});
	io.emit('users', clients);
});


socket.on('join room', function(room) {
	console.log("Request to join room ", room, "from socket", socket.id)
	socket.join(room);
	client=getClient(socket.id)
	console.log(client.username)
	socket.emit('room joined', {success:true,data:{message:'Welcome to ' + room}})
	var obj = {
		type: 'system',
		time: (new Date().toString()),
		text: 'Welcome to ' + room,
		author: client.username,
		colour: client.colour,
		textColour:'black'
	};
	socket.to(room).emit("chat message", obj)
})



}); // end socket.


function validateUserName(user) 
{
	if (user.indexOf(' ') != -1) {
		return false;
	}
	for (var i = clients.length - 1; i >= 0; i--)
	{
		console.log(clients[i]['username'])
		if (clients[i]['username'] == user)
		{
			return false;
		}
	};
	return true;
}


function getClient(socid)
{
	var client = null;
	for (var i = clients.length - 1; i >= 0; i--)
	{
		if (clients[i]['id'] == socid)
		{
			client = clients[i];
		}
	};
	if (client == null)
	{
		return false;
	}
	else
	{
		return client;
	}
}

function removeClient(socid)
{
	var client;

	for (var i = clients.length - 1; i >= 0; i--)
	{
		if (clients[i]['id'] == socid)
		{
			client = clients[i];
			clients.splice(i, 1);
		}
	};

	if (client == null)
	{
		return false;
	}
	else
	{
		return client;
	}
}



function getClientByName(name) 
{
	var client;
	for (var i = clients.length - 1; i >= 0; i--)
	{
		dump(clients[i])
		if (clients[i]['username'] == name)
		{
			client = clients[i];
		}
	};
	if (client == null)
	{
		return false;
	}
	else
	{
		return client;
	}
}


function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }
    console.log(out);
}
