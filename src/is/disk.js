cmds['is.disk'] = {
    desc: 'Determines if the provided input is a valid physical disk. ' +
        'This excludes CD/DVD-ROM drives.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function (args, input, callback) {
            cmds['is.blockDev'].cmd.linux(args, input, function(isBlockDev) {
                if (isBlockDev) {
                    //execCommand('
                } else {
                    callback(false);
                }
            });
        }
    }
};