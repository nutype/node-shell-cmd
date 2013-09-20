cmds['convert.b.mb'] = {
    desc: 'Converts the provided number of bytes (b) to megabytes (mb) ' +
        'with a precision of 2.',
    input: {
        type: 'number',
        desc: 'The number of bytes'
    },
    cmd: {
        all: function(args, input, callback) {
            callback((input / 1024 / 1024).toFixed(2));
        }
    }
};