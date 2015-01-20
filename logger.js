var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var User = require('./User.js')();
var FileOrganizer = require('./FileOrganizer.js');
FileOrganizer = FileOrganizer();

app.use(bodyParser.raw());

app.post("/createUser",function(req,res){
	var clientId = User.create();	
	res.send(clientId);
});

app.post('/files/:userId', function (req, res) {
	res.send('OK');
	console.log("==== Got req: FILE======================");
	console.log("POST request at ",Date.now());
	console.log("File: "+req.params.filename);

	var body = req.body.toString();
	var files= JSON.parse(req.body.toString());
	console.log("==== File   : ======");
	console.log(files);

	FileOrganizer.store(files,req.params.userId);

	console.log("==== Req end: =========================");

});



app.post('/markers/:userId', function (req, res) {
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

