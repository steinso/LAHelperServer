var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var User = require('./User.js')();
var FileOrganizer = require('./FileOrganizer.js');
var Promise = require("es6-promise").Promise;

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


app.post("/getMessage/:messageId/:timestamp",function(req,res){
	
	var timeOfChange = 1423142233;
	var clientTimestampOfLastUpdate = req.params.timestamp;

	var timestampIsValid = clientTimestampOfLastUpdate.match(/^[0-9]+$/);
	timestampIsValid = (clientTimestampOfLastUpdate.match(/^[0-9]+$/) !== null 
			      && clientTimestampOfLastUpdate.match(/^[0-9]+$/).length > 0);
	var clientIsUpToDate = timestampIsValid && timeOfChange < clientTimestampOfLastUpdate;

	console.log("Got message request:"+req.params.messageId+" Client up to date: "+clientIsUpToDate +" diff: "+(timeOfChange-clientTimestampOfLastUpdate));
	if(clientIsUpToDate){
		res.send("OK");
		return;
	}
	var dialogDisclaimer = "Learning Analytics Helper, er et Eclipse-tillegg som skal hjelpe oss å få innsikt i hvordan det jobbes med programmeringsoppgaver, så det blir lettere å forbedre dem og gi målrettet støtte.\nLA Helper logger kontinuerlig data om hva du gjør i Eclipse og sender det anonymt til en server. Det som logges er:\n-filer du redigerer\n-problem-markører i editoren som legges inn av kompilatoren\n-hvilke tester som kjøres og test-resultatene\n\nVed å aktivere logging samtykker du til at data kan brukes til analyse av hvordan det jobbes med koding, og til forbedring av oppgaver og øvingsopplegget.\n\nData logges anonymt, men du har anledning til å legge inn et kallenavn, som knyttes til dataene. Med dette kallenavnet har du muligheten til få innsyn i hva som er logget, og det kan brukes av oss til å gi mer personlig hjelp og støtte, hvis du ønsker det.";
	//var dialogDisclaimer = "Ved å samle inn anonym data om oppgavevalg og utførelse, kan vi gjøre analyse for å identifisere spesielt vanskelige øvinger og tema.\nDette kan føre til mindre frustrasjon og mer hjelp til dere. All dataen er helt anonym og det er umulig å linke kode til individer.\n\nVed å aktivere logging samtykker du til logging av: tester som kjøres, kode som blir skrevet og feilmeldinger som oppstår.";

var preferenceDisclaimer = dialogDisclaimer;
//var preferenceDisclaimer = "Ved å samle inn anonym data om oppgavevalg og utførelse, kan vi gjøre analyse for å identifisere spesielt vanskelige øvinger og tema. Dette kan føre til mindre frustrasjon og mer hjelp til dere. All data er helt anonym og det er umulig å linke informasjon til individer. \n\nVed å trykke godta samtykker du til logging av: tester som kjøres, kode som blir skrevet og feilmeldinger som oppstår.  \n\nLoggingen kan skrues av og på i instillingene, hvor det også er mulig å legge inn et kallenavn som gjør dine data tilgjengelig for studass om du skulle trenge hjelp.\n\nPå forhånd takk!\n";

	if(req.params.messageId === "dialogDisclaimer"){
		message = dialogDisclaimer;
	} else if(req.params.messageId === "preferenceDisclaimer"){
		message = preferenceDisclaimer;
	} else{
		message = "unkownIdMessageId";
	}
	
	res.send(message);
});

app.post('/setClientName/:userId', function (req, res) {
	console.log("------ Got request to set name------");
	var allowedNamePattern = /^[A-z0-9_]+$/;
	var name = req.body.toString();
	var clientId = req.params.userId;
	console.log("Client id:"+clientId);
	console.log("Name:"+name);

	var validName = (name.match(allowedNamePattern) !== null 
			      && name.match(allowedNamePattern).length > 0);

	if(validName){
		console.log("Name is valid, setting name in DB");
		db.setClientName(clientId,name);
	}else{
		//Set empty if name is illegal
		console.log("Name invalid, setting 0");
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
		console.log(createFileRepresentation(file));
	});

	FileOrganizer.store(files,req.params.userId);

	console.log("==== Req end: =========================");

});

function createFileRepresentation(file){
	var out = "";
	out += " { name: "+file.name+'\n';
	out += "   path: "+file.path+'\n';
	out += "   type: "+file.type+'\n';
	out += "   typeOfChange: "+file.typeOfChange+'\n';
	if(file.fileContents !== undefined){
		out += "   fileContents: "+file.fileContents.substring(0,50).replace(/\n/g, " ")+'..\n';
	}
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
		console.log("Promise was rejected..",error)
		res.send("No user by that nickname");
	});	
});

app.use(express.static(__dirname + '/pub'));

var server = app.listen(50807, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);


});

