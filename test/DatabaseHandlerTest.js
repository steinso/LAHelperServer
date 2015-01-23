var db = require('../DatabaseHandler.js');
var assert = require("assert");
console.log(db);
db = new db(':memory:');

describe('Database Handler', function(){
	describe('Inserting logs()', function(){
		it('Inserting log should be persisted to DB', function(){
			db.insertApplicationLog("stein","test","mymsg");
			db.fetchApplicationLog().then(function(result){
				assert.equal(result.message,"mymsg");	
				assert.equal(result.userId,"stein");
			});
		});
		  
	});

	describe('Private functions',function(){
		it('Should generate correct condition clauses given options',function(){
			var options = {studentId: "12345",before:"9939940",after:"29932221",type:"test"};
			var whereClause = db.__forTesting._generateSQLWherePartFromOptions(options);
			console.log(options);
			console.log(whereClause);
			assert.equal(whereClause," WHERE studentId = '12345' AND timestamp < 9939940 AND timestamp > 29932221 AND type = 'test'");
		});
	});

});
