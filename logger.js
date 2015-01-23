var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var User = require('./User.js')();
var FileOrganizer = require('./FileOrganizer.js');

//var sqlite3 = require("sqlite3").verbose();
var DatabaseHandler = require('./DatabaseHandler.js');
var db = new DatabaseHandler('dbFile.db');
FileOrganizer = FileOrganizer();

app.use(bodyParser.raw());


///////////////////////////////////
///////////////////////////////////
//
//  //////////////////////////////

app.post("/createUser",function(req,res){
	var clientId = User.create();	
	db.insertUser(clientId);
	res.send(clientId);
});

app.post('/setClientName/:userId', function (req, res) {
	console.log("------ Got request to set name------");
	var allowedNamePattern = /^[A-z0-9_]+$/;
	var name = req.body.toString();
	var clientId = req.params.userId;
	console.log("Client id:"+clientId);
	console.log("Name:"+name);
	if(name.match(allowedNamePattern).length == 1)	{
		db.setClientName(clientId,name);
	}
	res.send("OK");
});

app.post('/errorLog/:userId',function(req,res){
	console.log("---- Got error log ------");
	
	var errorString = req.body.toString();
	var error = JSON.parse(errorString);
	console.log(error);
	var clientId = req.params.userId;
	db.insertApplicationLog(clientId,"error",errorString);

	res.send('OK');
});


app.post('/eventLog/:userId',function(req,res){
	//IMPLEMENT
	console.log("--------- Got event log");

	var clientId = req.params.userId;
	db.insertApplicationLog(clientId,"log",req.body.toString());

	res.send("OK");

});

app.post('/files/:userId', function (req, res) {
	res.send('OK');
	console.log("==== Got req: FILE======================");
	console.log("POST request at ",Date.now());

	var body = req.body.toString();
	var files= JSON.parse(req.body.toString());
	console.log("==== File   : ======");
	files.map(function(file){
		if(file.fileContents === undefined){return;}
		file.fileContents = "";
	});
	console.dir(files);
	console.log("Filename: "+files[0].filename);

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

