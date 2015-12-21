var fs = require('fs');
var args = process.argv.slice(2);
if (args.length < 3)
    throw new Error('arguments are not supplied');
var tmpFolder = args[0], outFolder = args[1], logoFileName = args[2], srcName = args[3];
start();
function start() {
    makeDir(outFolder);
    var textLogo = fs.readFileSync(logoFileName).toString();
    textLogo = textLogo.replace(/{year}/g, new Date().getFullYear().toString());
    copyFile(srcName + '.d.ts', textLogo, processDefFileLine);
    copyFile(srcName + '.js', textLogo, processJSFileLine);
    copyFile(srcName + '.js.map');
}
function copyFile(fileName, textLogo, processLines) {
    if (textLogo === void 0) { textLogo = ''; }
    var fnSrc = pathCombine(tmpFolder, fileName);
    var fnDst = pathCombine(outFolder, fileName);
    if (fs.existsSync(fnSrc)) {
        console.log(fnSrc + " -> " + fnDst);
        var text = fs.readFileSync(fnSrc).toString();
        if (processLines) {
            var lines = text.split("\n");
            var lines2 = processLines(lines);
            text = lines2.join('\n');
        }
        var data2 = textLogo + text;
        fs.writeFileSync(fnDst, data2);
    }
    else {
        console.log(fnSrc + " not found");
    }
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
        var isExcluded = moduleName.match(/\binternal\b/) ||
            startsWith(line, '///') ||
            line.match(/^\s*z_/) ||
            line.match(/^\s*private\s+/);
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
        var isExcluded = !startsWith(lineTrimmed, '//#') && startsWith(lineTrimmed, '//');
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
function startsWith(s, pat) {
    return s.substr(0, pat.length) === pat;
}
//# sourceMappingURL=makeout.js.map