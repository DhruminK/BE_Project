// app/models/User.js

//IMPORITNG THE NECESSARY PACKAGES ----------
const mongoose = require('mongoose');

// Define our schema
let UserSchema = mongoose.Schema({
	local: {
		first_name  : 'String',
		last_name   : 'String',
		middle_name : 'String',
		full_name   : 'String'
	},
	facebook: {
		id       : 'String',
		email    : 'String',
		gender   : 'String',
		token    : 'String',
		picture  : {
			is_silhouette : { type: Boolean, default: false},
			url           : 'String'
		},
		age      : {type: Number}
	},
	qs: { type: mongoose.Schema.Types.ObjectId }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', UserSchema);