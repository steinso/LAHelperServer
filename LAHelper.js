var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var User = require('./User.js')();
var FileOrganizer = require('./FileOrganizer.js');
var Promise = require("es6-promise").Promise;
var Log = require("./Logger.js");

//var sqlite3 = require("sqlite3").verbose();
var DatabaseHandler = require('./DatabaseHandler.js');
var db = new DatabaseHandler('dbFile.db');
FileOrganizer = FileOrganizer();

app.use(bodyParser.raw({limit:'1.5mb'}));


///////////////////////////////////
///////////////////////////////////
//
//  //////////////////////////////

app.post("/createUser",function(req,res){
	var clientId = User.create();	
	var log = new Log(null," Create client: "+clientId);
	db.insertUser(clientId);
	res.send(clientId);
	log.print();
});

app.post("/getMessage/:messageId/:timestamp",function(req,res){
	
	var log = new Log();
	var timeOfChange = 1423142233;
	var clientTimestampOfLastUpdate = req.params.timestamp;

	var timestampIsValid = clientTimestampOfLastUpdate.match(/^[0-9]+$/);
	timestampIsValid = (clientTimestampOfLastUpdate.match(/^[0-9]+$/) !== null 
			      && clientTimestampOfLastUpdate.match(/^[0-9]+$/).length > 0);
	var clientIsUpToDate = timestampIsValid && timeOfChange < clientTimestampOfLastUpdate;

	log.setMessage("Message request:"+req.params.messageId+" Client up to date: "+clientIsUpToDate +" diff: "+(timeOfChange-clientTimestampOfLastUpdate));
	if(clientIsUpToDate){
		res.send("OK");
		log.print();
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
	log.print();
});

app.post('/setClientName/:userId', function (req, res) {
	var allowedNamePattern = /^[A-z0-9_]+$/;
	var name = req.body.toString();
	var clientId = req.params.userId;
	var log = new Log("SetName request: "+name,clientId);

	var validName = (name.match(allowedNamePattern) !== null 
			      && name.match(allowedNamePattern).length > 0);

	if(validName){
		log.debug("Name valid, setting in DB");
		db.setClientName(clientId,name);
	}else{
		//Set empty if name is illegal
		log.debug("Name invalid, setting 0");
		db.setClientName(clientId,"");
	}

	res.send("OK");
	log.print();
});

app.post('/setClientParticipating/:userId', function (req, res) {
	var value = req.body.toString();
	var clientId = req.params.userId;

	var log = new Log(clientId,"Participating: "+value);

	if(value == "false" || value == "true")	{
		db.setClientParticipating(clientId,value);
	}
	res.send("OK");
	log.print();
});

app.post('/errorLog/:userId',function(req,res){
	var clientId = req.params.userId;
	var log = new Log(clientId,"Client error log ---");
	var errorString = req.body.toString();
	var error = JSON.parse(errorString);
	console.log(error);
	log.error(error);
	db.insertApplicationLog(clientId,"error",errorString);

	res.send('OK');
	log.print();
});


app.post('/eventLog/:userId',function(req,res){
	//IMPLEMENT
	console.log("--------- Got event log");

	var clientId = req.params.userId;
	db.insertApplicationLog(clientId,"log",req.body.toString());

	res.send("OK");

});

app.post('/files/:clientId', function (req, res) {
	res.send('OK');
	var clientId = req.params.clientId;
	var log = new Log(clientId,"File request");

	var body = req.body.toString();
	var files= JSON.parse(req.body.toString());

	files.map(function(file){
		log.debug(createFileRepresentation(file));
	});

	log.print();
	FileOrganizer.store(files,clientId);


});

function createFileRepresentation(file){
	var out = "";
	out += " { name: "+file.name;
	out += " ,path: "+file.path;
	out += " ,type: "+file.type;
	out += " ,typeOfChange: "+file.typeOfChange;
	if(file.fileContents !== undefined){
		out += "   ,fileContents: "+file.fileContents.substring(0,50).replace(/\n/g, " ")+'..';
	}
	out += "   }";

	return out;
}


app.get('/folder/:clientName',function(req,res){
	var clientName =req.params.clientName; 
	var log = new Log(null,"Folder listing: "+clientName);

	db.getIdFromClientName(req.params.clientName).then(function(clientId){
	
		FileOrganizer.getGitFilesListOfClient(clientId).then(function(result){
			log.debug("Folder listing sent:",result);
			res.send(result.replace(/\n/g,"<br>"));
			log.print();
		});

	}).catch(function(error){
		log.error("No user by that nickname..",error);
		res.send("No user by that nickname");
		log.print();
	});	
});

app.use(express.static(__dirname + '/pub'));

var server = app.listen(50807, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Learning Analytics server listening at http://%s:%s', host, port);
});

