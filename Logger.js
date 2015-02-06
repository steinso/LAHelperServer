
var Logger = function(){

	var _logs = [];
	var _msg = "";

	var setMessage = function(message){
		_msg = message;
	};

	var constructor = function(clientId,msg){
		_timestamp = _getTimeStamp();
		_clientId = clientId;
		_msg = msg;

	};

	var debug = function(msg){
		var log = {type:"DEBUG",msg:msg};
		_logs.push(log);
	};

	var error = function(msg){
		var log = {type:"ERROR",msg:msg};
		_logs.push(log);
	};

	var print = function(){
		console.log(_timestamp+"|"+_clientId+"|| "+_msg);
		_logs.map(_printSingleLog);
	};

	var _printSingleLog = function(log){
		console.log("   | "+log.type+": "+log.msg);
		
	};

	var _getTimeStamp = function(){
		var t = new Date();
		return t.getFullYear()+"-"+t.getMonth()+"-"+t.getDay()+"T"+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds(); 
	};

	return {
		setMessage:setMessage,
		debug:debug,
		error:error,
		print:print
	};
};


module.exports = new Logger;
