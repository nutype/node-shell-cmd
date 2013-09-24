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
