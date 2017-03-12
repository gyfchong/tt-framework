const chalk = require('chalk');
const error = chalk.bold.red;
const success = chalk.green;
const notifier = require('node-notifier');

module.exports = function(results) {
	results = results || [];

	const summary = results.reduce((seq, current) => {

		current.messages.forEach(msg => {
			const logMessage = {
				filePath: current.filePath,
				ruleId: msg.ruleId,
				message: msg.message,
				line: msg.line,
				column: msg.column,
				source: msg.source
			};

			if (msg.severity === 1) {
				logMessage.type = 'warning';
				seq.warnings.push(logMessage);
			}
			if (msg.severity === 2) {
				logMessage.type = 'error';
				seq.errors.push(logMessage);
			}
		});
		return seq;
	}, {
		errors: [],
		warnings: []
	});

	if (summary.errors.length > 0 || summary.warnings.length > 0) {

		summary.errors.concat(summary.warnings).map(err => {
			notifier.notify({
				title: 'JS Error',
				message: err.message,
				sound: true,
				actions: 'Inspect'
			});

			console.log(error('ERROR!'));
			console.log(error('------------'));
			console.log(error('File: ', `${err.filePath}:${err.line}:${err.column}`));
			console.log(error('Message: ', err.message));
			console.log(error('------------\n'));
		});
	} else {
		console.log(success('src/assets/js/script.js was saved.\n'));
	}
};
