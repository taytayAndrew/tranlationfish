#!/usr/bin/env node
//一定要写sheban
import * as commander from 'commander';
import { translate } from './main';

const program = new commander.Command();

program
    .version('0.0.2')
    .name('fish')
    .usage('<English>')
    .arguments('<English>')
    .action(function (english) {
        translate(english)
    });


program.parse(process.argv);