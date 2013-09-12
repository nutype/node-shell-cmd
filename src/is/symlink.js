    cmds['is.symlink'] = {
        desc: 'Determines if the provided input is a valid symbolic link.',
        requiresInput: true,
        cmd: {
            all: function (args, pipe, input, callback) {
                fs.lstat(input, function(err, stats) {
                    if (err !== null) {
                        bugOut('Error performing a stat on "' + input + '"\n' +
                            'err: ' + err);
                    } else {
                        nextCommand(pipe, stats.isSymbolicLink(), callback);
                    }
                });
            }
        }
    };