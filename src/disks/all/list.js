cmds['disks.all.list'] = {
    desc: 'Lists all disks (e.g. SAN, local hard disk, ' +
            'USB, etc.). by their device ID.\n' +
            'On Linux, this would be something like /dev/disk/by-path/...\n' +
            'On Windows, this is the DISKDRIVE device ID.\n\n' +
            'Use cdrom.list to get the device IDs for all attached ' +
            'CD/DVD-ROM devices.',
    cmd: {
        linux: function(args, input, callback) {
            execCommand('for disk in ' +
                '$(ls /dev/disk/by-path/ | egrep -v part); do ' +
                'if ! udevadm info -q property -n ' +
                '/dev/disk/by-path/$disk | egrep -q \'^ID_CDROM=1$\'; ' +
                'then echo /dev/disk/by-path/$disk; fi; done',
                function(stdout) {
                    callback(stdoutToArray(stdout));
                },
                function(err) {
                    callback('Cannot execute disks.all.list command', true);
                });
        },
        windows: function(args, input, callback) {
            execCommand('wmic diskdrive get deviceid',
                function(stdout) {
                    callback(stdoutToArray(stdout, [/^DeviceID/]));
                },
                function(err) {
                    callback('Cannot execute disks.all.list command', true);
                });
        }
    }
};