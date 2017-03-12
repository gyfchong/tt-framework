var path = require('path');

module.exports = {
	entry: './src/assets/js/script.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist/assets/js')
	},
	module: {
		rules: [{
				enforce: 'pre',
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'eslint-loader',
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					cacheDirectory: true,
					presets: ['es2015']
				}
			}
		]
	},
	devtool: 'source-map',
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 3000,
		watchContentBase: true,
		publicPath: '/assets/js/'
	}
};
