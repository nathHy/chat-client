var express = require('express');
var User    = require('../models/userSchema');
var router  = express.Router();


router.get('/:name',function(req,res) {
	var name = req.param('name')
	User.find({name:name},function(err,users) {
		if (err) return console.error(err);
		console.log('users are:',users)
	});
	res.json({message:'User ' + name + ' found.'})
})

router.get('/',function(req,res) {
	User.find({},function(err,users){
		if (err) return console.error(err);
		console.log('users found are:',users)
		res.json(users);
		res.end();
	})
})

router.post('/',function (req,res) {
	console.log("Got a register request")
	var data = {
		"success":"",
		"message":""
	};
	var user = req.body.username;
	var pass = req.body.password;
	var newUser = new User({
		username:user,
		name:user,
		password:pass
	});

	newUser.save(function (err,newUser) {
		if(err) { 
			console.error(err);
			data.success=false;
			data.message="Failed to register user";
			res.json(data);
			res.end();
			return
		}
		console.log("Saved user:",newUser)
		data.success=true;
		data.message="Succesfully registered user";
		res.json(data);
	});
})

module.exports = router