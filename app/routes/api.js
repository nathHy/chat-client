var express = require('express');
var router = express.Router();

router.get('/',function(req,res) {
	res.json({message:'hello from api.js'})
})


module.exports = router