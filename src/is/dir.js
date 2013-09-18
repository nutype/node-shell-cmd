cmds['is.dir'] = {
    desc: 'Determines if the provided input is a valid directory',
    input: {
        type: 'string',
        desc: 'The absolute or relative path to a directory'
    },
    cmd: {
        all: function (args, input, callback) {
            fs.stat(input, function(err, stats) {
                if (err !== null) {
                    callback('Error performing a stat on "' + input + '"\n' +
                        'err: ' + err, true);
                } else {
                    callback(stats.isDirectory());
                }
            });
        }
    }
};