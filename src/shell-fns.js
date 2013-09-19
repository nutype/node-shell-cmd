
if (process.argv.length < 3) {
    bugOut('Must provide at least one command name');
}

// pipe: [[cmd, arg, ..., arg], [cmd, arg, ..., arg]]
function nextCommand(pipe, input, callback) {
    if (pipe.length > 0) { // more commands
        pipe[0][0](
            pipe[0][1], // args
            input, // input
            function (output, err) { // callback
                if (err) {
                    bugOut(output);
                } else {
                    nextCommand(pipe.slice(1), output, callback);
                }
            });
    } else { // last command
        callback(input);
    }
}

function showHelp(cmd) {
    var helpStr = 'Command:\n\t' + cmd + '\n\n' +
        'Description:\n\t' + cmds[cmd].desc + '\n\n',
        requiresInput = false,
        requiresArg;
        
    if (!!cmds[cmd].input) {
        requiresInput = true;
        helpStr += 'Requires Input:\n\tYes\n\n' +
            'Input Description:\n\t' + cmds[cmd].input.desc + '\n\n' +
            'Input Type:\n\t' + cmds[cmd].input.type + '\n\n';
    } else {
        helpStr += 'Requires Input:\n\tNo\n\n';
    }
    
    if (!!cmds[cmd].arg) {
        requiresArg = cmds[cmd].arg.required;
        
        helpStr += 'Single Argument Required:\n\t' +
            (requiresArg ? 'Yes' : 'No') + '\n\n' +
            'Single Argument Description:\n\t' +
            cmds[cmd].arg.desc + '\n\n' +
            'Single Argument Type:\n\t' +
            cmds[cmd].arg.type + '\n\n' +
            'Syntax:\n\t' + cmd + ' ' +
            (requiresArg ? '\'JSON-encoded ' + cmds[cmd].arg.type + ' argument\' ' : '') +
            (requiresInput ? '\'JSON-encoded ' + cmds[cmd].input.type + ' input\'' : '') + '\n\n';
    } else if (!!cmds[cmd].args) {
        Object.keys(cmds[cmd].args).forEach(function(arg) {
            helpStr += '"' + arg + '" Argument Required:\n\t' +
                (cmds[cmd].args[arg].required ? 'Yes' : 'No') + '\n\n' +
                '"' + arg + '" Argument Description:\n\t' +
                cmds[cmd].args[arg].desc + '\n\n' +
                '"' + arg + '" Argument Type:\n\t' +
                cmds[cmd].args[arg].type + '\n\n';
        });
        
        helpStr += 'Syntax:\n\t' + cmd + ' \'JSON-encoded arguments object\' ' +
            (requiresInput ? '\'JSON-encoded ' + cmds[cmd].input.type + ' input\'' : '');
    } else if (requiresInput) {
        helpStr += 'Syntax:\n\t' + cmd +
            ' \'JSON-encoded ' + cmds[cmd].input.type + ' input\'';
    } else {
        helpStr += 'Syntax:\n\t' + cmd;
    }
    
    console.log(helpStr);
    process.exit(0);
}

function listCommands(qualifier) {
    if (typeof qualifier === 'string' &&
        regex.listQualifier.test(qualifier)) {
        console.log(Object.keys(cmds).filter(function(cmd) {
            return new RegExp(
                qualifier.replace(regex.listQualifierDot, '\\.')).test(cmd);
        }).map(function(cmd) {
            return cmd + ':\n\t' + cmds[cmd].desc;
        }).join('\n\n'));
    } else {
        console.log(Object.keys(cmds).map(function(cmd) {
            return cmd + ':\n\t' + cmds[cmd].desc;
        }).join('\n\n'));
    }
    
    process.exit(0);
}

