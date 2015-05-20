/// <reference path="typings/lib.es6.d.ts" />
/// <reference path="typings/node/node.d.ts" />
var fs = require('fs');
var args = process.argv.slice(2);
if (args.length < 3)
    throw new Error('arguments are not supplied');
var tmpFolder = args[0], outFolder = args[1], logoFileName = args[2];
start();
function start() {
    makeDir(outFolder);
    var textLogo = fs.readFileSync(logoFileName).toString();
    textLogo = textLogo.replace(/{year}/g, new Date().getFullYear().toString());
    copyFile('tswlib.d.ts', textLogo, processDefFileLine);
    copyFile('tswlib.js', textLogo, processJSFileLine);
}
function copyFile(fileName, textLogo, processLines) {
    var text = fs.readFileSync(pathCombine(tmpFolder, fileName)).toString();
    if (processLines) {
        var lines = text.split("\n");
        var lines2 = processLines(lines);
        text = lines2.join('\n');
    }
    var data2 = textLogo + text;
    fs.writeFileSync(pathCombine(outFolder, fileName), data2);
}
function processDefFileLine(lines) {
    var lines2 = [];
    var moduleName = null;
    for (var _i = 0; _i < lines.length; _i++) {
        var line = lines[_i];
        var m = line.match(/^\s*declare module\s+([\w.]+)/);
        if (m != null) {
            moduleName = m[1];
        }
        var isExcluded = moduleName === 'tsw.internal' ||
            line.substr(0, 3) === '///' ||
            line.match(/^\s*z_/) ||
            line.match(/^\s*(private|protected)\s+/);
        if (!isExcluded) {
            var line2 = line;
            lines2.push(line2);
        }
    }
    return lines2;
}
function processJSFileLine(lines) {
    var lines2 = [];
    for (var _i = 0; _i < lines.length; _i++) {
        var line = lines[_i];
        var lineTrimmed = line.trim();
        var isExcluded = lineTrimmed.substr(0, 2) === '//';
        if (!isExcluded) {
            lines2.push(line);
        }
    }
    return lines2;
}
function makeDir(folderName) {
    if (!fs.existsSync(folderName))
        fs.mkdirSync(folderName);
}
function pathCombine(s1, s2) {
    if (s1.slice(-1) != '\\' && s2[0] != '\\')
        s1 += '\\';
    return s1 + s2;
}
