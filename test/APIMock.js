
var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
var argv = require("minimist")(process.argv.slice(2));
var PORT = argv.p || argv.port || "12345";

app.use(bodyParser.json({limit:"1mb"}));

var requests = [];

function handleRequest(req, res){
	requests.push(req);
	var response = {status:"OK"};
	res.send(JSON.stringify(response));
}


app.get("/lastRequest",function(req,res){
	var body = {requestbody:requests.pop().body,status:"OK"};
	res.send(JSON.stringify(body));
});

app.post("/*",handleRequest);
//app.get("/*",handleRequest);


app.listen(PORT,function(){
	console.log("API Mock listening on port"+PORT);
});
