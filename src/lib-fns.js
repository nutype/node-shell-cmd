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
