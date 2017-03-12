const fs = require('fs');
const chalk = require('chalk');
const error = chalk.bold.red;
const success = chalk.green;
const notifier = require('node-notifier');
const sass = require('node-sass');
const neat = require('bourbon-neat').includePaths;
const sassGlob = require('node-sass-glob-importer')();

let options = {
	outputStyle: 'compressed',
	sourceMapContents: false,
	sourceMapEmbed: false
};

if (process.argv[2] === 'dev') {
	options.outputStyle = 'nested';
	options.sourceMapContents = true;
	options.sourceMapEmbed = true;
}

sass.render({
	file: 'src/assets/css/style.scss',
	includePaths: [
		neat
	],
	importer: sassGlob,
	outputStyle: options.outputStyle,
	sourceMapContents: options.sourceMapContents,
	sourceMapEmbed: options.sourceMapEmbed
}, (err, result) => {
	if (err) {
		notifier.notify({
			title: 'CSS Error',
			message: err.message,
			sound: true,
			actions: 'Inspect'
		});
		console.log(error('------------'));
		console.log(error('File: ', `${err.file}:${err.line}`));
		console.log(error('Message: ', err.message));
		console.log(error('------------\n'));
	} else {
		fs.writeFile('dist/assets/css/style.css', result.css, err => {
			if (err) {
				return console.error(err);
			}

			console.log(success('dist/assets/css/style.css was saved.\n'));
		});
	}
});
