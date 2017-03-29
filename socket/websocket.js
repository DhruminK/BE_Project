// socket/websocket.js

// IMPORT THE NECESSARY PACKAGES ------------
const _         = require('lodash');
const soc       = require('socket.io');
const nlp       = require('nlp_compromise');
const sentiment = require('sentiment');
const jwt       = require('jsonwebtoken');
const facebook  = require('../facebook/facebook.js');
const md_check  = require('../nlp/middle_name_checker.js');
const Qs_gen    = require('../nlp/Question_Generation.js');
const Us_auth   = require('../nlp/User_authentication.js');

let lexicon = nlp.lexicon();

// exposing our socket configuration to rest of our app
module.exports = (server, app) => {
    // listen to our port 8080
    const io = soc.listen(server);

    io.on('connection', (socket) => {

        socket.emit('token');
        let message = {};
        message.user = 'Bot';

        socket.on('token', (token) => {
            if (!token) {
                Us_auth(socket, message, lexicon);
            } else {
                jwt.verify(token, app.get('superSecret'), (err, decoded) => {
                    if (err) {
                        throw err;
                    } else {
                        let usr = decoded._doc;
                        facebook(usr, (err, user) => {
                            if (!user.local.middle_name) {
                                message.content = "Please Enter you middle name to continue the SignUp Process";
                                socket.emit('message:middle', message);
                                socket.on('message:middle', (msg) => {
                                    md_check(msg, lexicon, (err, name) => {
                                        if (err) {
                                            message.content = err;
                                            return socket.emit('message:middle', message);
                                        } else {
                                            user.local.middle_name = name;
                                            user.save((err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                message.content = "We have successfully registered you, now we will ask some question to verify you on subsequent logins";
                                                socket.emit('message', message);
                                                Qs_gen(socket, user, message);
                                            });
                                        }
                                    });
                                });
                            } else {
                                message.content = "We have successfully registered you, now we will ask some question to verify you on subsequent logins";
                                socket.emit('message', message);
                                Qs_gen(socket, user, message);
                            }
                        });
                    }
                });
            }
        });

    });
}
