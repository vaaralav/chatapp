// Require in mongodb
var mongo = require('mongodb').MongoClient;
// Require socket.io
var client = require('socket.io').listen(8080).sockets;

// Yhdistetään MongoDB tietokantaan
// Database: chat
// IP-osoite / Name: localhost
exports.start = function() {
	mongo.connect('mongodb://localhost/chat', function(err, db) {
		if(err) throw err;

		// Kaikille yhteyksille (client)
		client.on('connection', function(socket) {
			
			// Collection = messages
			var col = db.collection('messages');

			// Funktio, joka lähettää selaimeen statusmuutoksen
			var sendStatus = function(s) {
				socket.emit('status', s);
			};

			// Emit all messages to connecting client
			// Enintään 100 viestiä
			// Järjestetään ID:n mukaan käänteisesti
			col.find().sort({_id:-1}).limit(100).toArray(function(err, res) {
				if(err) throw err;// Lähetetään clientille tietokannasta haetut viestit
				socket.emit('output', res.reverse());
			});


			// Wait for input from single client (socket)
			socket.on('input', function(data) {
				// Yksittäisen input-elementin attribuutit
				var name = data.name;
				var message = data.message;

				// Prevent blank entries
				// Whitespace check on server side prevents !!!
				// client to alter the validation			!!!
				var whitespacePattern = /^\s*$/;

				// Check if entry is blank
				if(whitespacePattern.test(name) || whitespacePattern.test(message)) {
					// Guide the client
					sendStatus('Name and message is required!');

					// Melko turha, serverin logissa näkyy jos tulee epäkelpoja
					// syötteitä
					console.log('Invalid input!'); // Entry was blank

				} else { // Everything is fine with the entry
					// Lisätään data collectioniin
					col.insert({name: name, message: message}, function() {
						
						// Emit latest message to ALL clients (client)
						client.emit('output', [data]);

						// Tyhjennetään viestikenttä.
						sendStatus({
							message: "Message sent",
							clear: true
						});
					});
				}
			});
		});
	});
}