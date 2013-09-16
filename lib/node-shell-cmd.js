(function() {
"use strict";

var fs = require('fs'),
    os = require('os'),
    exec = require('child_process').exec,
    xml2js = (function() {
        var xmldoc = require('xmldoc');
        
        return function(xml) {
            return new xmldoc.XmlDocument(xml);
        };
    })(),
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
        backslash: /\\/g
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

function execCommand(cmd, callback) {
    exec(cmd, function(err, stdout, stderr) {
        if (err !== null ||
            stderr.length > 0) {
            callback({
                err: err,
                code: err.code,
                signal: err.signal,
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
        requiresInput: true,
        cmd: {
            all: function(args, input, callback) {
                if (!Array.isArray(input)) {
                    callback('Not a valid input array', true);
                } else {
                    callback(input[0]);
                }
            }
        }
    };
    cmds['arr.last'] = {
        desc: 'Returns the last value in an array. If you are ' +
            'supplying the array on the command line, then it must be ' +
            'single-quoted and use JSON syntax',
        requiresInput: true,
        cmd: {
            all: function(args, input, callback) {
                if (!Array.isArray(input)) {
                    callback('Not a valid input array', false);
                } else {
                    callback(input[input.length - 1]);
                }
            }
        }
    };
    cmds['arr.length'] = {
        desc: 'Returns the length of an array. If you are ' +
            'supplying the array on the command line, then it must be ' +
            'single-quoted and use JSON syntax',
        requiresInput: true,
        cmd: {
            all: function(args, input, callback) {
                if (!Array.isArray(input)) {
                    callback('Not a valid input array', true);
                } else {
                    callback(input.length);
                }
            }
        }
    };
    cmds['disk.info'] = {
        desc: 'Gets detailed information for a particular disk.',
        requiresInput: true,
        cmd: {
            linux: function(args, input, callback) {
                cmds['is.blockDev'].cmd.all(null, input, function(isBlockDev) {
                    if (isBlockDev) {
                        // lsblk -l -b -d -o NAME,SIZE,STATE,PHY-SEC /dev/sda
                        // NAME         SIZE STATE   PHY-SEC
                        // sda  499558383616 running     512
                        // num sectors: blockdev --getsize /dev/sda (requires root)
                        execCommand('udevadm info -q property -n ' + input,
                            function(stdout) {
                                var obj = {};
                                stdout.split('\n').forEach(function(kv) {
                                    var pair = kv.split('=');
                                    
                                    switch (pair[0]) {
                                        case 'DEVNAME': obj.devName = pair[1]; break;
                                        case 'ID_VENDOR': obj.manf = pair[1]; break;
                                        case 'ID_MODEL': obj.model = pair[1]; break;
                                        case 'ID_PATH': obj.devID = '/dev/disk/by-path/' + pair[1]; break;
                                    }
                                });
                                
                                execCommand('lsblk -l -b -d -o SIZE,STATE,PHY-SEC ' + input,
                                    function(stdout) {
                                        var parms = stdout.split('\n')[1].split(' ').filter(function(parm) {
                                            return parm.length > 0;
                                        });
                                        
                                        obj.rawSizeInBytes = parseInt(parms[0], 10);
                                        
                                        if (parms[1] === 'running') {
                                            obj.status = 'online';
                                        } else {
                                            obj.status = 'offline';
                                        }
                                        
                                        obj.sectorSizeInBytes = parseInt(parms[2], 10);
                                        
                                        callback(obj);
                                    },
                                    function(err) {
                                        callback('Cannot execute disk.info command', true);
                                    });
                            },
                            function (err) {
                                callback('Cannot execute disk.info command', true);
                            });
                    } else {
                        callback('The device "' + input + '" is not ' +
                            'a block device', true);
                    }
                });
            },
            windows: function(args, input, callback) {
                execCommand('wmic diskdrive where DeviceID="' +
                    input.replace(regex.backslash, '\\\\') + '" list/format:value',
                    function(stdout) {
                        var obj = {};
                        stdout.replace(regex.windowsLinebreak, '').split('\n').filter(function(kv) {
                            return kv.length > 0;
                        }).forEach(function(kv) {
                            var pair = kv.split('=');
                            switch (pair[0]) {
                                case 'DeviceID': obj.devID = pair[1]; break;
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
                        
                        execCommand('wmic class Win32_LogicalDiskToPartition',
                            function(stdout) {
                                console.log(stdout);
                                console.dir(xml2js(stdout.replace(regex.windowsLinebreak, '')));
                                
                                callback(obj);
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
cmds['disks.all.devNames'] = {
    desc: 'Lists all disks (e.g. SAN, local hard disk, ' +
            'CD/DVD-ROM, USB, etc.). by their standrd device name.',
    requiresInput: false,
    cmd: {
        linux: function(args, input, callback) {
            execCommand('for disk in ' +
                    '$(ls /dev/disk/by-path/ | egrep -v part); do ' +
                    'udevadm info -q property -n /dev/disk/by-path/$disk | ' +
                    'awk -F= \'/^DEVNAME=/ {print $2}\'; done',
                function(stdout) {
                    callback(stdoutToArray(stdout));
                },
                function(err) {
                    callback('Cannot execute disks.all.devNames command', true);
                });
        },
        windows: function(args, input, callback) {
            execCommand('wmic logicaldisk get name',
                function(stdout) {
                    callback(stdoutToArray(stdout, [/^Name/]));
                },
                function(err) {
                    callback('Cannot execute disks.all.devNames command', true);
                });
        }
    }
};
cmds['disks.all.list'] = {
    desc: 'Lists all disks (e.g. SAN, local hard disk, ' +
            'CD/DVD-ROM, USB, etc.). by their device ID.',
    requiresInput: false,
    cmd: {
        linux: function(args, input, callback) {
            execCommand('for disk in ' +
                '$(ls /dev/disk/by-path/ | egrep -v part); do ' +
                'echo /dev/disk/by-path/$disk; done',
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
        requiresInput: true,
        cmd: {
            all: function (args, input, callback) {
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
        requiresInput: true,
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
        requiresInput: true,
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
    cmds['is.fifo'] = {
        desc: 'Determines if the provided input is a valid FIFO.',
        requiresInput: true,
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
        requiresInput: true,
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
    cmds['is.root'] = {
        desc: 'Determines if you are root.',
        requiresInput: false,
        cmd: {
            linux: function(args, input, callback) {
                callback(process.getuid() === 0);
            }
        }
    };
    cmds['is.socket'] = {
        desc: 'Determines if the provided input is a valid socket.',
        requiresInput: true,
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
        requiresInput: true,
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
})();