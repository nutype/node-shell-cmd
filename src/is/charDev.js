    cmds['is.charDev'] = {
        desc: 'Determines if the provided input is a valid character device.',
        requiresInput: true,
        cmd: {
            all: function (args, input, callback) {
                fs.stat(input, function(err, stats) {
                    if (err !== null) {
                        callback('Error performing a stat on "' + input + '"\n' +
                            'err: ' + err, true);
                    } else {
                        callback(stats.isCharacterDevice());
                    }
                });
            }
        }
    };