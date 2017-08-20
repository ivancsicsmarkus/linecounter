# Linecounter

A CLI for determining how much code you had written

## Install

Install it with npm!

```npm install -g linecounter```

Compiling on Windows machines requires the [node-gyp prerequisites](https://github.com/nodejs/node-gyp#on-windows).

## Usage

```linecounter [options]```

### Options

```
    -d, --directory <directory>                       specify directory
    -i, --ignore <filename1, filename2... filenameN>  ignore specific files
    -f, --file <filename>                             count only one file
    -l, --list                                        list out not ignored (counting files)
    -h, --help                                        output usage information
```

### Examples

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
Echo results in a file.
___
```
linecounter -d ~/Projects/ultimate-facebook
```
Analyze a specified directory.
___
```
linecounter -i secrets.js,copiedThings.json
```
Ignore specified files (you don't have to add path, only filename).
___
```
inecounter -f all.js
```
Get number of lines in one specified file.
___
```
linecounter -l -i secrets.js
```
List out files that would count with the current options