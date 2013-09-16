    cmds['disk.info'] = {
        desc: 'Gets detailed information for a particular disk.',
        requiresInput: true,
        cmd: {
            linux: function(args, input, callback) {
                cmds['is.blockDev'].cmd.all(null, input, function(isBlockDev) {
                    if (isBlockDev) {
                        // num sectors: blockdev --getsize /dev/sda (requires root)
                        execCommand('udevadm info -q property -n ' + input,
                            function(stdout) {
                                var obj = {};
                                stdout.split('\n').forEach(function(kv) {
                                    var pair = kv.split('=');
                                    
                                    switch (pair[0]) {
                                        case 'DEVNAME': obj.devName = pair[1]; break;
                                        case 'ID_VENDOR': obj.manf = pair[1]; break;
                                        case 'ID_MODEL': obj.model = pair[1]; break;
                                        case 'ID_PATH': obj.devID = '/dev/disk/by-path/' + pair[1]; break;
                                    }
                                });
                                
                                execCommand('lsblk -l -b -d -o SIZE,STATE,PHY-SEC ' + input,
                                    function(stdout) {
                                        var parms = stdout.split('\n')[1].split(' ').filter(function(parm) {
                                            return parm.length > 0;
                                        });
                                        
                                        obj.rawSizeInBytes = parseInt(parms[0], 10);
                                        
                                        if (parms[1] === 'running') {
                                            obj.status = 'online';
                                        } else {
                                            obj.status = 'offline';
                                        }
                                        
                                        obj.sectorSizeInBytes = parseInt(parms[2], 10);
                                        
                                        callback(obj);
                                    },
                                    function(err) {
                                        callback('Cannot execute disk.info command', true);
                                    });
                            },
                            function (err) {
                                callback('Cannot execute disk.info command', true);
                            });
                    } else {
                        callback('The device "' + input + '" is not ' +
                            'a block device', true);
                    }
                });
            },
            windows: function(args, input, callback) {
                execCommand('wmic diskdrive where DeviceID="' +
                    input.replace(regex.backslash, '\\\\') + '" list/format:value',
                    function(stdout) {
                        var obj = {};
                        stdout.replace(regex.windowsLinebreak, '').split('\n').filter(function(kv) {
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
                        
                        execCommand('wmic class Win32_LogicalDiskToPartition',
                            function(stdout) {
                                //console.log(stdout);
                                //console.dir(xml2js(stdout.replace(regex.windowsLinebreak, '')));
                                
                                callback(obj);
                            },
                            function(err) {
                                callback('Cannot execute disk.info command', true);
                            });
                    }, function(err) {
                        callback('Cannot execute disk.info command', true);
                    });
            }
        }
    };