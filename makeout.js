var fs = require('fs');

var tmpFolder = 'tmp';
var outFolder = 'out';

(function ()
{
	makeDir(outFolder);

	var textLogo = fs.readFileSync('logo.txt').toString();
	textLogo = textLogo.replace(/{year}/g, new Date().getFullYear());

	copyFile('tswlib.d.ts', textLogo, removeRefComments);
	copyFile('tswlib.js', textLogo);

})();

function copyFile(fileName, textLogo, processLine)
{
	var text = fs.readFileSync(pathCombine(tmpFolder, fileName)).toString();

	if (processLine)
	{
		text = processLine(text);
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
		.map(function (line)
		{
//			line = line
//				.replace(/public\s+z_/, 'private z_')
//				.replace(/^(\s*)z_/, '$1private z_');
			return line;
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

