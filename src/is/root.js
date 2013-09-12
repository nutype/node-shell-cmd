    cmds['is.root'] = {
        desc: 'Determines if you are root.',
        requiresInput: false,
        cmd: {
            linux: function(args, pipe, input, callback) {
                nextCommand(pipe, process.getuid() === 0, callback);
            }
        }
    };