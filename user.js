var mongoose = require('mongoose');

var model = mongoose.model('user', new mongoose.Schema({
  userName: {type:String, unique:true}
  //, not: {type: String}
  //, not: {type: String}
	, shocked: {type: Boolean}
	, angrymeh: {type: Boolean}
	, shouty: {type: Boolean}
  , password: {type: String}
  , salt: {type: String}
}));

exports.getModels = function() {
	return model;
}
