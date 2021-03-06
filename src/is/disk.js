cmds['is.disk'] = {
    desc: 'Determines if the provided input is a valid physical disk. ' +
        'This excludes CD/DVD-ROM drives.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            cmds['is.blockDev'].cmd.linux(args, input, function(isBlockDev) {
                if (isBlockDev) {
                    execCommand('udevadm info -q property -n ' + input +
                        ' | egrep ID_TYPE | awk -F= \'{print $2}\'',
                        function(stdout) {
                            callback(regex.disk.test(stdout));
                        },
                        function(err) {
                            callback(false);
                        });
                } else {
                    callback(false);
                }
            });
        },
        windows: function(args, input, callback) {
            if (regex.windowsPhysDrive.test(input)) {
                execCommand('wmic diskdrive where DeviceID="' +
                    input.replace(regex.backslash, '\\\\') + '"',
                    function(stdout) {
                        callback(true);
                    },
                    function(err) {
                        callback(false);
                    });
            } else {
                callback(false);
            }
        }
    }
};