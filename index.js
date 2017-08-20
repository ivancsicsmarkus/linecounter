#!/usr/bin/env node
const fs = require("fs");
const program = require('commander');
const path = require("path");

program
	.option("-d, --directory <directory>", "specify directory")
	.option("-i, --ignore <filename1, filename2... filenameN>", "ignore specific files", function list(val) {return val.split(',');})
	.option("-f, --file <filename>", "count only one file")
	.option("-l, --list", "list out not ignored (counting files)")
	.parse(process.argv);

var result = {
	TOTAL_FILES: [],     // tracking how much files
	COMPLETED_FILES: 0, // we had read
	TOTAL_LINES: 0
};

function finish() {
	if (program.list) {
		console.log(result.TOTAL_FILES.join("\n"));
	}
	else {
		delete result.TOTAL_FILES;
		delete result.COMPLETED_FILES;
		console.log(JSON.stringify(result));
	}
}

function updateresult(metadata) {
	// tracking...
	result.COMPLETED_FILES++;
	// total lines
	result.TOTAL_LINES += metadata.lines;

	// if it is the first file with this extension, we initialize
	if(!result[metadata.extension]) {
		result[metadata.extension] = {};
		result[metadata.extension].files = 1;
		result[metadata.extension].lines = metadata.lines;
	}
	else {
		result[metadata.extension].files++;
		result[metadata.extension].lines += metadata.lines;
	}

	// we've read all the files
	if (result.TOTAL_FILES.length === result.COMPLETED_FILES) {
		// call finish
		finish();
	}
}

function counter(fileName, cb) {
	// tracking...
	result.TOTAL_FILES.push(fileName);
	fs.readFile(fileName, (err, file) => {
		var _extension = path.extname(fileName);
		cb({
			filename: fileName,
			extension: _extension ? _extension.toUpperCase() : "PLAIN",
			lines: file.toString().split(/\r\n|\r|\n/).length
		});
	});
}

var _ignore = require("./ignore.js");
const ignore = {
	user: program.ignore,
	default: _ignore.default,
	extensions: _ignore.extensions
}

const HALF_MEGABYTE = 1024 * 512;

function readDirectory(dir) {
	dir = path.join(dir, "/");
	fs.readdir(dir, function(err, files) {
		files.forEach((fileName) => {
			let stats = fs.statSync(path.join(dir, fileName));
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
			else if (ignore.extensions.includes(path.extname(fileName))) {
				return;
			}
			// it is a directory, recursion happens
			else if (stats.isDirectory()) {
				return readDirectory(dir + fileName);
			}
			// file is too big to be text, they've ommited the extension
			else if (stats.size > HALF_MEGABYTE) {
				return;
			}
			// it is a file
			else {
				counter(path.join(dir, fileName), updateresult);
			}
		});
	})
}

// if there was a single file specified
if (program.file) {
	counter(program.file, updateresult);
}
// start from specified directory or from pwd
else {
	readDirectory(program.directory || ".");
}