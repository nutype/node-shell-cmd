(function() {
"use strict";

var fs = require('fs'),
    os = require('os'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
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
        singleQuote: /'/g,
        disk: /^disk/,
        cdrom: /^cd/,
        listQualifier: /^[a-z.]+$/,
        listQualifierDot: /\./g,
        luks: /^luks-/,
        luns: /-lun-/,
        whitespace: /\s+/g,
        specialDelim: /#@%/g
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
        case 'string': setTimeout(function() {
            callback(typeof input === 'string');},0);
            break;
        case 'array': setTimeout(function() {
            callback(Array.isArray(input));}, 0);
            break;
        case 'object': setTimeout(function() {
            callback(typeof input === 'object');}, 0);
            break;
        case 'number': setTimeout(function() {
            callback(typeof input === 'number');}, 0);
            break;
        case 'boolean': setTimeout(function() {
            callback(typeof input === 'boolean');}, 0);
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
                callback(typeof input === 'string');}, 0);
            break;
        case 'array': 
            setTimeout(function() {
                callback(Array.isArray(input));}, 0);
            break;
        case 'number':
            setTimeout(function() {
                callback(typeof input === 'number');}, 0);
            break;
        case 'boolean':
            setTimeout(function() {
                callback(typeof input === 'boolean');}, 0);
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

function execDialogCmd(cmdArgs, callback, callbackError) {
    var dialog = spawn('dialog',
        ['--ascii-lines','--stderr'].concat(cmdArgs),
        {stdio: ['ignore', process.stdout, 'pipe']}),
        result; 
    
    dialog.stderr.setEncoding('utf8');
    dialog.stderr.on('data', function(data) {
        result = data;
    });
    
    dialog.on('error', function(err) {
        callbackError(err);
    });
    
    dialog.on('close', function(code) {
        callback(code, result);
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

function tokenize(str) {
    return str.split(' ').filter(function(token) {
        return token.length > 0;
    });
}

function verifyObject(obj, input) {
    return !Object.keys(obj).some(function(prop) {
        if (!input.hasOwnProperty(prop)) {
            return true;
        } else {
            switch (obj[prop]) {
                case 'number': return typeof input[prop] !== 'number';
                case 'object': return typeof input[prop] !== 'object';
                case 'array': return !Array.isArray(input[prop]);
                case 'string': return typeof input[prop] !== 'string';
                case 'boolean': return typeof input[prop] !== 'boolean';
            }
        }
    });
}

// contains all callCMd calls before the platform info is ready
var unprocessedCalls = [],
    platformInfoIsReady = false;
    
function checkInput(cmdName, args, input, callback) {
    validInput(cmdName, input, function(isValid) {
        if (!isValid) {
            callback('Invalid input type for command "' + cmdName + '"', true);
        } else if (!!cmds[cmdName].arg) {
            checkArg(cmdName, args, input, callback);
        } else if (!!cmds[cmdName].args) {
            checkArgs(cmdName, args, input, callback);
        } else if (!!cmds[cmdName].cmd.all) {
            cmds[cmdName].cmd.all(args, input, callback);
        } else {
            cmds[cmdName].cmd[platform](args, input, callback);
        }
    });
}

function checkArg(cmdName, arg, input, callback) {
    validArgument(cmdName, null, arg, function(isValid) {
        if (!isValid) {
            callback('Invalid single argument input for command "' +
                cmdName + '"', true);
        } else if (!!cmds[cmdName].cmd.all) {
            cmds[cmdName].cmd.all(args, input, callback);
        } else {
            cmds[cmdName].cmd[platform](args, input, callback);
        }
    });
}

function checkArgs(cmdName, args, input, callback) {
    if (typeof args !== 'object') {
        callback('Invalid argument object for command "' + cmdName + '"', true);
    } else {
        // see if missing required argument
        if (Object.keys(cmds[cmdName].args).some(function(arg) {
            if (cmds[cmdName][arg].required &&
                typeof args[arg] === 'undefined') {
                callback('Missing required argument "' + arg + '" for command "' +
                    cmdName + '"', true);
                return true;
            }
        })) { return; }
        
        // verify input args are of the correct types
        var calls = 0, called = false;
        Object.keys(args).forEach(function(arg) {
            calls++;
            validArgument(cmdName, arg, args[arg], function(isValid) {
                calls--;
                if (!isValid && !called) {
                    called = true;
                    callback('Invalid argument value specified for argument "' +
                        arg + '" for command "' + cmdName + '"', true);
                } else if (calls === 0) {
                    if (!!cmds[cmdName].call.all) {
                        cmds[cmdName].cmd.all(args, input, callback);
                    } else {
                        cmds[cmdName].cmd[platform](args, input, callback);
                    }
                }
            });
        });
    }
}

exports.callCmd = function callCmd(cmdName, args, input, callback) {
    if (!platformInfoIsReady) {
        unprocessedCalls.push([cmdName, args, input, callback]);
    } else if (typeof callback !== 'function') {
        console.error('Callback function is required for command "' +
            cmdName + '"');
    } else if (!validCommand(cmdName)) {
        callback('Invalid command name called "' + cmdName + '"', true);
    } else if (!!!cmds[cmdName].cmd.all &&
        !cmds[cmdName].cmd.hasOwnProperty(platform)) {
        callback('Cannot execute command "' + cmdName + '" on the "' +
            platform + '" platform', true);
    } else if (!!cmds[cmdName].input) {
        if (typeof input === 'undefined') {
            callback('Command "' + cmdName + '" requires input', true);
        } else {
            checkInput(cmdName, args, input, callback);
        }
    } else if (!!cmds[cmdName].arg) {
        checkArg(cmdName, args, input, callback);
    } else if (!!cmds[cmdName].args) {
        checkArgs(cmdName, args, input, callback);
    } else if (!!cmds[cmdName].cmd.all) {
        cmds[cmdName].cmd.all(args, input, callback);
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
cmds['convert.b.gb'] = {
    desc: 'Converts the provided number of bytes (b) to gigabytes (gb) ' +
        'with a precision of 2.',
    input: {
        type: 'number',
        desc: 'The number of bytes'
    },
    cmd: {
        all: function(args, input, callback) {
            callback((input / 1024 / 1024 / 1024).toFixed(2));
        }
    }
};
cmds['convert.b.kb'] = {
    desc: 'Converts the provided number of bytes (b) to kilobytes (kb) ' +
        'with a precision of 2.',
    input: {
        type: 'number',
        desc: 'The number of bytes'
    },
    cmd: {
        all: function(args, input, callback) {
            callback((input / 1024).toFixed(2));
        }
    }
};
cmds['convert.b.mb'] = {
    desc: 'Converts the provided number of bytes (b) to megabytes (mb) ' +
        'with a precision of 2.',
    input: {
        type: 'number',
        desc: 'The number of bytes'
    },
    cmd: {
        all: function(args, input, callback) {
            callback((input / 1024 / 1024).toFixed(2));
        }
    }
};
cmds['convert.b.tb'] = {
    desc: 'Converts the provided number of bytes (b) to terabytes (tb) ' +
        'with a precision of 2.',
    input: {
        type: 'number',
        desc: 'The number of bytes'
    },
    cmd: {
        all: function(args, input, callback) {
            callback((input / 1024 / 1024 / 1024 / 1024).toFixed(2));
        }
    }
};
cmds['dialog.checklist'] = {
    desc: 'Simple checklist dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the checklist',
            required: true
        },
        list: {
            type: 'array',
            desc: 'The list of checkboxes. Even index is an option string and ' +
                'odd index is whether or not it is selected',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 10,
                width = 40,
                listHeight = 0,
                counter = 0,
                list = [],
                listResult = [];
                
            if (args.list.length === 0 ||
                args.list.length % 2 !== 0) { // not even length
                callback('Invalid list specified', true);
                return;
            }
                
            args.list.forEach(function(val, idx) {
                if (idx % 2 === 0) { // even
                    height++;
                    listHeight++;
                    listResult.push(false);
                    list.push(counter++, val, (args.list[idx + 1] ? 'on' : 'off'));
                }
            });

            execDialogCmd([
                '--checklist',
                args.title,
                height,
                width,
                listHeight].concat(list),
                function(code, result) {
                    if (typeof result === 'string') {
                        result.split(' ').forEach(function(val) {
                            listResult[
                                parseInt(val.replace(regex.doubleQuote, ''), 10)] = true;
                        });
                    }
                    
                    callback({
                        ok: (code === 0 ? true : false),
                        list: listResult
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};
cmds['dialog.inputbox'] = {
    desc: 'Simple inputbox dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the inputbox',
            required: true
        },
        chars: {
            type: 'number',
            desc: 'The total number of characters for the inputbox.',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 10,
                output = '';
                
            if (args.chars < 20) {
                callback('Inputlist chars arg must be at least 20', true);
                return;
            }

            execDialogCmd([
                '--inputbox',
                args.title,
                height,
                args.chars],
                function(code, result) {
                    if (typeof result === 'string') {
                        output = result.replace(regex.doubleQuote, '');
                    }
                    
                    callback({
                        ok: (code === 0 ? true : false),
                        output: output
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};
cmds['dialog.menu'] = {
    desc: 'Simple menu dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the menu',
            required: true
        },
        list: {
            type: 'array',
            desc: 'The list of different menu options with each value being ' +
                'a menu option string',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 10,
                width = 40,
                listHeight = 0,
                list = [],
                selected = 0;
                
            if (args.list.length === 0) {
                callback('Menu list cannot be missing', true);
                return;
            }
            
            args.list.forEach(function(val, idx) {
                height++;
                listHeight++;
                list.push(idx, val);
            });

            execDialogCmd([
                '--menu',
                args.title,
                height,
                width,
                listHeight].concat(list),
                function(code, result) {
                    if (typeof result === 'string') {
                        selected = parseInt(
                            result.replace(regex.doubleQuote, ''), 10);
                    }
                    
                    callback({
                        ok: (code === 0 ? true : false),
                        selected: selected
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};
cmds['dialog.msgbox'] = {
    desc: 'Simple message box dialog box',
    args: {
        msg: {
            type: 'string',
            desc: 'The message to display to the user.',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 5,
                width = 40;
                
            if (args.msg.length === 0) {
                callback('Message box message cannot be empty', true);
                return;
            } else {
                height += Math.floor(args.msg.length / 30); 
            }

            execDialogCmd([
                '--msgbox',
                args.msg,
                height,
                width],
                function(code, result) { 
                    callback({
                        ok: (code === 0 ? true : false)
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};
cmds['dialog.radiolist'] = {
    desc: 'Simple radiolist dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the radiolist',
            required: true
        },
        list: {
            type: 'array',
            desc: 'The list of radios. Every item is a radio string and the ' +
                'first index is the default selection',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 10,
                width = 40,
                listHeight = 0,
                counter = 0,
                list = [],
                selected = 0;
                
            if (args.list.length === 0) { // not even length
                callback('Invalid list specified', true);
                return;
            }
                
            args.list.forEach(function(val, idx) {
                height++;
                listHeight++;
                list.push(counter++, val, (idx === 0 ? 'on' : 'off'));
            });

            execDialogCmd([
                '--radiolist',
                args.title,
                height,
                width,
                listHeight].concat(list),
                function(code, result) {
                    if (typeof result === 'string') {
                        selected = parseInt(
                            result.replace(regex.doubleQuote, ''), 10);
                    }
                    
                    callback({
                        ok: (code === 0 ? true : false),
                        list: selected
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};
cmds['dialog.yesno'] = {
    desc: 'Simple Yes/No dialog box',
    args: {
        question: {
            type: 'string',
            desc: 'The Yes/No question to the user.',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 5,
                width = 40;
                
            if (args.question.length === 0) {
                callback('Yes/No dialog cannot have empty question', true);
                return;
            } else {
                height += Math.floor(args.question.length / 30); 
            }

            execDialogCmd([
                '--yesno',
                args.question,
                height,
                width],
                function(code, result) {
                    callback((code === 0 ? true : false));
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};
cmds['disk.availableSpaceInBytes'] = {
    desc: 'Returns the total available space in bytes for a particular disk',
    input: {
        type: 'disk',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            cmds['disk.info'].cmd.linux(null, input, function(info) {
                callback(info.availableSpaceInBytes);
            });
        }
        /*
        disabling this for now because Windows appears to be overstating how
        many bytes it is using for each partition
        windows: function(args, input, callback) {
            cmds['disk.info'].cmd.windows(null, input, function(info) {
                callback(info.availableSpaceInBytes);
            });
        }*/
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
                            case 'ID_PATH':
                                obj.devID = '/dev/disk/by-path/' + pair[1];
                                if (regex.luns.test(pair[1])) { // attached to SAN
                                    obj.attachedToSAN = true;
                                } else {
                                    obj.attachedToSAN = false;
                                }
                                break;
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
                    
                    cmds['disk.partitions'].cmd.linux(null, obj.devName, function(parts) {
                        obj.partitions = parts;
                        obj.usedSpaceInBytes = 0;
                        parts.forEach(function(part) {
                            obj.usedSpaceInBytes += part.rawSizeInBytes;
                        });
                        obj.availableSpaceInBytes =
                            obj.rawSizeInBytes - obj.usedSpaceInBytes;
                        callback(obj);
                    });
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
                    
                    cmds['disk.partitions'].cmd.windows(null, obj.devName, function(parts) {
                        obj.partitions = parts;
                        obj.usedSpaceInBytes = 0;
                        parts.forEach(function(part) {
                            obj.usedSpaceInBytes += part.rawSizeInBytes;
                        });
                        obj.availableSpaceInBytes =
                            obj.rawSizeInBytes - obj.usedSpaceInBytes;
                        callback(obj);
                    });
                }, function(err) {
                    callback('Cannot execute disk.info command', true);
                });
        }
    }
};
// notes:
// udev block stat: https://www.kernel.org/doc/Documentation/block/stat.txt
// lsblk -b -l -o NAME,TYPE,MOUNTPOINT,KNAME,PHY-SEC /dev/sda3
// findmnt -kl
cmds['disk.partitions'] = {
    desc: 'Returns an array of partition information objects for a particular disk.',
    input: {
        type: 'disk',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            var partList = [],
                calls = 0;
            
            function processPartition(stdout) {
                stdoutToArray(stdout).forEach(function(part, idx, parts) {
                    partList.push({
                        lvm: false,
                        encrypted: false,
                        boot: false
                    });
                    
                    getBlockSize(part, idx);
                    getPartInfo(part, idx);
                });
            }
            
            function getBlockSize(part, idx) {
                calls++;
                
                fs.stat(part, function(err, stats) {
                    if (err) {
                        callback('Error getting block size for partition', true);
                    }
                    
                    calls--;
                    partList[idx].blockSize = stats.blksize;
                    
                    if (calls === 0) {
                        callback(partList);
                    }
                });
            }
            
            function getPartInfo(part, idx) {
                calls++;
                
                execCommand('udevadm info -q property -n ' + part,
                    function(stdout) {
                        calls--;
                        
                        stdoutToArray(stdout).forEach(function(kv) {
                            var pair = kv.split('=');
                            switch (pair[0]) {
                                case 'ID_FS_TYPE':
                                    partList[idx].fs = pair[1]; break;
                                case 'DEVNAME':
                                    partList[idx].dev = pair[1]; break;
                                case 'UDISKS_PARTITION_SIZE':
                                    partList[idx].rawSizeInBytes =
                                        parseInt(pair[1], 10); break;
                                case 'UDISKS_PARTITION_FLAGS':
                                    if (pair[1] === 'boot') {
                                        partList[idx].boot = true;
                                    }
                                    break;
                            }
                        });
                        
                        getNumBlocks(idx);
                        getMounts(idx);
                    },
                    function(err) {
                        callback('Error retrieving udev partition information', true);
                    });
            }
            
            function getLVMfreeSpace(idx, mounts) {
                Object.keys(partList[idx].lvmGroups).forEach(function(vg) {
                    partList[idx].lvmGroups[vg].forEach(function(lv) {
                        mounts.some(function(mnt) {
                            var tokens = tokenize(mnt);
                            if (tokens[0] === (lv.luks ? lv.luksDev : lv.lvDev)) {
                                lv.rawSizeInBytes = parseInt(tokens[1], 10);
                                lv.freeSpaceInBytes = parseInt(tokens[3], 10) * 1024;
                                return true;
                            }
                        });
                    });
                });
            }
            
            function getFreeSpace(idx) {
                calls++;
                
                execCommand('df',
                    function(stdout) {
                        calls--;
                        var mounts = stdoutToArray(stdout).slice(1);
                        
                        partList[idx].freeSpaceInBytes = 0;
                        
                        if (!partList[idx].lvm) { // no lvm
                            if (!partList[idx].luks) { // no luks
                                mounts.some(function(mnt) {
                                    var tokens = tokenize(mnt);
                                    if (tokens[0] === partList[idx].dev) {
                                        partList[idx].freeSpaceInBytes =
                                            parseInt(tokens[3], 10) * 1024;
                                        return true;
                                    }
                                });
                            } else { // luks
                                mounts.some(function(mnt) {
                                    var tokens = tokenize(mnt);
                                    if (tokens[0] === partList[idx].luksDev) {
                                        partList[idx].freeSpaceInBytes =
                                            parseInt(tokens[3], 10) * 1024;
                                        return true;
                                    }
                                });
                            }
                        } else { // uses lvm
                            getLVMfreeSpace(idx, mounts);
                        }
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot retrieve df information', true);
                    });
            }
            
            function getNumBlocks(idx) {
                calls++;
                var devPath = partList[idx].dev.split('/');
                
                execCommand('egrep \'\\s' + devPath[devPath.length - 1] +
                    '$\' /proc/partitions | awk \'{print $3}\'',
                    function(stdout) {
                        calls--;
                        partList[idx].blocks = parseInt(stdout, 10);
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot determine number of ' +
                            'blocks for partition ' + idx, true);
                    });
            }
            
            function getLVMInfo(part, mounts) {
                part.lvm = true;
                part.lvmGroups = {};
                
                mounts.forEach(function(mnt, idx, arr) {
                    var tokens = tokenize(mnt);
                    
                    if (tokens[2] === 'lvm') {
                        var lvmInfo = tokens[0].split('-');
                        if (!part.lvmGroups.hasOwnProperty(lvmInfo[0])) {
                            part.lvmGroups[lvmInfo[0]] = [];
                        }
                        
                        if (idx === arr.length - 1) {
                            part.lvmGroups[lvmInfo[0]].encrypted = false;
                            part.lvmGroups[lvmInfo[0]].push({
                                luks: false,
                                mount: tokens[3],
                                lvName: lvmInfo[1],
                                lvDev: '/dev/' + tokens[4]
                            });
                        } else if (tokenize(arr[idx + 1])[2] === 'crypt') {
                            var ctokens = tokenize(arr[idx + 1]);
                            part.lvmGroups[lvmInfo[0]].encrypted = true;
                            part.lvmGroups[lvmInfo[0]].push({
                                luks: true,
                                luksUUID: ctokens[0],
                                luksDev: '/dev/' + ctokens[4],
                                mount: ctokens[3],
                                lvName: lvmInfo[1],
                                lvDev: '/dev/' + tokens[3]
                            });
                        } else {
                            callback('Cannot determine determine LVM information', true);
                        }
                    }
                });
            }
            
            function getMounts(idx) {
                calls++;
                execCommand('lsblk -b -l -n -o NAME,TYPE,MOUNTPOINT,KNAME ' +
                    partList[idx].dev + '',
                    function(stdout) {
                        calls--;
                        
                        var arr = stdoutToArray(stdout);
                        
                        if (arr.length === 1) { // not encrypted, no lvm
                            partList[idx].mount = tokenize(arr[0])[2];
                        } else if (arr.length > 1) { // could be encrypted, could use lvm
                            var tokens = tokenize(arr[1]);
                            
                            if (tokens[2] === 'lvm') { // lvm, could use encrypted volumes
                                getLVMInfo(partList[idx], arr.slice(1));
                            } else if (tokens[2] === 'crypt') { // no lvm, uses luks
                                partList[idx].encrypted = true;
                                partList[idx].luks = true;
                                partList[idx].luksUUID = tokens[0];
                                partList[idx].luksDev = '/dev/' + tokens[4];
                                partList[idx].mount = tokens[3];
                            } else {
                                callback('Unable to process mount information', true);
                            }
                        } else {
                            callback('Cannot determine mounts for partition ' +
                                idx, true);
                        }
                        
                        getFreeSpace(idx);
                    },
                    function(err) {
                        callback('Cannot get partition mounts', true);
                    });
            }
            
            execCommand('ls /dev/disk/by-path/' +
                '$(udevadm info -q property -n ' + input + ' | egrep ID_PATH | ' +
                'awk -F= \'{print $2}\')* | egrep part',
                processPartition,
                function(err) {
                    callback('Cannot find partitions on device', true);
                });
        },
        windows: function(args, input, callback) {
            var partList = [],
                calls = 0;
                
            function getPartInfo(part) {
                calls++;
                execCommand('wmic partition where (DeviceID = "' +
                    part.dev + '") list/format:value',
                    function(stdout) {
                        calls--;
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
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Error retrieving partition information', true);
                    });
            }
            
            function logicalDiskToPartition() {
                calls++;
                execCommand('wmic path win32_logicaldisktopartition get /format:value',
                    function(stdout) {
                        calls--;
                        stdoutToArray(stdout).forEach(function(str, idx, arr) {
                            var parts = str.split('=');
                            
                            if (parts[0] === 'Antecedent') {
                                var dev = parts[2].replace(regex.doubleQuote, ''),
                                    mount = arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '');
                                
                                partList.some(function(part, i) {
                                    if (part.dev === dev) {
                                        part.mount = mount;
                                        logicalPartitionInfo(part);
                                        return true;
                                    }
                                });
                            }
                        });
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot determine logical partitions', true);
                    });             
            }
            
            function logicalPartitionInfo(part) {
                calls++;
                execCommand('wmic logicaldisk where DeviceID="' +
                    part.mount + '" list/format:value',
                    function(stdout) {
                        calls--;
                        stdoutToArray(stdout).forEach(function(kv) {
                            var pair = kv.split('=');
                            
                            switch (pair[0]) {
                                case 'FileSystem':
                                    part.fs = pair[1]; break;
                                case 'FreeSpace':
                                    part.freeSpaceInBytes = parseInt(pair[1], 10); break;
                            }
                        });
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot gather logical disk information', true);
                    });
            }
                
            execCommand('wmic path win32_diskdrivetodiskpartition get /format:value',
                function(stdout) {                    
                    stdoutToArray(stdout).forEach(function(str, idx, arr) {
                        var parts = str.split('=');
                        if (parts[0] === 'Antecedent' &&
                            '"' + input + '""' === parts[2]) {
                            partList.push({
                                lvm: false,
                                encrypted: false,
                                freeSpaceInBytes: 0,
                                dev: arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '')
                            });
                        }
                    });
                        
                    partList.forEach(function(part, idx) {
                        getPartInfo(part);
                    });
                    
                    logicalDiskToPartition();
                },
                function(err) {
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
function platformInfoReady() {
    platformInfoIsReady = true;
    unprocessedCalls.forEach(function(cmd) {
        exports.callCmd.apply(null, cmd);
    });
}

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