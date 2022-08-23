import path from 'node:path';
import fs from 'node:fs';
import test from 'ava';
import tempfile from 'tempfile';
import {execa} from 'execa';
import {pathExistsSync} from 'path-exists';

const read = (...arguments_) => fs.readFileSync(path.join(...arguments_), 'utf8');

test.beforeEach(t => {
	t.context.tmp = tempfile();
});

test('missing file operands', async t => {
	await t.throwsAsync(execa('./cli.js'), {message: /`source` and `destination` required/});
});

test('source file does not exist', async t => {
	await t.throwsAsync(execa('./cli.js', [path.join(t.context.tmp, 'nonexistentfile'), t.context.tmp]), {message: /nonexistentfile/});
});

test('cwd', async t => {
	fs.mkdirSync(t.context.tmp);
	fs.mkdirSync(path.join(t.context.tmp, 'cwd'));
	fs.writeFileSync(path.join(t.context.tmp, 'cwd/hello.js'), 'console.log("hello");');

	await execa('./cli.js', ['hello.js', 'dest', '--cwd', path.join(t.context.tmp, 'cwd')]);

	t.is(read(t.context.tmp, 'cwd/hello.js'), read(t.context.tmp, 'cwd/dest/hello.js'));
});

test('path structure', async t => {
	fs.mkdirSync(t.context.tmp);
	fs.mkdirSync(path.join(t.context.tmp, 'cwd'));
	fs.mkdirSync(path.join(t.context.tmp, 'out'));
	fs.writeFileSync(path.join(t.context.tmp, 'cwd/hello.js'), 'console.log("hello");');

	await execa('./cli.js', [path.join(t.context.tmp, '**'), path.join(t.context.tmp, 'out')]);

	t.is(
		read(t.context.tmp, 'cwd/hello.js'),
		read(t.context.tmp, 'out/cwd/hello.js'),
	);
});

test('rename filenames but not filepaths', async t => {
	fs.mkdirSync(t.context.tmp);
	fs.mkdirSync(path.join(t.context.tmp, 'dest'));
	fs.writeFileSync(path.join(t.context.tmp, 'hello.js'), 'console.log("hello");');

	await execa('./cli.js', [path.join(t.context.tmp, 'hello.js'), path.join(t.context.tmp, 'dest'), '--rename=hi.js']);

	t.is(read(t.context.tmp, 'hello.js'), read(t.context.tmp, 'dest/hi.js'));

	await execa('./cli.js', [path.join(t.context.tmp, 'hello.js'), path.join(t.context.tmp, 'dest'), '--rename=hi-{{basename}}-1']);
	t.is(read(t.context.tmp, 'hello.js'), read(t.context.tmp, 'dest/hi-hello-1.js'));
});

test('overwrite files by default', async t => {
	fs.mkdirSync(t.context.tmp);
	fs.mkdirSync(path.join(t.context.tmp, 'dest'));
	fs.writeFileSync(path.join(t.context.tmp, 'hello.js'), 'console.log("hello");');
	fs.writeFileSync(path.join(t.context.tmp, 'dest/hello.js'), 'console.log("world");');

	await execa('./cli.js', [path.join(t.context.tmp, 'hello.js'), path.join(t.context.tmp, 'dest')]);

	t.is(read(t.context.tmp, 'dest/hello.js'), 'console.log("hello");');
});

test('do not copy files in the negated glob patterns', async t => {
	fs.mkdirSync(t.context.tmp);
	fs.mkdirSync(path.join(t.context.tmp, 'src'));
	fs.mkdirSync(path.join(t.context.tmp, 'dest'));
	fs.writeFileSync(path.join(t.context.tmp, 'src/hello.js'), 'console.log("hello");');
	fs.writeFileSync(path.join(t.context.tmp, 'src/hello.jsx'), 'console.log("world");');
	fs.writeFileSync(path.join(t.context.tmp, 'src/hello.es2015'), 'console.log("world");');

	await execa('./cli.js', ['src/*.*', '!src/*.jsx', '!src/*.es2015', path.join(t.context.tmp, 'dest'), '--cwd', t.context.tmp]);

	t.is(read(t.context.tmp, 'dest/hello.js'), 'console.log("hello");');
	t.false(pathExistsSync(path.join(t.context.tmp, 'dest/hello.jsx')));
	t.false(pathExistsSync(path.join(t.context.tmp, 'dest/hello.es2015')));
});

test('flatten directory tree', async t => {
	fs.mkdirSync(t.context.tmp);
	fs.mkdirSync(path.join(t.context.tmp, 'source'));
	fs.mkdirSync(path.join(t.context.tmp, 'source', 'nested'));
	fs.writeFileSync(path.join(t.context.tmp, 'foo.js'), 'console.log("foo");');
	fs.writeFileSync(path.join(t.context.tmp, 'source/bar.js'), 'console.log("bar");');
	fs.writeFileSync(path.join(t.context.tmp, 'source/nested/baz.ts'), 'console.log("baz");');

	await execa('./cli.js', ['**/*.js', 'destination/subdir', '--cwd', t.context.tmp, '--flat']);

	t.is(
		read(t.context.tmp, 'foo.js'),
		read(t.context.tmp, 'destination/subdir/foo.js'),
	);
	t.is(
		read(t.context.tmp, 'source/bar.js'),
		read(t.context.tmp, 'destination/subdir/bar.js'),
	);
	t.falsy(
		fs.existsSync(path.join(t.context.tmp, 'destination/subdir/baz.ts')),
	);
});
