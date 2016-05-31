#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const replace = require('..');

const usage = `
  $ ember-replace-extensions ember-file.js
`;

const filepath = process.argv[2];
if(!filepath) {
  return console.log(usage);
}

const source = fs.readFileSync(filepath, {encoding: 'utf8'});
const rewrite = replace.convert(source);
fs.writeFileSync(filepath, rewrite);

