    cmds['is.symlink'] = {
        desc: 'Determines if the provided input is a valid symbolic link.',
        requiresInput: true,
        cmd: {
            all: function (args, input, callback) {
                fs.lstat(input, function(err, stats) {
                    if (err !== null) {
                        callback('Error performing a stat on "' + input + '"\n' +
                            'err: ' + err, true);
                    } else {
                        callback(stats.isSymbolicLink());
                    }
                });
            }
        }
    };