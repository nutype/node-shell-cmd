cmds['disks.san.list'] = {
    desc: 'Returns all disks which are SAN LUNs. Keep in mind with multipathing, ' +
        'a single LUNs could be attached to more than one fiber card.',
    cmd: {
        linux: function(args, input, callback) {
            cmds['disks.all.list'].cmd.linux(null, null, function(disks) {  
                callback(disks.filter(function(disk) {
                    return regex.luns.test(disk);
                }));
            });
        }
    }
};