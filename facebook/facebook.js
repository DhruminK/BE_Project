// facebook/facebook.js

// IMPORTING THE NECESSARY PACKAGES ---------------
const _ = require('lodash');
const https = require('https');
const User = require('../app/models/User.js');
const request = require('request');

module.exports = (user, done) => {
    /*https.get({
        host: 'graph.facebook.com',
        path: '/v2.8/me?fields=email%2Cgender%2Cfirst_name%2Clast_name%2Cage_range%2Clink%2Clocale%2Cupdated_time%2Cpicture&access_token=' + user.facebook.token
    }, (response) => {

        let body = '';
        response.on('data', (d) => {
            body += d;
        });

        response.on('end', () => {
            let a = JSON.parse(body);
            User.findOne({ 'facebook.id': user.facebook.id }, (err, usr) => {

                if(!usr) {
                    console.log()
                }

                if(!usr.local.first_name) { 
                    usr.local.first_name = (a.first_name).toLowerCase();
                }
                if(!usr.local.last_name) { 
                    usr.local.last_name  = (a.last_name).toLowerCase();
                }
                if(!usr.facebook.gender) { 
                    usr.facebook.gender  = a.gender;
                }
                if(!usr.facebook.email) { 
                    usr.facebook.email   = a.email;
                }
                if(!usr.facebook.age) { 
                    usr.facebook.age     = a.age_range.min;
                }
                if(!usr.facebook.picture) { 
                    usr.facebook.picture = a.picture.data;
                }
                usr.save((err) => {
                    if (err) {
                        throw err;
                    }
                    done(null, usr);
                });
            })
        });
    });*/

    request({
        url: 'https://graph.facebook.com/v2.8/me?fields=email%2Cgender%2Cfirst_name%2Clast_name%2Cage_range%2Clink%2Clocale%2Cupdated_time%2Cpicture&access_token=' + user.facebook.token,
        method: 'GET',

    }, (err, response, body) => {
        if (err) {
            throw err;
        }
        if (body) {
            let a = JSON.parse(body);
            User.findOne({ 'facebook.id': user.facebook.id }, (err, usr) => {

                if (!usr) {
                    console.log()
                }

                if (!usr.local.first_name) {
                    usr.local.first_name = (a.first_name).toLowerCase();
                }
                if (!usr.local.last_name) {
                    usr.local.last_name = (a.last_name).toLowerCase();
                }
                if (!usr.facebook.gender) {
                    usr.facebook.gender = a.gender;
                }
                if (!usr.facebook.email) {
                    usr.facebook.email = a.email;
                }
                if (!usr.facebook.age) {
                    usr.facebook.age = a.age_range.min;
                }
                if (!usr.facebook.picture) {
                    usr.facebook.picture = a.picture.data;
                }
                usr.save((err) => {
                    if (err) {
                        throw err;
                    }
                    done(null, usr);
                });
            });
        }
    });
}

//curl -i -X GET \
// "https://graph.facebook.comEAACEdEose0cBAFs8Udo2vBaurnWrGzdkNwRrdXk0Fyf0PJ1fDZBmfNTQZC3cr36Gk3WLEVSHNJJRZAvKscwOmmVLDcXfZCI8ewv40WO4LT4B6bLuYnfF8xBlPW0Fl4SZBSrYvt4PejZCRNnP1ZCMby33EJ4HSLMFtG1ypZCeRx2rB1huhol0spgHnLb1UB4xs1UZD"
