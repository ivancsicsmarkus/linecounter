const fs = require("fs");
const path = require("path");

module.exports = linecounter;

var results = {
	TOTAL_LINES: 0,
};

var operation = {
	TOTAL_FILES: [],     // tracking how much files
	COMPLETED_FILES: 0   // we had read
}

var opts = {};

function linecounter(cb, options) {
	opts = options || opts;
	// if there was a single file specified
	if (opts.file) {
		var counting = new Promise((resolve, reject) => {
			operation.resolve = resolve;
			counter(opts.file);
		});
	}
	// start from specified directory or from pwd
	else {
		var counting = new Promise((resolve, reject) => {
			operation.resolve = resolve;
			var counting = readDirectory(opts.directory || ".");
		});
	}
	counting.then(res => {
		return cb(res);
	})
}

// for formatting output
function finish() {
	if (opts.list) {
		return operation.TOTAL_FILES.join("\n");
	}
	else {
		return JSON.stringify(results);
	}
}

// when a files has been read
function updateresults(metadata) {
	// tracking...
	operation.COMPLETED_FILES++;
	// total lines
	results.TOTAL_LINES += metadata.lines;

	// if it is the first file with this extension, we initialize the extension
	if(!results[metadata.extension]) {
		results[metadata.extension] = {
			files: 1,
			lines: metadata.lines
		};
	}
	else {
		results[metadata.extension].files++;
		results[metadata.extension].lines += metadata.lines;
	}
	// we've read all the files
	if (operation.TOTAL_FILES.length === operation.COMPLETED_FILES) {
		// we should resolve the main promise
		operation.resolve(finish());
	}
	else return;
}

function counter(fileName) {
	// tracking...
	operation.TOTAL_FILES.push(fileName);
	// possible extension (if it is empty, we use PLAIN)
	var _extension = path.extname(fileName);
	// we read the file
	fs.readFile(fileName, (err, file) => {
		updateresults({
			filename: fileName,
			extension: _extension ? _extension.toUpperCase() : "PLAIN",
			lines: file.toString().split(/\r\n|\r|\n/).length
		});
	});
}

const ignore = require("./lib/ignore.js").concat(opts.ignore || []);

const HALF_MEGABYTE = 1024 * 512;

function readDirectory(dir) {
	dir = path.join(dir, "/");
	// read the directory
	fs.readdir(dir, (err, files) => dealWithFiles(files, dir));
}

function dealWithFiles (files, dir) {
	files.forEach(fileName => {
		let stats = fs.statSync(path.join(dir, fileName));
		// .git, .DS_Store...
		if (fileName[0] === ".") {
			return;
		}
		// file is too big to be text, probably they've ommited the extension
		else if (stats.size > HALF_MEGABYTE) {
			// if we should log errors
			if (opts.errors) {
				let filePath = path.join(dir, fileName).replace(/(\s+)/g, "\\$1");
				let fileSize = (stats.size/1024/1024).toFixed(2);
				fs.appendFile("linecounter.error.log",`${fileName} is ~${fileSize} megabytes. It is too big to be standard text. However if you are interested in the results of this file just type: linecounter -f ${filePath}, or just ignore it with: linecounter -i ${filePath}\n`, (err) => {
						if (err) throw err
				});
			}
			return;
		}
		// the file must be ignored (by default or by user)
		else if (ignore.includes(fileName) || ignore.includes(path.extname(fileName))) {
			return;
		}
		// it is a directory (that is not ignored), recursion happens
		else if (stats.isDirectory()) {
			return readDirectory(path.join(dir, fileName));
		}
		// it is a simple file, just count it
		else {
			return counter(path.join(dir, fileName));
		}
	});
}