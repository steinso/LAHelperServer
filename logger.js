var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.raw());
app.get('/', function (req, res) {
	res.send('Hello World!');
	console.log("Got request at ",Date.now());

});

app.post('/file/:filename', function (req, res) {
	res.send('Hello World!');
	console.log("==== Got req: FILE======================");
	console.log("POST request at ",Date.now());
	console.log("File: "+req.params.filename);

	var body = req.body.toString();
	var file = body;
	console.log("==== File   : ======");
	console.log(file);

	console.log("==== Req end: =========================");

});

app.post('/markers', function (req, res) {
	console.log("==== Got req: MARKERS =================");
	console.log("POST request at ",Date.now());
	console.log("");
//	console.log(req.body.toString());

	var markers = JSON.parse(req.body.toString());
	console.log("==== Markers: ======");
	console.dir(markers);

	console.log("==== Req end: =========================");

	res.send('Hello World!');

});

var server = app.listen(50807, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);


});

