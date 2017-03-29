// config/passport.js
// IMPORTING THE NECESSARY STRATEGY ------
const FacebookStrategy = require('passport-facebook').Strategy;
const facebookAuth     = require('./configDB.js').facebookAuth;
const User             = require('../app/models/User.js');

facebookAuth.passReqToCallback = true;  // allows us to pass in the req from our route (lets us check if a user is logged in or not)

module.exports = function(passport) {
	// PASSPORT STRATEGY TO AUTHENTICATE FOR FACEBOOK
	passport.use(new FacebookStrategy(facebookAuth, (req, token, refreshToken, profile, done) => {
		const info = {
			token: token,
			profile: profile
		};
		User.findOne({'facebook.id': profile.id}, (err, usr) => {
			if(err) {
				throw err;
			}
			if(!usr) {
				let u = new User();
				u.facebook.id = profile.id;
				u.facebook.token = token;
				u.save((err) => {
					if(err){
						throw err;
					}
					done(null, u, { message: 'Here we are'});
				});
			}
			else {
				done(null, null, { message: 'Here we are' });
			}
		});

	}));
};