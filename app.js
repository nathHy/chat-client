// Tutorial at http://socket.io/get-started/chat/
// Another tutorial http://ahoj.io/nodejs-and-websocket-simple-chat-tutorial
// ^^ has history along with colours. 
// http://www.tamas.io/further-additions-to-the-node-jssocket-io-chat-app/
/*
	READ THIS
	This provides a lot of info on the namespace. 
	Clients. rooms etc. 
	INVESTIGATE
	Use to find list of clients.
	console.log(io.of("/"))
	
	
	
*/
// Modules
var app        = require('express')();
var express    = require('express');
var http       = require('http').Server(app);
var io         = require('socket.io')(http);
var path       = require('path')
var fs         = require('fs');
var bodyParser = require('body-parser')

//Routes for Express
var routes   = require('./app/routes/routes')
var users    = require('./app/routes/users')
var api      = require('./app/routes/api')
var login    = require('./app/routes/login')
var register = require('./app/routes/register')


// Env Variables
var PORT = '3000'


// Mongo DB stuff
var mongoose = require('mongoose');
var User     = require('./app/models/userSchema');


mongoose.connect('mongodb://localhost/chatclient')
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error:'));
db.once('open',function(callback){
	// yay?
});



// var User = mongoose.model('User', userSchema)

// var bob = new User({name:'bob',email:'a@b.com',password:'woops'})
// bob.save(function(err,bob) {
// 	if (err) return console.error(err);
// 	console.log('saving bob',bob)
// });


// User.remove({},function(){});

// User.find(function(err,users) {
// 	if (err) return console.error(err);
// 	console.log('users are:',users)
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',routes);
app.use('/user',users);
app.use('/register',register);
app.use('/login',login);
app.use('/api',api);

app.get('/hello', function(req, res)
{
	res.write('hello')
});

app.get('/login', function(req, res)
{
	res.sendfile('public/login.html')
});


// app.post('/user',function (req,res) {
// 	console.log("Got a register request")
// 	var data = {
// 		"success":"",
// 		"message":""
// 	}
// 	// console.log(req,res)
// 	var user = req.body.username;
// 	var pass = req.body.password;
// 	var newUser = new User({
// 		username:user,
// 		name:user,
// 		password:pass
// 	});

// 	console.log(user,pass)
// 	newUser.save(function (err,newUser) {
// 		if(err) { 
// 			console.error(err);
// 			data.success=false;
// 			data.message="Failed to register user";
// 			res.json(data);
// 		}
// 		console.log("Saving user:",newUser)
// 		data.success=true;
// 		data.message="Succesfully registered user";
// 		res.json(data);
// 	}) 
// });

app.get('/', function(req, res)
{
	res.sendfile('public/index.html');
});

http.listen(PORT, function()
{
	console.log('listening on *:',PORT);
});

console.log("Defining global vars");
var clients = [];

var history = [];

var colours = ['red', 'blue', 'green', 'cyan', 'pink', 'orange'];

var rooms = {};

io.on('connection', function(socket)
{
	console.log('a user connected');

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
		// displayInfo();
		if (msg == '')
		{
			return false;
		}
		var obj = {
			type: 'message',
			time: (new Date().toString()),
			text: msg,
			author: user['username'],
			colour: user['colour'],
			textColour:'black',
			room:room
		};
		console.log('sending msg: ' + msg + ' to room: ' + room);
		io.sockets.in(room).emit('chat message', obj);
	});


	socket.on('join room', function (room,fn) {
		console.log('Request from',socket.id,'to join room - ', room)
		if (socket.rooms[room] !== undefined) {
			fn({success:false,msg:"Already in room:" + room})
			return false;
		}
		socket.join(room);
		socket.rooms[room]=room;
		if (rooms[room] === undefined) {
			rooms[room]=room
		}
		io.emit('send rooms', rooms)
		fn({success:true});
		console.log('Rooms have been sent to ',socket.id)
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

function displayInfo() {
	var namespace = '/';
	var roomName = 'general';
	console.log("Adapter rooms")
	console.log(io.nsps[namespace].adapter.rooms)
	console.log()
	console.log('Looping over rooms')
	for (var room in io.nsps[namespace].adapter.rooms) {
		console.log('Room is ',room)
	    for (var socketId in io.nsps[namespace].adapter.rooms[room])
	    	console.log('Connected Client is : ',getClient(socketId).username)	}
}