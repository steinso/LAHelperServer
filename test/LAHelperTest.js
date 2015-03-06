var request = require("request");
var should = require("should");
var spawn = require("child_process").spawn;

var serverNode;
var mockNode;
var mockPort = 49823;
var LAHelperPort = 49824;
var _url = "http://localhost:"+LAHelperPort;
var mockUrl = "http://localhost:"+mockPort;


function getLastRequestToMock (){
	return new Promise(function(resolve,reject){

		var body = {"status":"Wrong request"};
		request({url:mockUrl+"/lastRequest", method:"GET",body:body,json:true},function(error, response, body){

			resolve(body);
		});
	});
}

function testEndpoint(url,body,expectedResultFromServer,expectedInputToMock,_contentType){
	console.log("SHOUDL: ",should.config.checkProtoEql)
	var contentType = _contentType || "application/json";
	return new Promise(function(resolve,reject){
		request({url:url,method:"POST",json:true,body:body,headers:{'Content-Type':contentType}},function(error,response,body){
			console.log("Got response from LAHelper: ",body,error);
			getLastRequestToMock().then(function(_result){

				console.log("Got response from MockAPI: ",_result);
				try{
					var result = _result.requestbody.should.equal(expectedInputToMock);
					var resultOutput = body.requestbody.should.equal(expectedResultFromServer);
					resolve();
				}catch(e){
					console.log("LAServer: "+body);
					console.log("APIMock:  "+result);
					//	console.dir(result.requestbody);
					reject(e);
				}
			},function(error){reject(error)});
		});

	});
}

describe("LAHelperServer", function () {
	before (function (done) {
		//Setup MOCK endpoint and LAHelper service
		serverNode = spawn("node", ["test/APIMock.js","-p", mockPort], {stdio: "inherit"});
		mockNode = spawn("node", ["LAHelper.js", "-p", LAHelperPort, "--LA_STORE_URL", mockUrl], {stdio: "inherit"});

		setTimeout(function(){done();},1000)
	});

	after (function(done){
		serverNode.kill();
		mockNode.kill();
		done();
	});
	/*
	   it("shuold llllll",function(done){
	   var body = {test:"this is a test"};
	   request({url:url+"/createUser",method:"POST",json:true,body:body},function(error,response,body){
	   console.log("LAServer: "+body);
	   getLastRequestToMock().then(function(result){
	   console.log("APIMock:  "+result.status);
	   console.dir(result.requestbody);
	   done();
	   })
	   });

	   });

*/
	it("shuold work with setClientParticipating",function(done){

		var body = true;
		var url = _url+"/setClientParticipating/test";
		var expectedResultFromServer = "OK";
		var expectedInputToMock = {clientId:"test",participating:body.toString()}
		var contentType = "application/octet-stream";

		testEndpoint(url,body,expectedResultFromServer,expectedInputToMock,contentType).then(function(result){
			done();
		},function(error){done(error);});
	});

	it("shuold work with ",function(done){

		var body = "stein";
		var url = _url+"/setClientName/test";
		var expectedResultFromServer = "OK";
		var expectedInputToMock = {clientId:"test",name:"stein"}
		var contentType = "application/octet-stream";

		testEndpoint(url,body,expectedResultFromServer,expectedInputToMock,contentType).then(function(result){
			done();
		},function(error){done(error);});
	});

});
