// nlp/User_authentication.js

// IMPORTING THE NECESSARY PACAKAGES --------------------
const _       = require('lodash');
const nlp     = require('nlp_compromise');
const User    = require('../app/models/User.js');
const senti   = require('sentiment');
const Qs_auth = require('./question_login_authentication.js');


// Function to check if the String contains a name or not
function name_checker(data, usr, message, lexicon, cb) {

    // detokenize the sentence and give Parts-Of-Speech tagging
    let content = nlp.sentence(data.content, { lexicon: lexicon });

    // finding the question type if it is something other than declarative then reply user
    let qs = content.sentence_type();

    // If the sentence is not declarative 
    if (qs !== 'declarative') {
        // Send message back
        message.content = 'I need your name to authenticate you';
        return cb(message);
    } else {
        let m = find_people(data, content, message, lexicon);
        if (m.foundPeople) {
            let nor = m.people;
            return name_database_pre_processing(nor, usr, message, cb);
        } else {
            message.content = 'I need your name to authenticate you';
            cb(message);
        }
    }
}

// Function to find people names in the data
function find_people(data, content, message, lexicon) {
    // Finding if there is a person in the sentence
    let people = content.people();

    // if a name is found then filter pronouns 
    people = _.filter(people, (d) => {
        if (d.normal === 'i') {
            return false;
        }
        return true;
    });

    if (people.length !== 0) {
        // check if the name is in the database
        let m = {};
        m.foundPeople = true;
        m.people = people[0];
        return m;
    } else {
        // check sentence for nouns 
        let sent_terms = content.terms;
        let nouns = _.filter(sent_terms, (data) => {
            if (data.pos.Noun && !data.pos.Pronoun) {
                return true;
            }
            return false;
        });


        if (nouns.length === 0) {
            message.foundPeople = false;
            return message;
        }
        // if there are nouns in the sentence then they are probably names(hopefully)
        let name_terms = nouns[0].normal.split(' ');
        if (name_terms.length === 1) {

            // add the names for future references
            lexicon[name_terms[0]] = 'Person';
        } else if (name_terms.length === 2) {
            lexicon[name_terms[0]] = 'Person';
        } else if (name_terms.length === 3) {
            lexicon[name_terms[0]] = 'Person';
            lexicon[name_terms[1]] = 'Person';
        }

        content = nlp.sentence(data.content, { lexicon: lexicon });
        let people = content.people();

        // find the edge case("I") and avoid it
        if (people[0].text === 'I') {
            people[0] = people[1];
        }

        let m = {};
        // there is a recognizable name in the sentence now 
        if (people.length !== 0) {
            let nor = people[0]
            m.foundPeople = true;
            m.people = nor;
            return m;
        } else {
            // If there is no recognizable names now then return false
            m.content = "I need your name to authticate you.";
            m.foundPeople = false;
            return m;
        }
    }

}


// Function to pre process the data before querying the database
function name_database_pre_processing(norm, usr, message, cb) {
    let nor = norm.normal;
    let firstName = null;
    let lastName = null;
    let middleName = null;
    let n = nor.split(" ");

    // If name contains three words then they must be first name, middle name ,and last name
    if (n.length === 3) {
        firstName = norm.firstName;
        middleName = norm.middleName;
        lastName = norm.lastName;
    } else if (n.length === 2) {
        // If the word contains two names then it might be first name, last name or middle name, last name
        if (usr.firstName !== null) {
            firstName = usr.firstName;
            middleName = n[0];
            lastName = n[1];
        } else {
            firstName = norm.firstName;
            lastName = norm.lastName;
        }
    } else {

        // If there is only a single word then the word might be first name, last name or middle name depending, 
        // on which value is undefined and which value is defined
        if (usr.firstName !== null && usr.lastName !== null) {
            firstName = usr.firstName;
            lastName = usr.lastName;
            middleName = nor;
        } else if (usr.firstName !== null) {
            firstName = usr.firstName;
            lastName = nor;
        } else {
            firstName = nor;
        }
    }

    if (usr.firstName === null) {
        usr.firstName = firstName.toLowerCase();
    }

    if (usr.middleName === null && middleName) {
        usr.middleName = middleName.toLowerCase();
    }
    if (usr.lastName === null && lastName) {
        usr.lastName = lastName.toLowerCase();
    }
    name_database_checker(norm, usr, message, cb);
}

