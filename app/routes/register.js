var express = require('express');
var User    = require('../models/userSchema');
var router = express.Router();

router.post('/',function(req,res) {
	console.log("Got a register request")
	var data = {
		"success":"",
		"message":""
	};
	// console.log(req,res)
	var user = req.body.username;
	var pass = req.body.password;
	var newUser = new User({
		username:user,
		name:user,
		password:pass
	});

	console.log(user,pass)
	newUser.save(function (err,newUser) {
		if(err) { 
			console.error(err);
			data.success=false;
			data.message="Failed to register user";
			res.json(data);
			res.end();
			return
		}
		console.log("Saving user:",newUser)
		data.success=true;
		data.message="Succesfully registered user";
		res.json(data);
	});
});


module.exports = router