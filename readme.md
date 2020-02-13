# cpy-cli [![Build Status](https://travis-ci.org/sindresorhus/cpy-cli.svg?branch=master)](https://travis-ci.org/sindresorhus/cpy-cli)

> Copy files

## Why

- Fast by using streams.
- Resilient by using [graceful-fs](https://github.com/isaacs/node-graceful-fs).
- User-friendly by accepting [globs](https://github.com/sindresorhus/globby#globbing-patterns) and creating non-existant destination directories.
- User-friendly error messages.

## Install

```
$ npm install --global cpy-cli
```

## Usage

```
$ cpy --help

  Usage
    $ cpy <source …> <destination>

  Options
    --no-overwrite       Don't overwrite the destination
    --parents            Preserve path structure
    --cwd=<dir>          Working directory for files
    --rename=<filename>  Rename all <source> filenames to <filename>
    --dot                Allow patterns to match entries that begin with a period (.)

  <source> can contain globs if quoted

  Examples
    Copy all .png files in src folder into dist except src/goat.png
    $ cpy 'src/*.png' '!src/goat.png' dist

    Copy all .html files inside src folder into dist and preserve path structure
    $ cpy '**/*.html' '../dist/' --cwd=src --parents
```

## Related

- [cpy](https://github.com/sindresorhus/cpy) - API for this module
