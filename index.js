const fs = require("fs");

function counter(file) {
	fs.readFile(file, (err, file) => {
		console.log(file.toString().split(/\r\n|\r|\n/).length);
	});
}

const ignore = {
	user: process.argv[2] && process.argv[2].split(","),
	default: ["node_modules", "package.json", "package-lock.json"],
	extensions: ["jpg", "jpeg", "png", "svg", "psd"]
}

function readDirectory(dir) {
	dir = dir ? dir + "/" : "./";
	fs.readdir(dir, function(err, files) {
		files.forEach((fileName) => {
			// .git, .DS_Store...
			if (fileName[0] === ".") {
				return;
			}
			// it is a directory, recursion happens
			else if (fs.statSync(dir + fileName).isDirectory()) {
				readDirectory(dir + fileName);
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
			// it is a file
			else {
				counter(dir + fileName);
			}
		});
	})
}

readDirectory();