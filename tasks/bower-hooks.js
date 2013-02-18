'use strict';
module.exports = function (grunt) {
	var _ = require('lodash');
	
	/** Wire up r.js **/
	var requirejs = require('requirejs');
	
	requirejs.config({
		baseUrl: require('path').resolve(__dirname,'../rjs'),
		nodeRequire: require
	});
	
	var transform = requirejs('transform');
	/** End r.js wiring **/

	grunt.registerMultiTask('bower', 'Wire-up Bower components in RJS config', function () {
		var cb = this.async();
		var filePath = this.data.rjsConfig;
		var file = grunt.file.read(filePath);
		require('bower').commands.list({paths: true})
			.on('data', function (data) {
				var rjsConfig;

				if (data) {
					// remove extension from JS files
					data = _.forOwn(data, function (val, key, obj) {
						obj[key] = grunt.file.isDir(val) ? val : val.replace(/\.js$/, '');
					});

					rjsConfig = transform.modifyConfig(file, function(config) {
						_.extend(config.paths, data);
						return config;
					});
					
					grunt.file.write(filePath, rjsConfig);
					grunt.log.writeln('Updated RequireJS config with installed Bower components'.green);
					cb();
				}
			})
			.on('error', function (err) {
				grunt.warn(err.message);
				cb();
			});
	});
};
