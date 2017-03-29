// app/routes.js

// IMPORTING THE NECESSARY PACKAEGES -------------
const jwt     = require('jsonwebtoken');
const express = require('express');
const path    = require('path');
const User    = require('./models/User.js');
const nlp     = require('nlp_compromise');
const request = require('request');
const _       = require('lodash');

// EXPOSING THE MODULE TO REST OF THE APP --------

module.exports = function(app, passport) {

    // INDEX PAGE FOR FACEBOOK AUTHENTICATION
    app.get('/', function(req, res) {
        res.sendFile(path.resolve(path.join(__dirname, '../public/html/index.html')));
    });

    app.get('/login', (req, res) => {
        res.redirect('/api/profile?token=');
    });

    // Route to begin authentication from facebook
    app.get('/auth/facebook', passport.authenticate('facebook', { session: false }));

    // Route to return to after user is authenticated
    app.get('/auth/facebook/callback', (req, res) => {
        passport.authenticate('facebook', { session: false }, (err, user, info) => {
            if (!user) {
                return res.redirect('/api/profile?token=');
            }

            var token = jwt.sign(user, app.get('superSecret'), {
                expiresIn: '1h' // expires in 1 hour
            });
            return res.redirect('/api/profile?token=' + token);
        })(req, res);
    });

    // Route to post facebook token and id and grant a token
    app.post('/auth/android', (req, res) => {
        let token = req.body.token;
        let id = req.body.fb_id;
        console.log('Here');
        if (!token || !id) {
            return res.send({ message: 'Please send a valid token and facebook id' });
        }

        User.findOne({ 'facebook.id': id }, (err, usr) => {
            if (err) {
                throw err;
            }
            if (!usr) {
                usr = new User();
                usr.facebook.token = token;
                usr.facebook.id = id;
                usr.save((err) => {
                    if (err) {
                        throw err;
                    }
                    let t = jwt.sign(usr, app.get('superSecret'), {
                        expiresIn: '1h' // expires in 1 hour
                    });
                    return res.send({ 'token': t });
                });
            } else {
                /*usr.facebook.token = token;
                usr.save((err) => {
                	if(err) {
                		throw err;
                	}
                	let t = jwt.sign(usr, app.get('superSecret'), {
                		expiresIn: '1h' // expires in 1 hour
                	});
                	let token = {};
                	token.token = t;
                	return res.send(token);
                });*/
                res.redirect('/api/profile?token=');
            }
        });
    });

    app.post('/test', (req, res) => {
        let answer = req.body.summary;
        let msg = {};
        console.log(answer);
        msg.content = req.body.query;
        console.log(`${answer}
        			${msg.content}`);
        let data = {
        	summary: answer,
        	query: msg.content
        };
        console.log(data);
        request({
        	url: 'http://localhost:8888/query_similar',
        	method: 'POST',
        	headers: {
        		'Content-Type': 'Application/json'
        	},
        	json: data
        }, (err, response, body) => {
        	if(err) {
        		console.log(err);
        	}
        	if(body) {
        		a = _.filter(body, (value, key) => {
        			console.log(`${value} , ${key}`);
        		});
        	}
        });
    });

    // Main Chatbot
    app.get('/api/profile', (req, res) => {

        res.sendFile(path.resolve(path.join(__dirname, '../public/html/profile.html')));
    });



}
