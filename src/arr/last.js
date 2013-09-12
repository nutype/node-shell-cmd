    cmds['arr.last'] = {
        desc: 'Returns the last value in an array. If you are ' +
            'supplying the array on the command line, then it must be ' +
            'single-quoted and use JSON syntax',
        requiresInput: true,
        cmd: {
            all: function(args, pipe, input, callback) {
                if (!Array.isArray(input)) {
                    bugOut('Not a valid input array');
                }
                nextCommand(pipe, input[input.length - 1], callback);
            }
        }
    };