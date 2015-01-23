var exec = require('child_process').exec;
var fs = require('fs');

var FileOrganizer = function(){
	var storagePath = "/home/stan/projects/errorLogger/files/";

	// Files is array of JSON objects
	var store = function(files,userId){
		containsMarkersFile = false;

		files.map(function(file){
			//file = JSON.parse(file);
			if(file.type === 'folder' || file.typeOfChange==="removed"){return;}
			var folder = _getFolderName(file);
			saveFile(userId,folder, file.name,file.contents);

			if(file.name == ".markers.json"){
				containsMarkersFile = true;
			}
		});

		// If we got a markers file, we should also perform a git commit
		if(containsMarkersFile){
			saveState(userId);	
		}
	};

	var _getFolderName = function(file){
		var packageRegex = /^\t*package ([A-z]+) +;/;
		var packageName = file.fileContents.match(packageRegex);
		if(packageName !== null && packageName.length >0 && packageName[0] !== ""){
			console.log("Extracted packageName:",packageName);
			return packageName[0];
		}
		//Get name from path
		var parts = file.path.split("/");
		var parentFolder = parts[parts.length-2];

		console.log("Extracted folderName:",parentFolder);
		return parentFolder;
		

		
	};

	var saveFile = function(userid,folder,filename,contents){
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