function name_database_checker(norm, usr, message, cb) {

	console.log(usr);
    if ((usr.lastName) === null && (usr.middleName) === null) {

        User.find({ 'local.first_name': usr.firstName }, function(err, docs) {

            // If an error occurs then throw an error
            if (err) {
                throw err;
            }

            // If the name is not found in the database
            if (docs.length === 0) {
                message.content = `No User found whose name is ${norm.text},
                You must first register via facebook to access this service`;
            }

            cb(message, usr, norm, docs);

        });

    } else if ((usr.middleName) === null) {
        User.find({ $and: [{ 'local.first_name': usr.firstName }, { 'local.last_name': usr.lastName }] }, function(err, docs) {

            // If an error occurs then throw an error
            if (err) {
                throw err;
            }

            // If the name is not found in the database
            if (docs.length === 0) {
                message.content = `No User found whose name is ${norm.text},
                You must first register via facebook to access this service`;
            }

            cb(message, usr, norm, docs);

        });
    } else {
        User.find({ $and: [{ 'local.first_name': usr.firstName }, { 'local.last_name': usr.lastName }, { 'local.middle_name': usr.middleName }] }, function(err, docs) {

            // If an error occurs then throw an error
            if (err) {
                throw err;
            }
            // If the name is not found in the database
            if (docs.length === 0) {
                message.content = `No User found whose name is ${norm.text},
                You must first register via facebook to access this service`;
            }

            cb(message, usr, norm, docs);

        });
    }
}

// Exposing the function to rest of the app
module.exports = (socket, message, lexicon) => {

    let usr = {};
    usr.firstName = null;
    usr.lastName = null;
    usr.middleName = null;
    let count = 0;
    message.content = 'May I know your name ?';
    socket.emit('message', message);

    socket.on('message', (msg) => {

        name_checker(msg, usr, message, lexicon, (result, us, norm, docs) => {

            if (!docs) {
                return socket.emit('message', result);
            }
            if (docs && docs.length !== 0) {
                usr.firstName = us.firstName;
                usr.lastName = us.lastName;
                usr.middleName = us.middleName;
                // If there are more than one user with the name provided, in database
                if (docs.length > 1) {
                    if (usr.lastName === null) {
                        message.content = 'Multiple Users found, please provide your last name';
                    } else if (usr.middleName === null) {
                        message.content = 'Multiple Users found, please provide your middle name';
                    }
                }
                // If there is exactly one user then
                else {
                    message.content = 'User found with the same username';
                    socket.emit('message', message);
                    return Qs_auth(socket, docs[0], message);

                }
                return socket.emit('message', message);
            }

            if (docs.length === 0) {
                socket.emit('message', result);
                if (count === 1 ) {
                    return socket.emit('redirect:index');

                }
                message.content = 'Would you like to try entering your name again ?'
                socket.emit('message:noUser', message);
                socket.on('message:noUser', (msg) => {
                    let scr = senti(msg.content).score;
                    if (scr > 0) {
                    	message.content = 'Okay then please try entering your name again';
                        socket.emit('message', message);
                        usr.firstName = null;
                        usr.lastName = null;
                        usr.middleName = null;
                        count++;
                    } else if (scr === 0) {
                    	message.content = 'Please enter a positive or negative statement, instead of neutral app'
                        socket.emit('message:noUser', message);
                    } else {
                        message.content = 'Okay we will shortly redirect you to another page'
                        socket.emit('redirect:index');
                    }
                });
            }
        });

    });

}
