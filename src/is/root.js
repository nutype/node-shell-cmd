    cmds['is.root'] = {
        desc: 'Determines if you are root.',
        requiresInput: false,
        cmd: {
            linux: function(args, input, callback) {
                callback(process.getuid() === 0);
            }
        }
    };