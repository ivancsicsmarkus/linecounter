const fs = require("fs");

function counter(file) {
	fs.readFile(file, (err, file) => {
		console.log(file.toString().split(/\r\n|\r|\n/).length);
	});
}

const ignore = process.argv[2].split(",");

fs.readdir("./", function(err, files) {
	files.forEach((path) => {
		// .git, .DS_Store...
		if (path[0] === ".") {
			return;
		}
		// it is a directory, recursion happens
		else if (fs.statSync(path).isDirectory()) {
			return;
		}
		// the file must be ignore
		else if (ignore && ignore.includes(path)) {
			return;
		}
		// it is a file
		else {
			counter(path);
		}
	});
})