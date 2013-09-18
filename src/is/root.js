cmds['is.root'] = {
    desc: 'Determines if you are root.',
    cmd: {
        linux: function(args, input, callback) {
            callback(process.getuid() === 0);
        }
    }
};