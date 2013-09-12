    cmds['disks.all.devNames'] = {
        desc: 'Lists all disks (e.g. SAN, local hard disk, ' +
                'CD/DVD-ROM, USB, etc.). by their standrd device name.',
        requiresInput: false,
        cmd: {
            linux: function(args, pipe, input, callback) {
                execCommand('for disk in ' +
                        '$(ls /dev/disk/by-path/ | egrep -v part); do ' +
                        'udevadm info -q property -n /dev/disk/by-path/$disk | ' +
                        'awk -F= \'/^DEVNAME=/ {print $2}\'; done',
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