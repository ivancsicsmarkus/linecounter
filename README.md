# Linecounter

A package / CLI for determining how much code you had written

## Install

Install it with npm!

Global CLI:
```npm install -g linecounter```

Node Package:
```npm install --save linecounter```
```const linecounter = require("linecounter")```

Compiling on Windows machines requires the [node-gyp prerequisites](https://github.com/nodejs/node-gyp#on-windows).

## Usage

### Node package

```linecounter(callback, [options])```
Callback gets a JSON string parameter.

#### Options

- directory: specify directory [String]
- ignore: ignore specific files [String1,String2,String3]
- file: count only one file [String]
- list: list out not ignored (counting files) [Boolean]
- errors: list out errors to linecounter.error.log [Boolean]


### CLI

```linecounter [options]```

#### Options

```
-d, --directory <directory>                       specify directory
-i, --ignore <filename1, filename2... filenameN>  ignore specific files
-f, --file <filename>                             count only one file
-l, --list                                        list out not ignored (counting files)
-e, --errors                                      list out errors to linecounter.error.log
-h, --help                                        output usage information
```

#### Examples

```
linecounter
```
This will analyze the current directory. Output is in json.
```
{
  "TOTAL_LINES": 134,
  "PLAIN": {"files":1, "lines":22},
  "JS": {"files":1, "lines":111},
  "JSON": {"files":1, "lines":1}
}
```
___
```
linecounter >> stats.txt
```
Echo results to a file.
___
```
linecounter --directory ~/Projects/ultimate-facebook
```
Analyze a specified directory.
___
```
linecounter --ignore secrets.js,copiedThings.json
```
Ignore specified files (you don't have to add path, only filename).
___
```
linecounter --file main.js
```
Get number of lines in one specified file.
___
```
linecounter --list --ignore secrets.js
```
List out files that would count with the current options