"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require("request");
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

//Lib for processing command line arguments
var argv = require('minimist')(process.argv.slice(2));

var PORT = argv.p || argv.port || "50807";
var LA_STORE_URL = argv.LA_STORE_URL || "http://localhost:50812";

///////////////////////////////////
///////////////////////////////////
//
//  //////////////////////////////

app.post("/createUser", function(req, res){
	var log = new Log(null, " Create client: ");
	var url = LA_STORE_URL+"/client";

	request.post(url, function(error, response, body){
		log.debug(body);
		log.print();
		res.send(body);
	});
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
	var message;
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
	var log = new Log("SetName request: "+name,clientId);
	var url =LA_STORE_URL+"/client/name";

	var name = req.body.toString();
	var clientId = req.params.userId;
	var info = {name:name,clientId:clientId};

	request({url:url,method:"POST",body:info,json:true}, function(error, response, body){
		log.debug(body);
		log.debug("error: "+error);
		log.print();
		res.send("OK");
	});

});

app.post('/setClientParticipating/:userId', function (req, res) {
	var url = LA_STORE_URL+"/client/participating";

	var value = req.body.toString();
	var clientId = req.params.userId;
	var info = {participating:value,clientId:clientId};
	var log = new Log(clientId,"Set client participating---",info,req.body);

	request({url:url,method:"POST",body:info,json:true}, function(error, response, body){
		log.debug(body);
		log.debug("error: "+error);
		log.print();
		res.send("OK");
	});
});

app.post('/errorLog/:userId',function(req,res){

	var log = new Log(clientId,"Client error log ---");
	var url = LA_STORE_URL+"/errorLog";
	var clientId = req.params.userId;
	var errorString = req.body.toString();
	var error = JSON.parse(errorString);
	var info= {clientId: clientId, log: errorString};

	log.error(error);

	request({url:url,method:"POST",body:info,json:true}, function(error, response, body){
		log.debug(body);
		log.debug("error: "+error);
		log.print();
		res.send("OK");
	});
});


app.post('/eventLog/:userId',function(req,res){
	//IMPLEMENT
	console.log("--------- Got event log");

	var url = LA_STORE_URL+"/eventLog";
	var clientId = req.params.userId;
	var log = req.body.toString();
	var info= {clientId: clientId, log: log};

	request({url:url,method:"POST",body:info,json:true}, function(error, response, body){
		log.debug(body);
		log.debug("error: "+error);
		log.print();
		res.send("OK");
	});
});

app.post('/files/:clientId', function (req, res) {

	var url = LA_STORE_URL+"/file";
	var clientId = req.params.clientId;
	var body = req.body.toString();
	var files= JSON.parse(req.body.toString());
	var info= {clientId: clientId, files: files};
	var log = new Log(clientId,"File request");

	request({url:url,method:"POST",body:info,json:true}, function(error, response, body){
		if(error != null){
			log.debug("error: "+error);
		}
		log.print();
		res.send("OK");
	});
});


app.get('/folder/:clientName',function(req,res){
	var clientName =req.params.clientName; 
	var log = new Log(null,"Folder listing: "+clientName);

	res.send("Endpoint deprecated, please use /errorreport instead");

/*	db.getIdFromClientName(req.params.clientName).then(function(clientId){
	
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
	*/
});

app.use(express.static(__dirname + '/pub'));

var server = app.listen(PORT, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Learning Analytics server listening at http://%s:%s apiServer: /%s', host, port,LA_STORE_URL);
});

