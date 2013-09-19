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
        listQualifier: /^[a-z\.]+$/,
        listQualifierDot: /\./g
    },
    cmds = {};
    
function bugOut(msg) {
    console.error(msg);
    console.trace();
    process.exit(1);
}

function validCommand(cmd) {
    return typeof cmd === 'string' &&
        cmds.hasOwnProperty(cmd);
}

function validWindowsDisk(disk) {
    return !regex.windowsPhysDrive.test(input);
}

function validInput(cmd, input, callback) {
    switch (cmds[cmd].input.type) {
        case 'string': callback(typeof input === 'string'); break;
        case 'array': callback(Array.isArray(input)); break;
        case 'object': callback(typeof input === 'object'); break;
        case 'number': callback(typeof input === 'number'); break;
        case 'boolean': callback(typeof input === 'boolean'); break;
        case 'blockDev':
            cmds['is.blockDev'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'disk':
            cmds['is.disk'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'opticalDrive':
            cmds['is.opticalDrive'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'file':
            cmds['is.file'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'dir':
            cmds['is.dir'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        default: callback(false);
    }
}

function validArgument(cmd, argName, input, callback) {
    var argObj;
    if (typeof argName === 'string') {
        argObj = cmds[cmd].args[argName];
    } else {
        argObj = cmds[cmd].arg;
    }
    
    switch (argObj.type) {
        case 'string':
            setTimeout(function() {
                callback(typeof input === 'string');
            }, 0);
            break;
        case 'array': 
            setTimeout(function() {
                callback(Array.isArray(input));
            }, 0);
            break;
        case 'number':
            setTimeout(function() {
                callback(typeof input === 'number');
            }, 0);
            break;
        case 'boolean':
            setTimeout(function() {
                callback(typeof input === 'boolean');
            }, 0);
            break;
        case 'blockDev':
            cmds['is.blockDev'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'disk':
            cmds['is.disk'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'opticalDrive':
            cmds['is.opticalDrive'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'file':
            cmds['is.file'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        case 'dir':
            cmds['is.dir'].cmd[platform](null, input, function(result, err) {
                if (!err) {
                    callback(result);
                } else {
                    callback(false);
                }
            });
            break;
        default: callback(false);
    }
}

function execCommand(cmd, callback, callbackError) {
    exec(cmd, function(err, stdout, stderr) {
        if (err !== null) {
            callbackError({
                err: err,
                code: err.code,
                signal: err.signal,
                stderr: stderr
            });
        } else if (stderr.length > 0) {
            callbackError({
                err: null,
                code: 1,
                signal: 'SIGTERM',
                stderr: stderr
            });
        } else {
            callback(stdout);
        }
    });
}

function stdoutToArray(stdout, filters) {
    filters = (Array.isArray(filters) ? filters : []);
    
    return stdout.replace(regex.windowsLinebreak, '')
                 .replace(regex.trailingSpaces, '\n')
                 .split('\n')
                 .filter(function(line) {
                    return !regex.blankLine.test(line) &&
                        !filters.some(function(f) {
                            return f.test(line);
                        });
                 });
}

exports.callCmd = function callCmd(cmdName, args, input, callback) {
    if (!validCommand(cmdName)) {
        bugOut('Invalid command name called "' + cmdName + '"');
    } else if (!cmds[cmdName].cmd.hasOwnProperty(platform)) {
        bugOut('Cannot execute command "' + cmdName + '" on the "' +
            platform + '" platform');
    } else if (cmds[cmdName].requiresInput &&
        typeof input === 'undefined') {
        bugOut('Command "' + cmdName + '" requires input');
    } else if (arguments.length === 2) {
        if (typeof args !== 'function') {
            bugOut('Callback function is required');
        } else {
            cmds[cmdName].cmd[platform](null, null, args);
        }
    } else if (typeof callback !== 'function') {
        bugOut('Callback function is required');
    } else {
        cmds[cmdName].cmd[platform](args, input, callback);
    }
};

cmds['arr.first'] = {
    desc: 'Returns the first value in an array. If you are ' +
        'supplying the array on the command line, then it must be ' +
        'single-quoted and use JSON syntax',
    input: {
        type: 'array',
        desc: 'The input array'
    },
    cmd: {
        all: function(args, input, callback) {
            callback(input[0]);
        }
    }
};
cmds['arr.last'] = {
    desc: 'Returns the last value in an array. If you are ' +
        'supplying the array on the command line, then it must be ' +
        'single-quoted and use JSON syntax',
    input: {
        type: 'array',
        desc: 'The input array'
    },
    cmd: {
        all: function(args, input, callback) {
            callback(input[input.length - 1]);
        }
    }
};
cmds['arr.length'] = {
    desc: 'Returns the length of an array. If you are ' +
        'supplying the array on the command line, then it must be ' +
        'single-quoted and use JSON syntax',
    input: {
        type: 'array',
        desc: 'The input array'
    },
    cmd: {
        all: function(args, input, callback) {
            callback(input.length);
        }
    }
};
cmds['disk.info'] = {
    desc: 'Gets detailed information for a particular disk.',
    input: {
        type: 'disk',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            execCommand('udevadm info -q property -n ' + input + ' && ' +
                'lsblk -l -b -d -o SIZE,STATE,PHY-SEC ' + input,
                function(stdout) {
                    var obj = {};
                    stdout.split('\n').forEach(function(kv, idx, arr) {
                        var pair = kv.split('=');
                        
                        switch (pair[0]) {
                            case 'DEVNAME': obj.devName = pair[1]; break;
                            case 'ID_VENDOR': obj.manf = pair[1]; break;
                            case 'ID_MODEL': obj.model = pair[1]; break;
                            case 'ID_PATH': obj.devID = '/dev/disk/by-path/' + pair[1]; break;
                        }
                        
                        if (regex.lsblkDiskInfo.test(kv)) {
                            var lsblk = arr[idx + 1].split(' ').filter(function(result) {
                                return result.length > 0;
                            });
                            
                            obj.rawSizeInBytes = parseInt(lsblk[0], 10);
                            
                            if (lsblk[1] === 'running') {
                                obj.status = 'online';
                            } else {
                                obj.status = 'offline';
                            }
                            
                            obj.sectorSizeInBytes = parseInt(lsblk[2], 10);
                        }
                    });
                    
                    callback(obj);
                },
                function (err) {
                    callback('Cannot execute disk.info command', true);
                });
        },
        windows: function(args, input, callback) {
            execCommand('wmic diskdrive where DeviceID="' +
                input.replace(regex.backslash, '\\\\') + '" list/format:value',
                function(stdout) {
                    var obj = {};

                    stdout.replace(regex.windowsLinebreak, '').split('\n')
                        .filter(function(kv) {
                            return kv.length > 0;
                        }).forEach(function(kv) {
                            var pair = kv.split('=');
                            switch (pair[0]) {
                                case 'DeviceID':
                                    obj.devID = pair[1];
                                    obj.devName = pair[1];
                                    break;
                                case 'Manufacturer': obj.manf = pair[1]; break;
                                case 'Model': obj.model = pair[1]; break;
                                case 'BytesPerSector': obj.sectorSizeInBytes = parseInt(pair[1], 10); break;
                                case 'Status':
                                    if (pair[1] === 'OK') {
                                        obj.status = 'online';
                                    } else {
                                        obj.status = 'offline';
                                    }
                                    break;
                                case 'Size': obj.rawSizeInBytes = parseInt(pair[1], 10); break;
                            }
                        });
                    
                    execCommand('wmic path win32_diskdrivetodiskpartition get /format:value',
                        function(stdout) {
                            // use the info gained from the output to get
                            // basic info on the partitions
                            obj.partitions = [];
                            
                            stdoutToArray(stdout).some(function(str, idx, arr) {
                                var parts = str.split('=');
                                if (parts[0] === 'Antecedent' &&
                                    '"' + input + '""' === parts[2]) {
                                    obj.partitions.push({
                                        dev: arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '')
                                    });
                                }
                            });
                            
                            var execCmds = 0,
                                execFinished = 0;
                                
                            obj.partitions.forEach(function(part, idx) {
                                execCmds++;
                                execCommand('wmic partition where (DeviceID = "' +
                                    part.dev + '") list/format:value',
                                    function(stdout) {
                                        stdoutToArray(stdout).forEach(function(kv) {
                                            var pair = kv.split('=');
                                            
                                            switch (pair[0]) {
                                                case 'BlockSize':
                                                    part.blockSize = parseInt(pair[1], 10); break;
                                                case 'BootPartition':
                                                    if (pair[1] === 'TRUE') {
                                                        part.boot = true;
                                                    } else {
                                                        part.boot = false;
                                                    }
                                                    break;
                                                case 'NumberOfBlocks':
                                                    part.blocks = parseInt(pair[1], 10); break;
                                                case 'Size':
                                                    part.rawSizeInBytes = parseInt(pair[1], 10); break;
                                            }
                                        });
                                        
                                        execFinished++;
                                        
                                        if (execCmds === execFinished) {
                                            callback(obj);
                                        }
                                    }, function(err) {
                                        callback('Cannot gather partition information', true);
                                    });
                                    
                                
                            });
                            
                            execCmds++;
                            execCommand('wmic path win32_logicaldisktopartition get /format:value',
                                function(stdout) {
                                    stdoutToArray(stdout).forEach(function(str, idx, arr) {
                                        var parts = str.split('=');
                                        
                                        if (parts[0] === 'Antecedent') {
                                            var dev = parts[2].replace(regex.doubleQuote, ''),
                                                mount = arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '');
                                            
                                            obj.partitions.some(function(part, i) {
                                                if (part.dev === dev) {
                                                    obj.partitions[i].mount = mount;
                                                    
                                                    execCmds++;
                                                    execCommand('wmic logicaldisk where DeviceID="' + mount + '" list/format:value',
                                                            function(stdout) {
                                                                
                                                                stdoutToArray(stdout).forEach(function(kv) {
                                                                    var pair = kv.split('=');
                                                                    
                                                                    switch (pair[0]) {
                                                                        case 'FileSystem':
                                                                            part.fs = pair[1]; break;
                                                                        case 'FreeSpace':
                                                                            part.freeSpaceInBytes = parseInt(pair[1], 10); break;
                                                                    }
                                                                });
                                                                
                                                                execFinished++;
                                                                if (execCmds === execFinished) {
                                                                    callback(obj);
                                                                }
                                                            },
                                                            function(err) {
                                                                callback('Cannot gather logicaldisk information', true);
                                                            });
                                                        
                                                            return true;
                                                        }
                                                    });
                                        }
                                    });
                                    
                                    execFinished++;
                                    if (execCmds === execFinished) {
                                        callback(obj);
                                    }
                                },
                                function(err) {
                                    callback('Cannot gather partition information', true);
                                });
                        },
                        function(err) {
                            callback('Cannot execute disk.info command', true);
                        });
                }, function(err) {
                    callback('Cannot execute disk.info command', true);
                });
        }
    }
};
cmds['disks.all.list'] = {
    desc: 'Lists all disks (e.g. SAN, local hard disk, ' +
            'USB, etc.). by their device ID.\n' +
            'On Linux, this would be something like /dev/disk/by-path/...\n' +
            'On Windows, this is the DISKDRIVE device ID.\n\n' +
            'Use cdrom.list to get the device IDs for all attached ' +
            'CD/DVD-ROM devices.',
    cmd: {
        linux: function(args, input, callback) {
            execCommand('for disk in ' +
                '$(ls /dev/disk/by-path/ | egrep -v part); do ' +
                'if ! udevadm info -q property -n ' +
                '/dev/disk/by-path/$disk | egrep -q \'^ID_CDROM=1$\'; ' +
                'then echo /dev/disk/by-path/$disk; fi; done',
                function(stdout) {
                    callback(stdoutToArray(stdout));
                },
                function(err) {
                    callback('Cannot execute disks.all.list command', true);
                });
        },
        windows: function(args, input, callback) {
            execCommand('wmic diskdrive get deviceid',
                function(stdout) {
                    callback(stdoutToArray(stdout, [/^DeviceID/]));
                },
                function(err) {
                    callback('Cannot execute disks.all.list command', true);
                });
        }
    }
};
cmds['is.blockDev'] = {
    desc: 'Determines if the provided input is a valid block device.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux'
    },
    cmd: {
        linux: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isBlockDevice());
                }
            });
        }
    }
};
cmds['is.charDev'] = {
    desc: 'Determines if the provided input is a valid character device.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isCharacterDevice());
                }
            });
        }
    }
};
cmds['is.dir'] = {
    desc: 'Determines if the provided input is a valid directory',
    input: {
        type: 'string',
        desc: 'The absolute or relative path to a directory'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isDirectory());
                }
            });
        }
    }
};
cmds['is.disk'] = {
    desc: 'Determines if the provided input is a valid physical disk. ' +
        'This excludes CD/DVD-ROM drives.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            cmds['is.blockDev'].cmd.linux(args, input, function(isBlockDev) {
                if (isBlockDev) {
                    execCommand('udevadm info -q property -n ' + input +
                        ' | egrep ID_TYPE | awk -F= \'{print $2}\'',
                        function(stdout) {
                            callback(regex.disk.test(stdout));
                        },
                        function(err) {
                            callback(false);
                        });
                } else {
                    callback(false);
                }
            });
        },
        windows: function(args, input, callback) {
            if (regex.windowsPhysDrive.test(input)) {
                execCommand('wmic diskdrive where DeviceID="' +
                    input.replace(regex.backslash, '\\\\') + '"',
                    function(stdout) {
                        callback(true);
                    },
                    function(err) {
                        callback(false);
                    });
            } else {
                callback(false);
            }
        }
    }
};
cmds['is.fifo'] = {
    desc: 'Determines if the provided input is a valid FIFO.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isFIFO());
                }
            });
        }
    }
};
cmds['is.file'] = {
    desc: 'Determines if the provided input is a valid regular file.',
    input: {
        type: 'string',
        desc: 'The absolute or relative path to a regular file'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isFile());
                }
            });
        }
    }
};
cmds['is.opticalDrive'] = {
    desc: 'Determines if the provided input is a valid CD/DVD-ROM drive.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux or a drive letter in Windows (typically "D:")'
    },
    cmd: {
        linux: function(args, input, callback) {
            cmds['is.blockDev'].cmd.linux(args, input, function(isBlockDev) {
                if (isBlockDev) {
                    execCommand('udevadm info -q property -n ' + input +
                        ' | egrep ID_TYPE | awk -F= \'{print $2}\'',
                        function(stdout) {
                            callback(regex.cdrom.test(stdout));
                        },
                        function(err) {
                            callback(false);
                        });
                } else {
                    callback(false);
                }
            });
        },
        windows: function(args, input, callback) {
            if (regex.windowsDriveLetter.test(input)) {
                execCommand('wmic cdrom where Drive="' + input + '"',
                    function(stdout) {
                        callback(true);
                    },
                    function(err) {
                        callback(false);
                    });
            } else {
                callback(false);
            }
        }
    }
};
cmds['is.root'] = {
    desc: 'Determines if you are root.',
    cmd: {
        linux: function(args, input, callback) {
            callback(process.getuid() === 0);
        }
    }
};
cmds['is.socket'] = {
    desc: 'Determines if the provided input is a valid socket.',
    input: {
        type: 'string',
        desc: 'The socket path'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isSocket());
                }
            });
        }
    }
};
cmds['is.symlink'] = {
    desc: 'Determines if the provided input is a valid symbolic link.',
    input: {
        type: 'string',
        desc: 'The absolute or relative path to a symlink'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.lstat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isSymbolicLink());
                }
            });
        }
    }
};
cmds['obj.prop'] = {
    desc: 'Returns the value for a particular property inside an object.  You need to provide a property name as a JSON string like so: \'"propertyName"\'.',
    input: {
        type: 'object',
        desc: 'The input data can be any valid object'
    },
    arg: {
        type: 'string',
        desc: 'The property inside the input data object to retrieve the ' +
            'value of',
        required: true
    },
    cmd: {
        all: function(args, input, callback) {
            callback(input[args]);
        }
    }
};
// determine the platformProduct and platformDist variables
switch (platform) {
    case 'windows':
        execCommand('wmic path win32_operatingsystem get /format:value',
            function(stdout) {
                stdoutToArray(stdout).forEach(function(kv) {
                    var pair = kv.split('=');
                    if (pair[0] === 'Caption') {
                        if (/\s8\s/.test(pair[1])) {
                            platformProduct = '8';
                        } else if (/\s7\s/.test(pair[1])) {
                            platformProduct = '7';
                        } else if (/\s[Vv]ista\s/.test(pair[1])) {
                            platformProduct = 'vista';
                        } else if (/\s[Ss]erver\s/.test(pair[1])) {
                            platformProduct = 'server';
                        }
                        
                        if (/\s[Pp]rofessional/.test(pair[1])) {
                            platformDist = 'professional';
                        } else if (/\s[Hh]ome/.test(pair[1])) {
                            platformDist = 'home';
                        } else if (/\s[Ee]nterprise/.test(pair[1])) {
                            platformDist = 'enterprise';
                        } else if (/\s2012/.test(pair[1])) {
                            platformDist = '2012';
                        } else if (/\s2008/.test(pair[1])) {
                            platformDist = '2008';
                        } else if (/\s2003/.test(pair[1])) {
                            platformDist = '2003';
                        }
                    }
                });
                
                platformInfoReady();
            },
            function(err) {
                bugOut('Cannot call wmic to determine Windows platform info.');
            });
        break;
    case 'linux':
        execCommand('cat /etc/redhat-release', // start with red hat
            function(stdout) {
                platformProduct = 'redhat';
                
                if (/\srelease\s+6/.test(stdout)) {
                    platformDist = 'rhel6';
                } else if (/\srelease\s+5/.test(stdout)) {
                    platformDist = 'rhel5';
                }
                
                platformInfoReady();
            },
            function(err) { // try debian
                execCommand('cat /etc/debian_version',
                    function(stdout) {
                        platformProduct = 'debian';
                        
                        // todo: deal with debian releases
                        
                        platformInfoReady();
                    },
                    function(err) {
                        bugOut('Cannot determine Linux platform info.');
                    });
            });
        break;
}

})();