cmds['is.fifo'] = {
    desc: 'Determines if the provided input is a valid FIFO.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isFIFO());
                }
            });
        }
    }
};