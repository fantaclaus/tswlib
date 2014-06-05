var fs = require('fs');

var tmpFolder = 'tmp';
var outFolder = 'out';

(function ()
{
	makeDir(outFolder);

	var textLogo = fs.readFileSync('logo.txt').toString();

	copyFile('tswlib.d.ts', textLogo, true);
	copyFile('tswlib.js', textLogo, false);

})();

function copyFile(fileName, textLogo, removeRefCmts)
{
	var text = fs.readFileSync(pathCombine(tmpFolder, fileName)).toString();

	if (removeRefCmts)
	{
		text = removeRefComments(text);
	}

	var data2 = textLogo + text;
	fs.writeFileSync(pathCombine(outFolder, fileName), data2);
}

function removeRefComments(text)
{
	return text
		.split("\n")
		.filter(function (line)
			{
				return line.substr(0, 3) !== '///';
			})
		.join('\n');
}

function makeDir(folderName)
{
	if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
}

function pathCombine(s1, s2)
{
	if (s1.slice(-1) != '\\' && s2[0] != '\\') s1 += '\\';

	return s1 + s2;
}

