var mongoose = require('mongoose');

var model = mongoose.model('user1', new mongoose.Schema({
  userName: {type:String, unique:true}
  , password: {type: String}
  , salt: {type: String}
}));

exports.getModels = function() {
	return model;
}
