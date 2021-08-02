#!/usr/bin/env node
'use strict';
import meow from 'meow';
import cpy from 'cpy';

const cli = meow(`
	Usage
	  $ cpy <source …> <destination>

	Options
	  --no-overwrite       Don't overwrite the destination
	  --no-flat            Preserve path structure
	  --cwd=<dir>          Working directory for files
	  --rename=<filename>  Rename all <source> filenames to <filename>
	  --dot                Allow patterns to match entries that begin with a period (.)
	  --up                 Trim path from files being copied

	<source> can contain globs if quoted

	Examples
	  Copy all .png files in src folder into dist except src/goat.png
	  $ cpy 'src/*.png' '!src/goat.png' dist

	  Copy all .html files inside src folder into dist and preserve path structure
	  $ cpy '**/*.html' '../dist/' --cwd=src --no-flat
`, {
	importMeta: import.meta,
	flags: {
		overwrite: {
			type: 'boolean',
			default: true
		},
		flat: {
			type: 'boolean',
			default: true
		},
		cwd: {
			type: 'string',
			default: process.cwd()
		},
		rename: {
			type: 'string'
		},
		dot: {
			type: 'boolean',
			default: false
		},
		up: {
			type: 'number',
			default: 0
		}
	}
});

(async () => {
	try {
		await cpy(cli.input, cli.input.pop(), {
			cwd: cli.flags.cwd,
			rename: cli.flags.rename,
			flat: cli.flags.flat,
			overwrite: cli.flags.overwrite,
			dot: cli.flags.dot,
			up: cli.flags.up
		});
	} catch (error) {
		if (error.name === 'CpyError') {
			console.error(error.message);
			process.exit(1);
		} else {
			throw error;
		}
	}
})();

