cmds['convert.b.kb'] = {
    desc: 'Converts the provided number of bytes (b) to kilobytes (kb) ' +
        'with a precision of 2.',
    input: {
        type: 'number',
        desc: 'The number of bytes'
    },
    cmd: {
        all: function(args, input, callback) {
            callback((input / 1024).toFixed(2));
        }
    }
};