function buildPipe(args, callback) {
    var pipe = [],
        cmdIdx,
        validCalls = 0,
        validCallbacks = 0;
        
    if (args.length === 1) {
        pipe.push([args[0]]);
    }
        
    args.reduce(function(prev, curr) {
        if (prev === '_' &&
            curr === '_') {
            return curr;
        } else {
            if (prev === '_') {
                cmdIdx = pipe.push([curr]) - 1;
            } else if (curr !== '_') {
                if (typeof cmdIdx === 'number') {
                    pipe[cmdIdx].push(curr);
                } else {
                    cmdIdx = pipe.push([prev, curr]) - 1;
                }
            } else if (typeof cmdIdx !== 'number') {
                cmdIdx = pipe.push([prev]) - 1;
            }
            
            return curr;
        }
    });
    
    var newpipe = pipe.map(function(cmd, idx) {
        var cmdName = cmd[0],
            cmdFn,
            args,
            input;
        if (cmdName === 'list') {
            listCommands(cmd[1]);
        } else if (!validCommand(cmdName)) {
            bugOut('Invalid command name "' + cmdName + '"');
        } else if (cmds[cmdName].cmd.hasOwnProperty('all')) {
            cmdFn = cmds[cmdName].cmd.all;
        } else if (!cmds[cmdName].cmd.hasOwnProperty(platform)) {
            bugOut('The command "' + cmdName + '" is not ' +
                'supported on the "' + platform + '" platform');
        } else {
            cmdFn = cmds[cmdName].cmd[platform];
        }
        
        var cmdInput = cmds[cmdName].input,
            cmdArg = cmds[cmdName].arg,
            cmdArgs = cmds[cmdName].args;
        
        if (cmd[1] === 'help') {
            showHelp(cmdName);
        } else if (idx === 0) { // first command
            if (cmd.length === 1) { // cmd.name
                if (!!cmdInput) {
                    bugOut('The command "' + cmdName + '" requires a "' +
                        cmds[cmdName].input.type + '" input');
                }
                
                return [cmdFn, undefined, undefined];
            } else if (cmd.length === 2) { // cmd.name args|input
                if (!!cmdArg &&
                    !!cmdArg.required) {
                    bugOut('The command "' + cmdName + '" requires a single "' +
                        cmdArg.type + '" argument');
                } else if (!!cmdArgs &&
                    Object.keys(cmdArgs).some(function(arg) {
                        return !!cmdArgs[arg].required;
                    })) {
                    bugOut('The command "' + cmdName + '" requires one or more ' +
                        'arguments specified as a JSON object.  Example: ' +
                        '\'{"arg1": "arg1 value", "arg2": true}\'');
                }
                
                try {
                    input = JSON.parse(cmd[1]);
                } catch (e) {
                    bugOut('Cannot parse JSON input data for first command "' +
                        cmdName + '"');
                }
                
                if (typeof cmdInput === 'undefined') {
                    return [cmdFn, undefined, undefined];
                } else {
                    return [cmdFn, undefined, input];
                }
            } else { // cmd.name args input
                try {
                    args = JSON.parse(cmd[1]);
                } catch (e) {
                    bugOut('Cannot parse arguments JSON string for command "' +
                        cmdName + '"');
                }
                
                if (!!cmdArgs) {
                    if (typeof args !== 'object') {
                        bugOut('The command "' + cmdName + '" requires an ' +
                            'arguments object');
                    }
                    
                    Object.keys(cmdArgs).forEach(function(arg) {
                        if (!!cmdArgs.require &&
                            !args.hasOwnProperty(arg)) {
                            bugOut('The command "' + cmdName + '" requires the "' +
                                arg + '" argument specified in a JSON object');
                        }
                    });
                    
                    Object.keys(args).forEach(function(arg) {
                        if (!cmdArgs.hasOwnProperty(arg)) {
                            bugOut('The command "' + cmdName + '" does not ' +
                                'an accept an argument of "' + arg + '"');
                        }
                    });
                } else if (!!!cmdArg) {
                    args = undefined;
                }
                
                try {
                    input = JSON.parse(cmd[2]);
                } catch (e) {
                    bugOut('Cannot parse JSON input data for first command "' +
                        cmdName + '"');
                }
                
                if (typeof cmdInput === 'undefined') {
                    return [cmdFn, args, undefined];
                } else {
                    return [cmdFn, args, input];
                }
            }
        } else { // additional command
            if (cmd.length === 1) {
                if (!!cmdArg &&
                    !!cmdArg.required) {
                    bugOut('The command "' + cmdName + '" requires a single "' +
                        cmdArg.type + '" argument');
                } else if (!!cmdArgs &&
                    Object.keys(cmdArgs).some(function(arg) {
                        return !!cmdArgs[arg].required;
                    })) {
                    bugOut('The command "' + cmdName + '" requires one or more ' +
                        'arguments specified as a JSON object.  Example: ' +
                        '\'{"arg1": "arg1 value", "arg2": true}\'');
                }
                
                return [cmdFn, undefined, undefined];
            } else {
                try {
                    args = JSON.parse(cmd[1]);
                } catch (e) {
                    bugOut('Cannot parse arguments JSON object for command "' +
                        cmdName + '"');
                }
                
                if (!!cmdArgs) {
                    if (typeof args !== 'object') {
                        bugOut('The command "' + cmdName + '" requires an ' +
                            'arguments object');
                    }
                    Object.keys(cmdArgs).forEach(function(arg) {
                        if (!!cmdArgs.require &&
                            !args.hasOwnProperty(arg)) {
                            bugOut('The command "' + cmdName + '" requires the "' +
                                arg + '" argument specified in a JSON object');
                        }
                    });
                    
                    Object.keys(args).forEach(function(arg) {
                        if (!cmdArgs.hasOwnProperty(arg)) {
                            bugOut('The command "' + cmdName + '" does not ' +
                                'an accept an argument of "' + arg + '"');
                        }
                    });
                } else if (!!!cmdArg) {
                    args = undefined;
                }
                
                return [cmdFn, args, undefined];
            }
        }
    });
    
    newpipe.forEach(function(cmd, idx) {
        var cmdName = pipe[idx][0];
        
        if (idx === 0 && // first command
            !!cmds[cmdName].input) { // requires input
            validCalls++;
            validInput(cmdName, cmd[2], function(isValid) {
                validCallbacks++;
                
                if (!isValid) {
                    bugOut('The command "' + cmdName + '" requires a ' +
                        'valid "' + cmds[cmdName].input.type + '" input type');
                } else if (validCalls === validCallbacks) {
                    callback(newpipe);
                }
            });
        }
        
        if (!!cmds[cmdName].arg && // accepts single argument
            cmds[cmdName].arg.required) { // single argument required
            validCalls++;
            validArgument(cmdName, null, cmd[2], function(isValid) {
                validCallbacks++;
                if (!isValid) {
                    bugOut('The provided single argument is not of ' +
                        'the correct type "' + cmds[cmdName].arg.type + '"');
                } else if (validCalls === validCallbacks) {
                    callback(newpipe);
                }
            });
        } else if (!!cmds[cmdName].args) { // accepts multiple arguments
            Object.keys(cmd[1]).forEach(function(arg) {
                validCalls++;
                validArgument(cmdName, arg, cmd[1][arg], function(isValid) {
                    validCallbacks++;
                    if (!isValid) {
                        bugOut('The command "' + cmdName + '" was ' +
                            'provided with an invalid value for ' +
                            'the "' + arg + '" argument');
                    } else if (validCalls === validCallbacks) {
                        callback(newpipe);
                    }
                });
            });
        }
    });
    
    if (validCalls === 0) {
        callback(newpipe);
    }
}
