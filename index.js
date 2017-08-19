#!/usr/bin/env node
const fs = require("fs");
const program = require('commander');

program
	.option("-d, --directory <directory>", "Specify directory")
	.option("-i, --ignore <filenames>", "Ignore specific files", function list(val) {return val.split(',');})
	.parse(process.argv);

var result = {
	TOTAL_FILES: 0,     // tracking how much files
	COMPLETED_FILES: 0, // we had read
	TOTAL_LINES: 0
};

function finish() {
	delete result.TOTAL_FILES;
	delete result.COMPLETED_FILES;
	console.log(result);
}

function updateresult(metadata) {
	// tracking...
	result.COMPLETED_FILES++;
	// total lines
	result.TOTAL_LINES += metadata.lines;

	if(!result[metadata.extension + "_FILES"]) {
		result[metadata.extension + "_FILES"] = 1;
	}
	else {
		result[metadata.extension + "_FILES"]++;
	}

	if(!result[metadata.extension + "_LINES"]) {
		result[metadata.extension + "_LINES"] = metadata.lines;
	}
	else {
		result[metadata.extension + "_LINES"] += metadata.lines;
	}

	// we've read all the files
	if (result.TOTAL_FILES === result.COMPLETED_FILES) {
		// call finish
		finish();
	}
}

function counter(fileName, cb) {
	fs.readFile(fileName, (err, file) => {
		_extension = fileName.split(".").pop();
		cb({
			filename: fileName,
			extension: "." + _extension !== fileName ? _extension.toUpperCase() : "PLAIN",
			lines: file.toString().split(/\r\n|\r|\n/).length
		});
	});
}

const ignore = {
	user: program.ignore,
	default: ["node_modules", "package.json", "package-lock.json"],
	extensions: ["jpg", "jpeg", "png", "svg", "ico", "xml", "psd"]
}

function readDirectory(dir) {
	dir = dir ? dir + "/" : "./";
	fs.readdir(dir, function(err, files) {
		files.forEach((fileName) => {
			// .git, .DS_Store...
			if (fileName[0] === ".") {
				return;
			}
			// the file must be ignored (by the user)
			else if (ignore.user && ignore.user.includes(fileName)) {
				return;
			}
			// the file must be ignored (by default)
			else if (ignore.default.includes(fileName)) {
				return;
			}
			// the file must be ignored (because of extension)
			else if (ignore.extensions.includes(fileName.split(".").pop())) {
				return;
			}
			// it is a directory, recursion happens
			else if (fs.statSync(dir + fileName).isDirectory()) {
				return readDirectory(dir + fileName);
			}
			// it is a file
			else {
				counter(dir + fileName, updateresult);
			}
			// tracking...
			result.TOTAL_FILES++;
		});
	})
}

readDirectory(program.directory);