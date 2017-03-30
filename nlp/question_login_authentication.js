// nlp/question_login_authentication.js

//IMPORTING THE NECESSARY PACKAGES ---------------------
const _ = require('lodash');
const nlp = require('nlp_compromise');
const http = require('http');
const Question = require('../app/models/Questions.js');
const User = require('../app/models/User.js')
const qs_gen = require('./Question_Generation.js');
const request = require('request');
const api_ai = require('./Api.ai.js');

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

// Function to verify the answer to question
function verify_ans(ans, query, done) {
    let m = {
        query: query,
        summary: []
    };
    m.summary.push(ans);
    console.log('------------');
    console.log(m);
    console.log('------------');
    request({
        url: 'http://localhost:8888/query_similar',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        json: m,
    }, (err, response, body) => {
        if (err) {
            throw err;
        }
        if (!body) {
            return console.log('Why are you here ?');
        }
        done(body);
    });
}

// Function to emit a question from dataset
function ask_qs(socket, question, message) {
    message.content = question;
    return socket.emit('message:question', message);
}
/*question_type = hard;
k = ask_random_question(done.hard, qs.qs_hard);
question = k.question.question;
answer = k.question.answers;
done.hard = k.done;
message.content = question;
return socket.emit('message:question', message);*/

module.exports = (socket, user, message) => {
    const hard = 'hard';
    const medium = 'medium';
    const easy = 'easy';
    Question.findOne({ '_id': user.qs }, (err, qs) => {
        console.log(qs);
        if (err) {
            throw err;
        }
        if (!qs) {
            message.content = 'Bugger, it seems we misplaced your questions please login with facebook again to continue your sign-up process';
            socket.emit('message', message);
            return User.remove({ 'qs': user.qs });
        } else {
            let done = [];
            let hcount = 0;
            let e_wrong_count = 0;
            let h_right_count = 0;
            let medium_easy = 0;
            done.easy = [];
            done.medium = [];
            done.hard = [];
            message.content = 'We will start asking you few questions to verify you';
            socket.emit('message', message);

            let k = ask_random_question(done.medium, qs.qs_medium); // Select a random question from medium question set
            let question = k.question.question; // Store that question
            let answer = k.question.answers; // Store the answer to that question
            let question_type = medium; // Set the question_type as medium
            done.medium = k.done; // Add that question to the done list
            message.content = question;
            socket.emit('message:question', message); // Send the question to the user

            socket.on('message:question', (msg) => {
                verify_ans(answer, msg.content, (res) => {
                    console.log(res);
                    let a = _.filter(res, (value, key) => {
                        if (value > 0.3) {
                            return true;
                        }
                        return false;
                    });
                    console.log(a);
                    if (a.length > 0) {
                        console.log('Right');

                        if (question_type === hard) {
                            message.content = 'We have successfully authenticated you';
                            socket.emit('message:question', message);
                            message.content = 'Now you can chat with the bot';
                            socket.emit('message:successful', message);
                            return api_ai(socket, user, qs, message);
                        } else if (question_type === medium) {
                            question_type = hard;
                            k = ask_random_question(done.hard, qs.qs_hard);
                            question = k.question.question;
                            answer = k.question.answers;
                            done.hard = k.done;
                            return ask_qs(socket, question, message);
                        } else if (question_type === easy) {
                            question_type = medium;
                            k = ask_random_question(done.medium, qs.qs_medium);
                            question = k.question.question;
                            answer = k.question.answers;
                            done.medium = k.done;
                            return ask_qs(socket, question, message);
                        }
                    } else {
                        console.log('Wrong');
                        if (question_type === hard) {
                            if (hcount === 1) {
                                message.content = 'We cannot verify your authenticity therefore we will redirect you to the index page';
                                socket.emit('message', message);
                                return setTimeout(() => {
                                    return socket.emit('redirect:index');
                                }, 1000);
                            } else {
                                hcount++;
                                question_type = hard;
                                k = ask_random_question(done.hard, qs.qs_hard);
                                question = k.question.question;
                                answer = k.question.answers;
                                done.hard = k.done;
                                return ask_qs(socket, question, message);
                            }
                        } else if (question_type === medium) {
                            if (medium_easy === 2) {
                                message.content = 'We failed to verify your authenticity, therefore we will redirect you to the index page';
                                socket.emit('message', message);
                                return socket.emit('redirect:index');
                            }
                            medium_easy++;
                            question_type = easy;
                            k = ask_random_question(done.easy, qs.qs_easy);
                            question = k.question.question;
                            answer = k.question.answers;
                            done.medium = k.done;
                            return ask_qs(socket, question, message);
                        } else if (question_type === easy) {
                            if (e_wrong_count === 1) {
                                message.content = 'We failed to verify your authenticity, therefore we will redirect you to the index page';
                                socket.emit('message', message);
                                return socket.emit('redirect:index');
                            }
                            e_wrong_count++;
                            question_type = easy;
                            k = ask_random_question(done.easy, qs.qs_easy);
                            question = k.question.question;
                            answer = k.question.answers;
                            done.easy = k.done;
                            message.content = question;
                            return socket.emit('message:question', message);
                        }

                    }
                });
            });
        }
    });
}

