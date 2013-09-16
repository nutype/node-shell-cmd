cmds['disks.all.devNames'] = {
    desc: 'Lists all disks (e.g. SAN, local hard disk, ' +
            'USB, etc.). by their standard device name.\n' +
            'On Linux, this would be something like /dev/sda.\n' +
            'On Windows, this would be the same as the DISKDRIVE device ID.\n\n' +
            'Use cdrom.devNames to get the device names for all attached ' +
            'CD/DVD-ROM devices.',
    requiresInput: false,
    cmd: {
        linux: function(args, input, callback) {
            execCommand('for disk in ' +
                    '$(ls /dev/disk/by-path/ | egrep -v part); do ' +
                    'udevadm info -q property -n /dev/disk/by-path/$disk | ' +
                    'awk -F= \'/^DEVNAME=/ {print $2}\'; done',
                function(stdout) {
                    callback(stdoutToArray(stdout));
                },
                function(err) {
                    callback('Cannot execute disks.all.devNames command', true);
                });
        },
        windows: function(args, input, callback) {
            execCommand('wmic logicaldisk get name',
                function(stdout) {
                    callback(stdoutToArray(stdout, [/^Name/]));
                },
                function(err) {
                    callback('Cannot execute disks.all.devNames command', true);
                });
        }
    }
};