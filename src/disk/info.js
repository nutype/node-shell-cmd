    cmds['disk.info'] = {
        desc: 'Gets detailed information for a particular disk.',
        requiresInput: true,
        cmd: {
            linux: function(args, pipe, input, callback) {
                nextCommand([['is.dev', input]], function(isDev) {
                    if (isDev) {
                        execCommand('udevadm info -q property -n ' + input,
                            function(stdout) {
                                nextCommand(pipe, stdoutToArray(stdout), callback);
                            });
                    } else {
                        bugOut('The provided input "' + input + '" is not a ' +
                            'valid device name for the command "disk.info"');
                    }
                });
            },
            windows: function(args, pipe, input, callback) {
                execCommand('wmic logicaldisk get name',
                    function(stdout) {
                        nextCommand(pipe,
                            stdoutToArray(stdout, [/^Name/]), callback);
                    });
            }
        }
    };