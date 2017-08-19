const fs = require("fs");

function counter(file) {
	fs.readFile(file, (err, file) => {
		console.log(file.toString().split(/\r\n|\r|\n/).length);
	});
}

const ignore = {
	user: process.argv[2] && process.argv[2].split(","),
	default: ["node_modules", "package.json", "package-lock.json"]
}

function readDirectory(dir) {
	dir = dir ? dir + "/" : "./";
	fs.readdir(dir, function(err, files) {
		files.forEach((path) => {
			// .git, .DS_Store...
			if (path[0] === ".") {
				return;
			}
			// it is a directory, recursion happens
			else if (fs.statSync(dir + path).isDirectory()) {
				readDirectory(dir + path);
			}
			// the file must be ignored (by the user)
			else if (ignore.user && ignore.user.includes(path)) {
				return;
			}
			// the files must be ignored (by default)
			else if (ignore.default.includes(path)) {
				return;
			}
			// it is a file
			else {
				counter(dir + path);
			}
		});
	})
}

readDirectory();