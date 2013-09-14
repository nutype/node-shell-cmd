#!/usr/bin/env node
(function() {
    'use strict';
    
    var fs = require('fs'),
        os = require('os'),
        exec = require('child_process').exec,
        platform = (function() {
            switch (os.type()) {
                case 'Windows_NT': return 'windows';
                case 'Linux': return 'linux';
            }
        })(),
        regex = {
            cmdName: /^[a-z.]+$/,
            windowsLinebreak: /\r/g,
            trailingSpaces: /\s+\n/g,
            blankLine: /^\s*$/,
            leadingSpacesByPipe: /\s+_/,
            trailingSpacesByPipe: /_\s+/,
            backslash: /\\/g
        },
        cmds = {};
        