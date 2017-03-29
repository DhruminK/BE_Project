// server.js
// IMPORTING NECESSARY PACKAGES ---------
const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const path       = require('path');
const passport   = require('passport');
const morgan     = require('morgan');
const app        = express();

const configDB   = require('./config/configDB.js');
const port       = process.env.PORT || 8080;
const server     = require('http').createServer(app);

// CONFIGURATION -------------------------
mongoose.connect(configDB.URL); 	    // Configuration of database
require('./config/passport')(passport)  // Initializing the passport app

// SETTING UP OUR EXPRESS APPLICATION
app.use('/public', express.static(path.resolve(path.join(__dirname, '/public'))));
app.use(morgan('dev'));
app.use(bodyParser.json());				// recieving information via JSON
app.use(bodyParser.urlencoded({ extended: true }));  // recieving information via forms

app.use(passport.initialize());
app.set('superSecret', "BEPROJECT");

// ROUTES ---------------------------------

require('./app/routes.js')(app, passport);

// LAUNCH ---------------------------------

server.listen(port, function() {
	console.log(`MAGIC HAPPENS ON PORT ${port}`);
});

require('./socket/websocket.js')(server, app);

//[![N|Solid](https://cldup.com/dTxpPi9lDf.thumb.png)](https://nodesource.com/products/nsolid)