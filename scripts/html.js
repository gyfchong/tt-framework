const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const error = chalk.bold.red;
const success = chalk.green;
const notifier = require('node-notifier');
const ejs = require('ejs');
const cleaner = require('clean-html');

glob('src/views/*.ejs', {}, function (err, files) {
	files.forEach(function(file) {
		const fileName = path.basename(file).split('.')[0];
		ejs.renderFile(file, {names: ['foo', 'bar', 'baz']}, {
			root: path.join(__dirname, '../src/views/partials'),
		}, function(err, str) {
			if (err) {
				notifier.notify({
					title: 'HTML Error',
					message: err.message,
					sound: true,
					actions: 'Inspect'
				});
				console.log(error('------------'));
				console.log(error('File: ', err.path));
				console.log(error('Message: ', err.message));
				console.log(error('------------\n'));
			}

			cleaner.clean(str, function (html) {
				fs.writeFile('dist/' + fileName + '.html', html, function(err) {
					if (err) {
						return console.error(err);
					}

					console.log(success('dist/' + fileName + '.html was saved.\n'));
				});
			});
		});
	});
});
