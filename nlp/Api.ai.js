// nlp/ api.ai
// IMPORTING THE NECESSARY PACKAGES ----------------
const request = require('request');

module.exports = (socket, user, question, message) => {
	socket.on('chat', (msg) => {
		let m = {
			lang : "en",
			sessionId:"1234567890"
		};
		m.query = msg.content;
		request({
			url: 'https://api.api.ai/v1/query?v=201650910',
			method: 'POST',
			headers: {
				'Content-Type': 'Application/json',
				'Authorization': 'Bearer 56bc6ed1628d4a808ef4c4cb261b5184'
			},
			json: m
		}, (err, response, body) => {
			if(err) {
				throw err;
			}
			console.log("\n\n\n");
			console.log(body.result);
			message.content = body.result.fulfillment.speech;
			socket.emit('chat', message);
		});
	});
};