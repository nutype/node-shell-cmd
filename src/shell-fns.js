
if (process.argv.length < 3) {
    bugOut('Must provide at least one command name');
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
            cmds[pipe[0][0]].cmd.all(
                pipe[0].slice(1), // args
                input, // input
                function (output, err) { // callback
                    if (err) {
                        bugOut(output);
                    } else {
                        nextCommand(pipe.slice(1), output, callback);
                    }
                });
        } else if (!cmds[pipe[0][0]].cmd.hasOwnProperty(platform)) {
            bugOut('The command "' + pipe[0][0] + '" is not ' +
                'supported on the "' + platform + '" platform');
        } else {
            cmds[pipe[0][0]].cmd[platform](
                pipe[0].slice(1), // args
                input, // input
                function (output, err) { // callback
                    if (err) {
                        bugOut(output);
                    } else {
                        nextCommand(pipe.slice(1), output, callback);
                    }
                });
        }
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
    return args.join(' ').split('_').filter(function(arg) { // remove extra spaces
            return arg.length > 0;
        }).map(function(arg) {
            return arg.split(' ').filter(function(cmdarg) {
                return cmdarg.length > 0;
            });
        });
}
