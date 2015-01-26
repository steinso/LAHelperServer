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

	if(name.match(allowedNamePattern).length != null)	{
		db.setClientName(clientId,name);
	}else{
		//Set empty if name is illegal
		db.setClientName(clientId,"");
	}

	res.send("OK");
});

app.post('/setClientParticipating/:userId', function (req, res) {
	console.log("------ Got request to set participation------");
	var value = req.body.toString();
	var clientId = req.params.userId;
	console.log("Client id:"+clientId);
	console.log("Participating:"+value);

	if(value == "false" || value == "true")	{
		db.setClientParticipating(clientId,value);
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
		console.log(createFileRepresentation(file));
	});

	FileOrganizer.store(files,req.params.userId);

	console.log("==== Req end: =========================");

});

function createFileRepresentation(file){
	var out = "";
	out += " { name: "+file.name+'\n';
	out += "   path: "+file.path+'\n';
	out += "   fileContents: "+file.fileContents.substring(0,50).replace(/\n/g, " ")+'..\n';
	out += "   type: "+file.type+'\n';
	out += "   typeOfChange: "+file.typeOfChange+'\n';
	out += " }";

	return out;
}



app.post('/markers/:userId', function (req, res) {
	console.log("==== Got req: MARKERS =================");
	console.log("POST request at ",Date.now());
	console.log("");
	//	console.log(req.body.toString());

	var markers = JSON.parse(req.body.toString());
	console.log("==== Markers: ======");
	console.dir(markers);

	console.log("==== Req end: =========================");

	res.send('OK');

});

app.get('/folder/:clientName',function(req,res){
	console.log(req.params.clientName,"requested folder listing");
	db.getIdFromClientName(req.params.clientName).then(function(clientId){
	
		FileOrganizer.getGitFilesListOfClient(clientId).then(function(result){
			console.log("Folder listing sent:",result)
			res.send(result.replace(/\n/g,"<br>"));
		});

	}).catch(function(error){
		console.log("Promise was rejected.. sucks",error)
		res.send("No user by that nickname");
	});	
});

app.use(express.static(__dirname + '/pub'));

var server = app.listen(50807, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);


});

