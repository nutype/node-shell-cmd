    cmds['is.file'] = {
        desc: 'Determines if the provided input is a valid regular file.',
        input: {
            type: 'string',
            desc: 'The absolute or relative path to a regular file'
        },
        cmd: {
            all: function (args, input, callback) {
                fs.stat(input, function(err, stats) {
                    if (err !== null) {
                        callback('Error performing a stat on "' + input + '"\n' +
                            'err: ' + err, true);
                    } else {
                        callback(stats.isFile());
                    }
                });
            }
        }
    };