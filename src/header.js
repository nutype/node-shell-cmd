(function() {
"use strict";

var fs = require('fs'),
    os = require('os'),
    exec = require('child_process').exec,
    platform = (function() {
        switch (os.type()) {
            case 'Windows_NT': return 'windows';
            case 'Linux': return 'linux';
        }
    })(),
    // platformProduct describes the generic product release of the OS
    // which for linux could be:
    // * redhat
    // * debian
    // ...and for windows could be:
    // * 8
    // * 7
    // * vista
    // * server
    platformProduct = '',
    // platformDist describes the major release of the product
    // which for linux could be:
    // * rhel6
    // * rhel5
    // ...and for windows
    // * professional
    // * enterprise
    // * home
    // * 2012
    // * 2008
    // * 2003
    platformDist = '',
    platform64bit = os.arch() === 'x64',
    regex = {
        cmdName: /^[a-z.]+$/,
        windowsLinebreak: /\r/g,
        trailingSpaces: /\s+\n/g,
        blankLine: /^\s*$/,
        backslash: /\\/g,
        lsblkDiskInfo: /^\s+SIZE\s+STATE\s+PHY-SEC/,
        windowsPhysDrive: /^\\\\\.\\PHYSICALDRIVE\d+$/,
        windowsDriveLetter: /^[A-Z]:$/,
        doubleQuote: /"/g,
        disk: /^disk/,
        cdrom: /^cd/,
        listQualifier: /^[a-z.]+$/,
        listQualifierDot: /\./g
    },
    cmds = {};
    