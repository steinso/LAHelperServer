var exec = require('child_process').exec;
var fs = require('fs');

var FileOrganizer = function(){
	var storagePath = "/home/stan/projects/errorLogger/files/";
	var MARKERS_FILENAME = ".markers.json";

	// Files is array of JSON objects
	var store = function(files,userId){

		_ensureUserFolderCreated(userId);

		_processFilesAndFolders(files,userId);

		_performCommitIfMarkers(files,userId);
	};

	var _ensureUserFolderCreated = function(userId){

		if(!fs.existsSync(storagePath+userId)){
			createFileStorage(userId);
		}
	};

	var _processFilesAndFolders = function(files,clientId){

		files.map(function(file){
			//file = JSON.parse(file);
			if(file.type === 'folder'){
				_processFolder(file,clientId);

			}else if( file.type === 'file' ){
				_processFile(file,clientId);
			}
		});
	};

	var _processFolder = function(folder,clientId){
		if(folder.typeOfChange==="removed"){
			_deleteFolder(folder,clientId);
			return;
		}

		if(folder.typeOfChange==="added" || folder.typeOfChange ==="content"){
			_getAndCreatePath(folder,clientId);
		}
	};

	var _deleteFolder = function(folder,clientId){
		var path = _getAndCreatePath(folder,clientId);
		console.log("trying to delete: ",path);
		if(fs.existsSync(path)){
			//fs.rmdirSync(path);
			console.log("DELETED DIR",path);
		}
	};

	var _processFile = function(file,clientId){
		if(file.typeOfChange==="removed"){
			_deleteFile(file,clientId);
			return;
		}

		if(file.typeOfChange==="added" || file.typeOfChange ==="content"){
			var folder = _getFolderName(file);
			saveFile(file,clientId);
		}
	};

	var _deleteFile = function(file,clientId){
		var path = _getAndCreatePath(file,clientId);
		var filePath = path+'/'+file.name;
		console.log("Tryig to delete FILE",filePath);
		if(fs.existsSync(filePath)){
			console.log("DELETED FILE",filePath);
			fs.unlinkSync(filePath);
		}
	};

	var _getAndCreatePath = function(file,clientId){
		var allowedSymbols = /[^A-z0-9\.\_\t//]/g;
		//Replace unwanted characters with _
		var sanitizedPath = file.path.replace(allowedSymbols,"_");
		var segments = sanitizedPath.split("/");
		//Remove filename from path if file
		if(file.type === 'file'){
			segments.pop();
		}

		console.log("Trying to create path",file.path,sanitizedPath);
		console.log("segments",segments);

		_createFolderTree(segments,clientId);

		var path = segments.join("/");

		console.log("Returned path: ",storagePath+clientId+path);
		return storagePath+clientId+path;
	};

	var _createFolderTree = function(segments,clientId){
		
		var currentPath = storagePath+clientId;

		segments.map(function(segment){
			if(segment === ""){return;}
			//Add next segment to pah each iteration
			currentPath = currentPath+"/"+segment;
			console.log("Trying to create folder",currentPath);
			if(!fs.existsSync(currentPath)){
				console.log("Created folder",currentPath);
				fs.mkdirSync(currentPath);
			}
		});

	};

	var _performCommitIfMarkers = function(files,clientId){

		if(_containsMarkersFile(files)){
			saveState(clientId);	
		}
	};
	var _containsMarkersFile = function(files){
		return files.reduce(function(file,out){
			if(file.name == MARKERS_FILENAME){
				out = true;
			} 
			return out;
		},false);
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

	var saveFile = function(file,userid){
		console.log("Trying to save file",file.path);
		var directoryPath = _getAndCreatePath(file,userid);
		//TODO: Check directory exists
		//
		var filePath = directoryPath+"/"+file.name;
		// Use regex to check filename.
		fs.writeFile(filePath, file.fileContents, function(err) {
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
		child = exec("cd "+directory+"; git add --all .; git commit -m \" Auto commit:  "+Date.now()+"\";cd "+directory,
					 function (error, stdout, stderr) {
						 console.log("performing commit for "+clientId);
						 console.log('stdout: ' + stdout);
						 console.log('stderr: ' + stderr);
						 if (error !== null) {
							 console.log('exec error: ' + error);

						 }
					 });

	};	

	var getGitFilesListOfClient = function(clientId){
		return new Promise(function(resolve,reject){

			child = exec("git ls-files",{cwd:storagePath+clientId},
					 function (error, stdout, stderr) {
						 resolve(stdout);
		});
	});
	};

	return{
		store:store,
		getGitFilesListOfClient:getGitFilesListOfClient,
		createFileStorage:createFileStorage
	};
};




module.exports = FileOrganizer;
