cmds['is.opticalDrive'] = {
    desc: 'Determines if the provided input is a valid CD/DVD-ROM drive.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux or a drive letter in Windows (typically "D:")'
    },
    cmd: {
        linux: function(args, input, callback) {
            cmds['is.blockDev'].cmd.linux(args, input, function(isBlockDev) {
                if (isBlockDev) {
                    execCommand('udevadm info -q property -n ' + input +
                        ' | egrep ID_TYPE | awk -F= \'{print $2}\'',
                        function(stdout) {
                            callback(regex.cdrom.test(stdout));
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
            if (regex.windowsDriveLetter.test(input)) {
                execCommand('wmic cdrom where Drive="' + input + '"',
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