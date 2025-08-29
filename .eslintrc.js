/* eslint-env node */
/* global module */
module.exports = {
	root: false, // use eslint.config.mjs for project-wide; this file augments for Node scripts
	env: {
	node: true,
	commonjs: true,
		es2022: true,
	},
	overrides: [
		{
			files: ["scripts/**/*.js", "server.js"],
			env: { node: true },
			rules: {
				"no-console": "off"
			}
		}
	]
};

