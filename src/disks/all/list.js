    cmds['disks.all.list'] = {
        desc: 'Lists all disks (e.g. SAN, local hard disk, ' +
                'CD/DVD-ROM, USB, etc.). by their device ID.',
        requiresInput: false,
        cmd: {
            linux: function(args, pipe, input, callback) {
                execCommand('for disk in ' +
                    '$(ls /dev/disk/by-path/ | egrep -v part); do ' +
                    'echo /dev/disk/by-path/$disk; done',
                    function(stdout) {
                        nextCommand(pipe, stdoutToArray(stdout), callback);
                    });
            },
            windows: function(args, pipe, input, callback) {
                execCommand('wmic diskdrive get deviceid',
                    function(stdout) {
                        nextCommand(pipe,
                            stdoutToArray(stdout, [/^DeviceID/]), callback);
                    });
            }
        }
    };