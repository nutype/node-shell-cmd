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
        if (err !== null ||
            stderr.length > 0) {
            callbackError({
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
