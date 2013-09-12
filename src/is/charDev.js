    cmds['is.charDev'] = {
        desc: 'Determines if the provided input is a valid character device.',
        requiresInput: true,
        cmd: {
            all: function (args, pipe, input, callback) {
                fs.stat(input, function(err, stats) {
                    if (err !== null) {
                        bugOut('Error performing a stat on "' + input + '"\n' +
                            'err: ' + err);
                    } else {
                        nextCommand(pipe, stats.isCharacterDevice(), callback);
                    }
                });
            }
        }
    };