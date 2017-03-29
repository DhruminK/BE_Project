// nlp/question_login_authentication.js

//IMPORTING THE NECESSARY PACKAGES ---------------------
const _        = require('lodash');
const nlp      = require('nlp_compromise');
const http     = require('http');
const Question = require('../app/models/Questions.js');
const User     = require('../app/models/User.js')
const qs_gen   = require('./Question_Generation.js');
const request  = require('request');

// Function select random question from the database
function ask_random_question(done, question_set) {

    // generating a random number
    let number = 0;

    // loop to find he question is already eing send to user or not
    while (true) {
        number = _.random(question_set.length - 1);
        let b = _.find(done, (value) => {
            if (value === number) {
                return true;
            }
            return false;
        });
        if (b === undefined) {
            break;
        }
    }

    // if the question is not asked, then sent it to user
    done.push(number);
    let qs = question_set[number];
    let k = {
        done: done,
        question: qs
    };
    return k;
}

// Exposing the function to rest of the app
module.exports = (socket, user, message) => {
	var hard = 'hard';
	var medium = 'medium';
	var easy = 'easy';
    Question.findOne({ '_id': user.qs }, (err, qs) => {
    	console.log(qs);
        if (err) {
            throw err;
        }
        if (!qs) {
            message.content = 'Bugger, it seems we misplaced your questions please login with facebook again to continue your sign-up process';
            socket.emit('message', message);
            User.find({ 'facebook.id': user.facebook.id }).remove();
        } else {
            let done = {};
            let hcount = 0;
            let e_wrong_count = 0;
            let h_right_count = 0;
            done.easy = [];
            done.medium = [];
            done.hard = [];
            done.medium_easy = 0;
            message.content = 'We will start asking you few questions to verify you ';
            socket.emit('message', message);
            let k = ask_random_question(done.medium, qs.qs_medium);
            let question = k.question.question;
            let answer = k.question.answer;
            let question_type = medium;
            done.medium = k.done;
            message.content = question;
            socket.emit('message:question', message);
            socket.on('message:question', (msg) => {
                let options = {
                    host: 'localhost',
                    port: '8080',
                    path: '/query_similar',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                let data = {
                    summary: [],
                    query: msg.content
                };
                data.summary.push(answer);
                let d = JSON.stringify(data);
                request({
                    url: 'http://localhost:8888/query_similar',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'Application/json'
                    },
                    json: data
                }, (err, response, body) => {
                    if (err) {
                        console.log(err);
                    }
                    a = _.filter(body, (value, key)=> {
                    	if(value > 0.3) {
                    		return true;
                    	}
                    	return false;
                    });
                    if(a) {
                    	if(question_type === medium) {
            				question_type = hard;
                    		k = ask_random_question(done.hard, qs.qs_hard);
                    		question = k.question.question;
                    		answer = k.question.answer;
                    		done.hard = k.done;
                    		message.content = question;
                    		return socket.emit('message:question', message);
                    	}
                    	else if(question_type === easy) {
                    		question_type = medium;
                    		k = ask_random_question(done.medium, qs.qs_medium);
                    		question = k.question.question;
                    		answer = k.question.answer;
                    		done.medium = k.done;
                    		message.content = question;
                    		return socket.emit('message:question', message);
                    	}
                    	else if(question_type === hard) {
                    		if(hcount === 1) {
                    			message.content = 'We have successfully authenticated you';
                    			return socket.emit('message:question', message);
                    			
                    			/*else if(h_right_count === 0) {
                    				message.content = 'We cannot verify your authenticity therefore we will redirect you to the index page';
                    				socket.emit('message', message);
                    				return socket.emit('redirect:index');
                    			}*/
                    		}
                    		h_right_count++;
                    		hcount++;
                    		question_type = hard;
                    		k = ask_random_question(done.hard, qs.qs_hard);
                    		question = k.question.question;
                    		answer = k.question.answer;
                    		done.hard = k.done;
                    		message.content = question;
                    		return socket.emit('message:question', message);
                    	}
                    }
                    else {
                    	if(question_type === medium) {
                    		if(medium_easy === 2) {
                    			message.content = 'We failed to verify your authenticity, therefore we will redirect you to the index page';
                    			socket.emit('message', message);
                    			return socket.emit('redirect:index');
                    		}
                    		medium_easy++;
                    		question_type = easy;
                    		k = ask_random_question(done.easy, qs.qs_medium);
                    		question = k.question.question;
                    		answer = k.question.answer;
                    		done.medium = k.done;
                    		message.content = question;
                    		return socket.emit('message:question', message);
                    	}
                    	else if(question_type === easy) {
                    		if(e_wrong_count === 1) {
                    			message.content = 'We failed to verify your authenticity, therefore we will redirect you to the index page';
                    			socket.emit('message', message);
                    			return socket.emit('redirect:index');
                    		}
                    		e_wrong_count++;
                    		question_type = easy;
                    		k = ask_random_question(done.easy, qs.qs_easy);
                    		question = k.question.question;
                    		answer = k.question.answer;
                    		done.easy = k.done;
                    		message.content = question;
                    		return socket.emit('message:question', message);
                    	}
                    	else if(question_type === hard) {
                    		if(hcount === 1) {
                    			if(h_right_count === 1) {
                    				message.content = 'We have successfully authenticated you';
                    				return socket.emit('message:question', message);
                    			}
                    			else if(h_right_count === 0) {
                    				message.content = 'We cannot verify your authenticity therefore we will redirect you to the index page';
                    				socket.emit('message', message);
                    				return socket.emit('redirect:index');
                    			}
                    		}
                    		hcount++;
                    		question_type = hard;
                    		k = ask_random_question(done.hard, qs.qs_hard);
                    		question = k.question.question;
                    		answer = k.question.answer;
                    		done.hard = k.done;
                    		message.content = question;
                    		return socket.emit('message:question', message);
                    	}
                    }
                });
            });

        }
    });
};
