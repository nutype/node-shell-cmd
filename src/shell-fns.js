
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
    console.log('Command:\n\t' + cmd + '\n\n' +
        'Description:\n\t' + cmds[cmd].desc + '\n\n' +
        'Requires Input:\n\t' + cmds[cmd].requiresInput);
    
    process.exit(0);
}

function buildPipe(args) {
    var pipe = [],
        cmdIdx;
        
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
    
    return pipe.map(function(cmd, idx) {
        var cmdName = cmd[0],
            cmdFn,
            args,
            input;
        
        if (!validCommand(cmdName)) {
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
            if (cmd.length === 1) {
                if (!!cmdInput) {
                    bugOut('The command "' + cmdName + '" requires a "' +
                        cmds[cmdName].input.type + '" input');
                }
                
                return [cmdFn, undefined, undefined];
            } else if (cmd.length === 2) {
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
                } else if (typeof input !== cmdInput.type) {
                    bugOut('The provided input is not of the correct input ' +
                        'type "' + cmdInput.type + '"');
                }
                
                return [cmdFn, undefined, input];
            } else {   
                try {
                    args = JSON.parse(cmd[1]);
                } catch (e) {
                    bugOut('Cannot parse arguments JSON string for command "' +
                        cmdName + '"');
                }
                
                if (!!cmdArg) {
                    if (typeof args !== cmdArg.type) {
                        bugOut('The provided single argument is not of the correct ' +
                            'type "' + cmdArg.type + '"');
                    }
                } else if (!!cmdArgs) {
                    if (typeof args !== 'object') {
                        bugOut('The command "' + cmdName + '" requires an ' +
                            'arguments object');
                    } else {
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
                            } else if (typeof args[arg] !== cmdArgs[arg].type) {
                                bugOut('The command "' + cmdName + '" was provided ' +
                                    'with an invalid value for the "' + arg +
                                    '" argument');
                            }
                        });
                    }
                } else {
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
                } else if (typeof input !== cmdInput.type) {
                    bugOut('The provided input is not of the correct input ' +
                        'type "' + cmdInput.type + '"');
                }
                
                return [cmdFn, args, input];
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
                
                if (!!cmdArg) {
                    if (typeof args !== cmdArg.type) {
                        bugOut('The provided single argument is not of the correct ' +
                            'type "' + cmdArg.type + '"');
                    }
                } else if (!!cmdArgs) {
                    if (typeof args !== 'object') {
                        bugOut('The command "' + cmdName + '" requires an ' +
                            'arguments object');
                    } else {
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
                            } else if (typeof args[arg] !== cmdArgs[arg].type) {
                                bugOut('The command "' + cmdName + '" was provided ' +
                                    'with an invalid value for the "' + arg +
                                    '" argument');
                            }
                        });
                    }
                } else {
                    args = undefined;
                }
                
                return [cmdFn, args, undefined];
            }
        }
    });
}
