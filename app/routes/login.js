var express = require('express');
var User    = require('../models/userSchema');
var router = express.Router();

router.post('/',function(req,res) {
	var data = {
		"success":"",
		"message":""
	};
	var loginUser = {};
	loginUser.username = req.body.username;
	loginUser.password = req.body.password;
	console.log(loginUser)
	User.find(loginUser,function (err,user) {
		if (err) console.error(err);
		console.log("Found user",user)
		if (user.length !== 0){
				res.json({success:true,message:user})
			}
		else {
			res.json({success:false,message:"Incorrect Username or password"})
		}
	})
})


module.exports = router