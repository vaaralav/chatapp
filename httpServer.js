var http = require('http');
var _ = require('lodash');
var fs = require('fs');

var serve404 = function serve404(res) {
	res.writeHead(404);
	res.end("Requested file was not found on server...");
}


exports.start = function() {
	http.createServer(function(req, res) {
	var filepath = "";
	if(req.url === '/' || req.url ==='/index.html') {
		filepath = "./index.html";
	}
	else if (req.url === "/css/main.css" || 
		req.url === "/node_modules/socket.io/node_modules/socket.io-client/socket.io.js")
	{
		filepath = "." + req.url;
	}

	if(filepath !== "") {
		fs.exists(filepath, function(file_exists) {
			if(file_exists) {
				res.writeHead(200);

				var streamFile = fs.createReadStream(filepath).pipe(res);

				streamFile.on("error", function(err) {
					res.writeHead(500);
					res.end(JSON.stringify(err));
				})
			}
		});
	} else {
		serve404();
	}
}).listen(8000);
}