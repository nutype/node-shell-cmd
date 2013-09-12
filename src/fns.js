    function bugOut(msg) {
        console.error(msg);
        console.trace();
        process.exit(1);
    }
    
    if (process.argv.length < 3) {
        bugOut('Must provide at least one command name');
    }
    
    function validCommand(cmd) {
        return typeof cmd === 'string' &&
            cmds.hasOwnProperty(cmd);
    }
    
    // pipe: [[cmd, arg, ..., arg], [cmd, arg, ..., arg]]
    function nextCommand(pipe, input, callback) {
        if (pipe.length > 0) { // more commands
            if (!validCommand(pipe[0][0])) {
                bugOut('Invalid command name "' + pipe[0][0] + '"');
            } else if (pipe[0][1] === 'help') {
                showHelp(pipe[0][0]);
            }
            
            if (cmds[pipe[0][0]].requiresInput &&
                typeof input === 'undefined') {
                try {
                    input = JSON.parse(pipe[0][1]);
                } catch (e) {
                    bugOut('The command "' + pipe[0][0] + '" requires an input');
                }
            }
            
            if (cmds[pipe[0][0]].cmd.hasOwnProperty('all')) {
                return cmds[pipe[0][0]].cmd.all(
                    pipe[0].slice(1), pipe.slice(1), input, callback);
            } else if (!cmds[pipe[0][0]].cmd.hasOwnProperty(platform)) {
                bugOut('The command "' + pipe[0][0] + '" is not ' +
                    'supported on the "' + platform + '" platform');
            } else {
                return cmds[pipe[0][0]].cmd[platform](
                    pipe[0].slice(1), pipe.slice(1), input, callback);
            }
        } else { // last command
            callback(input);
        }
    }
    
    function execCommand(cmd, callback) {
        exec(cmd, function(err, stdout, stderr) {
            if (err !== null ||
                stderr.length > 0) {
                bugOut('There errors executing a shell command.\n' +
                    'err: ' + err + '\n' +
                    'stderr: ' + stderr + '\n');
            } else {
                callback(stdout);
            }
        });
    }
    
    function showHelp(cmd) {
        console.log('Command:\n\t' + cmd + '\n\n' +
            'Description:\n\t' + cmds[cmd].desc + '\n\n' +
            'Requires Input:\n\t' + cmds[cmd].requiresInput);
        
        process.exit(0);
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
    
    function buildPipe(args) {
        return args.filter(function(arg) { // remove extra spaces
                    return arg.length > 0;
                })
                .join(' ')
                .replace(regex.leadingSpacesByPipe, '_')
                .replace(regex.trailingSpacesByPipe, '_')
                .split('_')
                .map(function(cmd) {
                    return cmd.split(' ');
                });
    }
    