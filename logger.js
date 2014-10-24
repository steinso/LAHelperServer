var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.raw());
app.get('/', function (req, res) {
	res.send('Hello World!');
	console.log("Got request at ",Date.now());

});

app.post('/', function (req, res) {
	res.send('Hello World!');
	console.log("==== Got req: =========================");
	console.log("POST request at ",Date.now());
	console.log("");

	//console.log(req.body);
	var pieces = req.body.toString().split("|||");
	if(pieces.length != 2){
		console.log("Request did not contain requried delimiter; can not read.");
		return;
	}
	try{

		var markers = JSON.parse(pieces[0]);
		var file = pieces[1];
		console.log("==== Markers: ======");
		console.dir(markers);
		console.log("==== File   : ======");
		console.log(file);

	}catch(e){
		console.log("Could not read input..");
		return;
	}
	console.log("==== Req end: =========================");

});

app.post('/markers', function (req, res) {
	console.log("==== Got req: MARKERS =================");
	console.log("POST request at ",Date.now());
	console.log("");

	var markers = JSON.parse(req.body.toString());
	console.log("==== Markers: ======");
	console.dir(markers);

	console.log("==== Req end: =========================");


});

var server = app.listen(50807, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);


});

