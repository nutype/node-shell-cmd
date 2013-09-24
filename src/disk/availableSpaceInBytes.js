cmds['disk.availableSpaceInBytes'] = {
    desc: 'Returns the total available space in bytes for a particular disk',
    input: {
        type: 'disk',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            cmds['disk.info'].cmd.linux(null, input, function(info) {
                callback(info.availableSpaceInBytes);
            });
        }
        /*
        disabling this for now because Windows appears to be overstating how
        many bytes it is using for each partition
        windows: function(args, input, callback) {
            cmds['disk.info'].cmd.windows(null, input, function(info) {
                callback(info.availableSpaceInBytes);
            });
        }*/
    }
};