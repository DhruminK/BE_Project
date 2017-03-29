// app/models/Questions.js

// IMPORTING THE NECESSARY PACKAGES -------------
const mongoose = require('mongoose');
const User = require('./User.js');

let QuestionSchema = mongoose.Schema({
	qs_easy: [{
		question: 'String',
		answers: 'String'
	}],
	qs_medium: [{
		question: 'String',
		answers:  'String'
	}],
	qs_hard: [{
		question: 'String',
		answers: 'String'
	}]
});

module.exports = mongoose.model('Questions', QuestionSchema);
