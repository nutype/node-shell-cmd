cmds['arr.length'] = {
    desc: 'Returns the length of an array. If you are ' +
        'supplying the array on the command line, then it must be ' +
        'single-quoted and use JSON syntax',
    input: {
        type: 'array',
        desc: 'The input array'
    },
    cmd: {
        all: function(args, input, callback) {
            callback(input.length);
        }
    }
};