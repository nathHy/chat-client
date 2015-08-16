var mongoose = require('mongoose');

var usersSchema = new mongoose.Schema({
	name: {type:String, required:true},
	username: {type:String, required:true,index:{unique:true}},
	email: {type:String, required:false},
	password: {type:String, required:true},
	created_at:Date
}, {
	collection:'users'
});


usersSchema.pre('save',function(next) {
	var createdDate = new Date();

	if (!this.created_at)
		this.created_at=createdDate;

	next();
});


var User = mongoose.model('User',usersSchema)

module.exports = User
