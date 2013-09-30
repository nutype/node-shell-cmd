cmds['disks.nonsan.list'] = {
    desc: 'Returns all disks which are not SAN LUNs.',
    cmd: {
        linux: function(args, input, callback) {
            cmds['disks.all.list'].cmd.linux(null, null, function(disks) {
                callback(disks.filter(function(disk) {
                    return !regex.luns.test(disk);
                }));
            });
        }
    }
};