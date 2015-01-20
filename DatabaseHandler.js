var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();

// Can be run in memory!
//var db = new sqlite3.Database(':memory:');

var DatabaseHandler = function(){

	var file = "DB.db";
	var db = new sqlite3.Database(file);

	var _constructor = function(){
		_initializeDBIfEmpty();

	};

	var _initializeDBIfEmpty = function(){
		_createFile();
		_createTables();
	};

	var _createFile = function(){
		var exists = fs.existsSync(file);
		if(!exists) {
			console.log("Creating DB file:"+file);
			fs.openSync(file, "w");
		}	
	};

	var _createTables = function(){
		db.serialize(function() {
			db.run("CREATE TABLE if not exists applicationLog('id' INTEGER primary key AUTOINCREMENT,'userId' varchar(40), 'type' varchar(20), 'message' varchar(1000), 'timestamp' DATETIME DEFAULT CURRENT_TIMESTAMP)");

			db.run("CREATE TABLE if not exists user('id' INTEGER primary key AUTOINCREMENT,'userId' varchar(40), 'ovinger' int,'requests' int, 'creation' DATETIME DEFAULT CURRENT_TIMESTAMP)");
		});
	};

	var insertApplicationLog = function(userId,type,message){

		var values = {
			$userId:userId,
			$type:type,
			$message: message
		};

		//We dont use prepared statements as it will be a long delay between insertions
		var stmt = db.run("INSERT INTO applicationLog (userId,type,message) VALUES ($userId,$type,$message)",values);

	};

	// Options: {userId:,type:,after:,before:}
	var fetchApplicationLog = function(options){
		return new Promise(function(resolve,reject){
			var wherePart = _generateSQLWherePartFromOptions(options);

			_fetchApplicationLogGivenWhere(wherePart,options).then(
				function(result){
					resolve(result);
				}).catch(function(error){
					reject(error);
				});
			
		});
	};

	var _fetchApplicationLogGivenWhere = function(whereClause,options){
		return new Promise(function(resolve,reject){
			console.log("SELECT * FROM applicationLog "+whereClause);
			db.all("SELECT * FROM applicationLog "+whereClause+";",{},function(error,rows){
		
				console.log("got",rows+error)
				if(error!==null){reject(error);}
				resolve(rows);
			});
		});
	};

	var _generateSQLWherePartFromOptions = function(options){
		var conditions = _generateArrayOfConditions(options);
		if(conditions.length === 0){return "";}
		var whereString = _generateStringOfConditions(conditions);

		console.log(whereString);
		return whereString;
	};

	var _generateArrayOfConditions = function(options){
		var conditions = [];

		for(var field in options){
			if(!options.hasOwnProperty(field)){continue;}
			var condition = _optionToCondition(field,options[field]);
			conditions.push(condition);
		}
		return conditions;
	};

	var _optionToCondition = function(option,value){

		if(option == 'before'){
			return "timestamp < "+value;
		}

		if(option == 'after'){
			return "timestamp > "+value;
		}

		return option+ " = '"+value+"'";
	};

	var _generateStringOfConditions = function(conditionsArray){
		var conditionString = " WHERE ";
		for(var i=0;i<conditionsArray.length-1;i++){
			conditionString+=conditionsArray[i] + " AND ";	
		}

		conditionString+=conditionsArray[i] ;	
		return conditionString;
	};

	var _closeConnection = function(){

		db.close();
	};

	_constructor();
	return{insertApplicationLog:insertApplicationLog,
		fetchApplicationLog:fetchApplicationLog};
};

var databaseHandler = new DatabaseHandler();
databaseHandler.insertApplicationLog(12345,"Test","Dette er en lang melding");
databaseHandler.insertApplicationLog(54321,"Test","Dette er en lang melding");
databaseHandler.fetchApplicationLog().then(function(result){ console.log("1",result);}).catch(function(error){console.log(error);});
databaseHandler.fetchApplicationLog({userId:12345}).then(function(result){ console.log(2,result);}).catch(function(error){console.log(error);});

