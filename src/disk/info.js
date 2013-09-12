    cmds['disk.info'] = {
        desc: 'Gets detailed information for a particular disk.',
        requiresInput: true,
        cmd: {
            linux: function(args, pipe, input, callback) {
                execCommand('udevadm info -q property -n ' + ,
                    function(stdout) {
                        nextCommand(pipe, stdoutToArray(stdout), callback);
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