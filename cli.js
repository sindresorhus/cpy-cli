#!/usr/bin/env node
'use strict';
const meow = require('meow');
const fn = require('cpy');

const cli = meow(`
	Usage
	  $ cpy <source>... <destination>

	Options
	  --no-overwrite       Don't overwrite the destination
	  --parents            Preserve path structure
	  --cwd=<dir>          Working directory for files
	  --rename=<filename>  Rename all <source> filenames to <filename>
	  --no-dir             Do not match directories

	<source> can contain globs if quoted

	Examples
	  Copy all .png files in src folder into dist except src/goat.png
	  $ cpy 'src/*.png' '!src/goat.png' dist

	  Copy all .html files inside src folder into dist and preserve path structure
	  $ cpy '**/*.html' '../dist/' --cwd=src --parents --no-dir
`, {
	string: ['_']
});

fn(cli.input, cli.input.pop(), {
	cwd: cli.flags.cwd || process.cwd(),
	rename: cli.flags.rename,
	parents: cli.flags.parents,
	overwrite: cli.flags.overwrite !== false,
	nonull: true,
	nodir: cli.flags.noDir !== false
}).catch(err => {
	if (err.name === 'CpyError') {
		console.error(err.message);
		process.exit(1);
	} else {
		throw err;
	}
});
