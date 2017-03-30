// nlp/Question_Generation.js

// IMPORTING NECESSARY PACKAGES ----------------
const nlp = require('nlp_compromise');
const Question = require('../app/models/Questions.js');
const User = require('../app/models/User.js');
const _ = require('lodash');

let easy_questions = [
    "What is your age ?",
    "What is your email ?",
    "What is your year of birth ?",
    "What is your gender ?"
];
let medium_questions = [
    "Which parent are you closer to ?",
    "What would you prefer ? Cats or dogs ?",
    "What would you rather play ? Indoor sports or outdoor sports?",
    "What would you prefer to drink? Soda or Shakes ?",
    "Your vehicle of choice is a car or a bike ?",
    "Would you prefer to walk or cycle short distances?",
    "Where would you rather go ? Zoos or Museums ?",
    "What would you prefer more ? Comfort or Style ?",
    "Would you prefer to eat out or at home ?",
    "While playing chess what color pieces would you choose ? Black or white ?"
];
let hard_questions = [
    "What is your philosophy in life?",
    "What is the one thing you would like to change about yourself?",
    "Are you religious or spiritual?",
    "What was the best phase in your life?",
    "What was the worst phase in your life?",
    "Is what you’re doing now what you always wanted to do growing up?",
    "What makes you feel accomplished?",
    "Are you confrontational?",
    "If you are in a bad mood, do you prefer to be left alone or have someone to cheer you up?",
    "Do you believe in second chances?",
    "What will people say at your funeral?",
    "When you’re 90 years old, what will matter most to you in the world?",
    "If you could ask a single person one question, and they had to answer truthfully, who and what would you ask?",
    "If your entire life was a movie, what title would best fit?",
    "If you could send a message to the entire world, what would you say in 30 seconds?",
    "What did you want to be when you were a kid?",
    "Name one superpower you would like to have",
    "Name one law you would like to break",
    "What was your last new year's resolution?",
    "Standing at the gates of heaven, and God asks you “Why should I let you in?” What do you reply?"
];


function easy_questions_generation(user, q, done) {
    q = new Question();
    let q1 = {};
    q1.question = easy_questions[0];
    q1.answers = user.facebook.age;
    q.qs_easy.push(q1);
    q1.question = easy_questions[1];
    q1.answers = user.facebook.email;
    q.qs_easy.push(q1);
    q1.question = easy_questions[2];
    q1.answers = (new Date().getFullYear()) - user.facebook.age;
    q.qs_easy.push(q1);
    q1.question = easy_questions[3];
    q1.answers = user.facebook.gender;
    q.qs_easy.push(q1);
    q.save((err) => {
        user.qs = q._id;
        user.save((err) => {
            done(null, user, q);
        });
    });

}

function generate_question(user, question, count, done, question_set) {
    if (!done) {
        done = [];
    }

    if (!count) {
        count = 0;
    }

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
    count++;
    let qs = question_set[number];
    let k = {
        count: count,
        done: done,
        question: qs
    };
    return k;



}



// exposing the function to our app
module.exports = (socket, user, message) => {
    easy_questions_generation(user, null, (err, usr, questions) => {
        let k = generate_question(usr, questions, null, null, medium_questions);
        let count = k.count;
        let done = k.done;
        message.content = k.question;
        socket.emit('message:question:medium', message);

        socket.on('message:question:medium', (msg) => {
            console.log(msg);
            let qs = {
                question: k.question,
                answers: msg.content
            };
            questions.qs_medium.push(qs);
            if (count <= 9) {
                questions.save((err) => {
                    if (err) {
                        throw err;
                    }

                    k = generate_question(usr, questions, count, done, medium_questions);
                    count = k.count;
                    done = k.done;
                    message.content = k.question;
                    return socket.emit('message:question:medium', message);

                });
            }
            if(count === 10) {
            	questions.save((err) => {
            		if(err) {
            			throw err;
            		}
            		k = generate_question(usr, questions, null, null, hard_questions);
                    let hcount = k.count;
                    let hdone = k.done;
                    message.content = k.question;
                    socket.emit('message:question:hard', message);

                    socket.on('message:question:hard', (msg) => {
                        let qs = {
                            question: k.question,
                            answers: msg.content
                        };
                        questions.qs_hard.push(qs);
                        console.log(k);
                        questions.save((err) => {
                            if (hcount <= 10) {
                                k = generate_question(usr, questions, hcount, hdone, hard_questions);
                                hcount = k.count;
                                hdone = k.done;
                                message.content = k.question;
                                socket.emit('message:question:hard', message);
                            } else if (hcount > 10) {
                                message.content = 'We have successfully completed your Sign-Up';
                                socket.emit('message:successful', message);
                            }
                        });
                    });
            	});
            }
        });
    });
};
