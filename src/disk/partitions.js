cmds['disk.partitions'] = {
    desc: 'Returns an array of partition information objects for a particular disk',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        windows: function(args, input, callback) {
        }
    }
}