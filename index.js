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

app.get('/', function(req, res)
{
	res.sendfile('public/index.html');
});

// app.get('/user.html',function(req,res){
// 	res.sendfile('private.html');
// });
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public')));

http.listen(3000, function()
{
	console.log('listening on *:3000');
});


var clients = [];
var usersTypingById = {};
var usersTypingByName = [];


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


	socket.on('chat message', function(msg)
	{
		// msg = getClient(socket.id)['username'] + ':' + msg;
		var user = getClient(socket.id);
		if (msg == '')
		{
			return false;
		}

		if (msg.indexOf("W:") == 0 ) {
			croppedMsg = msg.slice(msg.search(/\s/)+1);
			var obj = {
				type: 'private message',
				time: (new Date().toString()),
				text: croppedMsg,
				author: user['username'],
				colour: user['colour'],
				textColour: 'rgb(242,0,255)'
			};
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
		io.emit('chat message', obj);

		// fs.appendFile("/home/user/chatclient/logs/mainChat.log",msg+"\n", function(err){
		// 	if (err){
		// 		return console.log(err);
		// 	}
		// 	console.log('the file was saved');
		// })
	});


	socket.on('login', function(user)
	{
		console.log('login is : ' + user + ' with socket id ' + socket.id);
		colour = colours.shift();
		colours.push(colour);
		client = {
			id: socket.id,
			username: user,
			typing: false,
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
		socket.emit('login', 'Enjoy your stay!');
		io.emit('users', clients);
	});

	socket.on('typing', function(data)
	{
		if (data == true)
		{
			console.log('its true');
		}
		for (var i = clients.length - 1; i >= 0; i--)
		{
			if (clients[i]['id'] != socket.id)
			{
				console.log('sending typing info');
				io.to(clients[i]['id']).emit('isTyping',
				{
					isTyping: data,
					person: getClient(socket.id).username
				});
			}
		}
	});
});



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