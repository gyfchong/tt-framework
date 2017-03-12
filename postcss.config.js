module.exports = function(ctx) {
	return {
		map: ctx.options.map,
		plugins: [
			require('postcss-import')(),
			require('postcss-cssnext')(),
			require('postcss-custom-media')(),
			require('postcss-reporter')()
		]
	};
};
