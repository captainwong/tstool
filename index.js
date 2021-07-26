'use strict';


const { Command } = require('commander');
const program = new Command();

console.log(`${process.argv}`)

program
    .requiredOption('-f, --file <string>', 'ts file to be parsed')
    .option('-s, --src <string>', 'source language, can be language of ts file, or language of ts original(normally its source code language and its en)', 'en')
    .requiredOption('-d, --dst <string...>', 'destination languages');


program.parse();
const opts = program.opts();
console.log(`opts.file=${opts.file}, src=${opts.src}, dst=${opts.dst}`);
