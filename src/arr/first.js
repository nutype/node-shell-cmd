    cmds['arr.first'] = {
        desc: 'Returns the first value in an array. If you are ' +
            'supplying the array on the command line, then it must be ' +
            'single-quoted and use JSON syntax',
        requiresInput: true,
        cmd: {
            all: function(args, input, callback) {
                if (!Array.isArray(input)) {
                    callback('Not a valid input array', true);
                } else {
                    callback(input[0]);
                }
            }
        }
    };