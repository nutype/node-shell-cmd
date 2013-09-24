cmds['disk.info'] = {
    desc: 'Gets detailed information for a particular disk.',
    input: {
        type: 'disk',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            execCommand('udevadm info -q property -n ' + input + ' && ' +
                'lsblk -l -b -d -o SIZE,STATE,PHY-SEC ' + input,
                function(stdout) {
                    var obj = {};
                    stdout.split('\n').forEach(function(kv, idx, arr) {
                        var pair = kv.split('=');
                        
                        switch (pair[0]) {
                            case 'DEVNAME': obj.devName = pair[1]; break;
                            case 'ID_VENDOR': obj.manf = pair[1]; break;
                            case 'ID_MODEL': obj.model = pair[1]; break;
                            case 'ID_PATH':
                                obj.devID = '/dev/disk/by-path/' + pair[1];
                                if (regex.luns.test(pair[1])) { // attached to SAN
                                    obj.attachedToSAN = true;
                                } else {
                                    obj.attachedToSAN = false;
                                }
                                break;
                        }
                        
                        if (regex.lsblkDiskInfo.test(kv)) {
                            var lsblk = arr[idx + 1].split(' ').filter(function(result) {
                                return result.length > 0;
                            });
                            
                            obj.rawSizeInBytes = parseInt(lsblk[0], 10);
                            
                            if (lsblk[1] === 'running') {
                                obj.status = 'online';
                            } else {
                                obj.status = 'offline';
                            }
                            
                            obj.sectorSizeInBytes = parseInt(lsblk[2], 10);
                        }
                    });
                    
                    cmds['disk.partitions'].cmd.linux(null, obj.devName, function(parts) {
                        obj.partitions = parts;
                        obj.usedSpaceInBytes = 0;
                        parts.forEach(function(part) {
                            obj.usedSpaceInBytes += part.rawSizeInBytes;
                        });
                        obj.availableSpaceInBytes =
                            obj.rawSizeInBytes - obj.usedSpaceInBytes;
                        callback(obj);
                    });
                },
                function (err) {
                    callback('Cannot execute disk.info command', true);
                });
        },
        windows: function(args, input, callback) {
            execCommand('wmic diskdrive where DeviceID="' +
                input.replace(regex.backslash, '\\\\') + '" list/format:value',
                function(stdout) {
                    var obj = {};

                    stdout.replace(regex.windowsLinebreak, '').split('\n')
                        .filter(function(kv) {
                            return kv.length > 0;
                        }).forEach(function(kv) {
                            var pair = kv.split('=');
                            switch (pair[0]) {
                                case 'DeviceID':
                                    obj.devID = pair[1];
                                    obj.devName = pair[1];
                                    break;
                                case 'Manufacturer': obj.manf = pair[1]; break;
                                case 'Model': obj.model = pair[1]; break;
                                case 'BytesPerSector': obj.sectorSizeInBytes = parseInt(pair[1], 10); break;
                                case 'Status':
                                    if (pair[1] === 'OK') {
                                        obj.status = 'online';
                                    } else {
                                        obj.status = 'offline';
                                    }
                                    break;
                                case 'Size': obj.rawSizeInBytes = parseInt(pair[1], 10); break;
                            }
                        });
                    
                    cmds['disk.partitions'].cmd.windows(null, obj.devName, function(parts) {
                        obj.partitions = parts;
                        obj.usedSpaceInBytes = 0;
                        parts.forEach(function(part) {
                            obj.usedSpaceInBytes += part.rawSizeInBytes;
                        });
                        obj.availableSpaceInBytes =
                            obj.rawSizeInBytes - obj.usedSpaceInBytes;
                        callback(obj);
                    });
                }, function(err) {
                    callback('Cannot execute disk.info command', true);
                });
        }
    }
};