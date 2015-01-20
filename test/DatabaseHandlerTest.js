var db = require('./DatabaseHandlerTest.js');
var assert = require("assert");

describe('Database Handler', function(){
	describe('Inserting logs()', function(){
		it('Inserting log should be persisted to DB', function(){
			db.insertApplicationLog("stein","test","mymsg");
			assert.equal(-1,-2);
						    
		});
		  
	});

});
