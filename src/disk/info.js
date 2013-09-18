cmds['disk.info'] = {
    desc: 'Gets detailed information for a particular disk.',
    input: {
        type: 'string',
        desc: 'The /dev path in Linux and the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            cmds['is.blockDev'].cmd.all(null, input, function(isBlockDev) {
                if (isBlockDev) {
                    // num sectors: blockdev --getsize /dev/sda (requires root)
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
                                    case 'ID_PATH': obj.devID = '/dev/disk/by-path/' + pair[1]; break;
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
                            
                            callback(obj);
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
            if (!regex.windowsPhysDrive.test(input)) {
                bugOut('The command "disk.info" requires a valid ' +
                    '\\\\.\\PHYSICALDRIVE name');
            }
            var driveNum = regex.windowsPhysDriveNum.exec(input)[1];
            
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
                    
                    execCommand('wmic path win32_diskdrivetodiskpartition get /format:value',
                        function(stdout) {
                            // use the info gained from the output to get
                            // basic info on the partitions
                            obj.partitions = [];
                            
                            stdoutToArray(stdout).some(function(str, idx, arr) {
                                var parts = str.split('=');
                                if (parts[0] === 'Antecedent' &&
                                    '"' + input + '""' === parts[2]) {
                                    obj.partitions.push({
                                        dev: arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '')
                                    });
                                }
                            });
                            
                            var execCmds = 0,
                                execFinished = 0;
                                
                            obj.partitions.forEach(function(part, idx) {
                                execCmds++;
                                execCommand('wmic partition where (DeviceID = "' +
                                    part.dev + '") list/format:value',
                                    function(stdout) {
                                        stdoutToArray(stdout).forEach(function(kv) {
                                            var pair = kv.split('=');
                                            
                                            switch (pair[0]) {
                                                case 'BlockSize':
                                                    part.blockSize = parseInt(pair[1], 10); break;
                                                case 'BootPartition':
                                                    if (pair[1] === 'TRUE') {
                                                        part.boot = true;
                                                    } else {
                                                        part.boot = false;
                                                    }
                                                    break;
                                                case 'NumberOfBlocks':
                                                    part.blocks = parseInt(pair[1], 10); break;
                                                case 'Size':
                                                    part.rawSizeInBytes = parseInt(pair[1], 10); break;
                                            }
                                        });
                                        
                                        execFinished++;
                                        
                                        if (execCmds === execFinished) {
                                            callback(obj);
                                        }
                                    }, function(err) {
                                        callback('Cannot gather partition information', true);
                                    });
                                    
                                
                            });
                            
                            execCmds++;
                            execCommand('wmic path win32_logicaldisktopartition get /format:value',
                                function(stdout) {
                                    stdoutToArray(stdout).forEach(function(str, idx, arr) {
                                        var parts = str.split('=');
                                        
                                        if (parts[0] === 'Antecedent') {
                                            var dev = parts[2].replace(regex.doubleQuote, ''),
                                                mount = arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '');
                                            
                                            obj.partitions.some(function(part, i) {
                                                if (part.dev === dev) {
                                                    obj.partitions[i].mount = mount;
                                                    
                                                    execCmds++;
                                                    execCommand('wmic logicaldisk where DeviceID="' + mount + '" list/format:value',
                                                            function(stdout) {
                                                                
                                                                stdoutToArray(stdout).forEach(function(kv) {
                                                                    var pair = kv.split('=');
                                                                    
                                                                    switch (pair[0]) {
                                                                        case 'FileSystem':
                                                                            part.fs = pair[1]; break;
                                                                        case 'FreeSpace':
                                                                            part.freeSpaceInBytes = parseInt(pair[1], 10); break;
                                                                    }
                                                                });
                                                                
                                                                execFinished++;
                                                                if (execCmds === execFinished) {
                                                                    callback(obj);
                                                                }
                                                            },
                                                            function(err) {
                                                                callback('Cannot gather logicaldisk information', true);
                                                            });
                                                        
                                                            return true;
                                                        }
                                                    });
                                        }
                                    });
                                    
                                    execFinished++;
                                    if (execCmds === execFinished) {
                                        callback(obj);
                                    }
                                },
                                function(err) {
                                    callback('Cannot gather partition information', true);
                                });
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