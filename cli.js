#!/usr/bin/env node
import process from 'node:process';
import os from 'node:os';
import meow from 'meow';
import cpy from 'cpy';

const cli = meow(`
	Usage
	  $ cpy <source …> <destination>

	Options
	  --no-overwrite       Don't overwrite the destination
	  --cwd=<dir>          Working directory for files
	  --rename=<filename>  Rename all <source> filenames to <filename>
	  --dot                Allow patterns to match entries that begin with a period (.)
	  --flat               Flatten directory structure. All copied files will be put in the same directory.
	  --concurrency        Number of files being copied concurrently

	<source> can contain globs if quoted

	Examples
	  Copy all .png files in src folder into dist except src/goat.png
	  $ cpy 'src/*.png' '!src/goat.png' dist

	  Copy all files inside src folder into dist and preserve path structure
	  $ cpy . '../dist/' --cwd=src
`, {
	importMeta: import.meta,
	flags: {
		overwrite: {
			type: 'boolean',
			default: true,
		},
		cwd: {
			type: 'string',
			default: process.cwd(),
		},
		rename: {
			type: 'string',
		},
		dot: {
			type: 'boolean',
			default: false,
		},
		flat: {
			type: 'boolean',
			default: false,
		},
		concurrency: {
			type: 'number',
			default: (os.cpus().length > 0 ? os.cpus().length : 1) * 2,
		},
	},
});

(async () => {
	try {
		await cpy(cli.input, cli.input.pop(), {
			cwd: cli.flags.cwd,
			rename: cli.flags.rename,
			overwrite: cli.flags.overwrite,
			dot: cli.flags.dot,
			flat: cli.flags.flat,
			concurrency: cli.flags.concurrency,
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
