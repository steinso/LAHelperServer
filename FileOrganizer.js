var exec = require('child_process').exec;
var fs = require('fs');

var FileOrganizer = function(){
	var storagePath = "/home/stan/projects/errorLogger/files/";

	// Files is array of JSON objects
	var store = function(files,userId){
		containsMarkersFile = false;

		files.map(function(file){
			file = JSON.parse(file);
			saveFile(userId,file.filename,file.contents);

			if(file.filename == ".markers.json"){
				containsMarkersFile = true;
			}
		});

		// If we got a markers file, we should also perform a git commit
		if(containsMarkersFile){
			saveState(userId);	
		}
	};

	var saveFile = function(userid,filename,contents){
		var directoryPath = storagePath+userid;
		//TODO: Check directory exists
		//
		var filePath = directoryPath+"/"+filename;
		// Use regex to check filename.
		fs.writeFile(filePath, contents, function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("File was saved: ",filePath);
			}
		}); 
	};

	var createFileStorage = function(clientId){
		var directory = storagePath+clientId;
		fs.mkdirSync(directory);

		child = exec("cd "+directory+"; git init; cd "+storagePath,
			function (error, stdout, stderr) {
				console.log("Initializing directory for "+clientId);
				 console.log('stdout: ' + stdout);
				 console.log('stderr: ' + stderr);
				 if (error !== null) {
						   console.log('exec error: ' + error);
							   
			 }
			});
	};

	var saveState = function(clientId){
		var directory = storagePath+clientId;
		child = exec("cd "+directory+"; git add .; git commit -m \" Auto commit:  "+Date.now()+"\";cd "+directory,
			function (error, stdout, stderr) {
				console.log("performing commit for "+clientId);
				 console.log('stdout: ' + stdout);
				 console.log('stderr: ' + stderr);
				 if (error !== null) {
						   console.log('exec error: ' + error);
							   
				 }
			});

	};	

	return{
		store:store,
		createFileStorage:createFileStorage
	};
};




module.exports = FileOrganizer;
