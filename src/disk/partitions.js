// notes:
// udev block stat: https://www.kernel.org/doc/Documentation/block/stat.txt
// lsblk -b -l -o NAME,TYPE,MOUNTPOINT,KNAME,PHY-SEC /dev/sda3
// findmnt -kl
cmds['disk.partitions'] = {
    desc: 'Returns an array of partition information objects for a particular disk.',
    input: {
        type: 'disk',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            var partList = [],
                calls = 0;
            
            function processPartition(stdout) {
                stdoutToArray(stdout).forEach(function(part, idx, parts) {
                    partList.push({
                        lvm: false,
                        encrypted: false,
                        boot: false
                    });
                    
                    getBlockSize(part, idx);
                    getPartInfo(part, idx);
                });
            }
            
            function getBlockSize(part, idx) {
                calls++;
                
                fs.stat(part, function(err, stats) {
                    if (err) {
                        callback('Error getting block size for partition', true);
                    }
                    
                    calls--;
                    partList[idx].blockSize = stats.blksize;
                    
                    if (calls === 0) {
                        callback(partList);
                    }
                });
            }
            
            function getPartInfo(part, idx) {
                calls++;
                
                execCommand('udevadm info -q property -n ' + part,
                    function(stdout) {
                        calls--;
                        
                        stdoutToArray(stdout).forEach(function(kv) {
                            var pair = kv.split('=');
                            switch (pair[0]) {
                                case 'ID_FS_TYPE':
                                    partList[idx].fs = pair[1]; break;
                                case 'DEVNAME':
                                    partList[idx].dev = pair[1]; break;
                                case 'UDISKS_PARTITION_SIZE':
                                    partList[idx].rawSizeInBytes =
                                        parseInt(pair[1], 10); break;
                                case 'UDISKS_PARTITION_FLAGS':
                                    if (pair[1] === 'boot') {
                                        partList[idx].boot = true;
                                    }
                                    break;
                            }
                        });
                        
                        getNumBlocks(idx);
                        getMounts(idx);
                    },
                    function(err) {
                        callback('Error retrieving udev partition information', true);
                    });
            }
            
            function getLVMfreeSpace(idx, mounts) {
                Object.keys(partList[idx].lvmGroups).forEach(function(vg) {
                    partList[idx].lvmGroups[vg].forEach(function(lv) {
                        mounts.some(function(mnt) {
                            var tokens = tokenize(mnt);
                            if (tokens[0] === (lv.luks ? lv.luksDev : lv.lvDev)) {
                                lv.rawSizeInBytes = parseInt(tokens[1], 10);
                                lv.freeSpaceInBytes = parseInt(tokens[3], 10) * 1024;
                                return true;
                            }
                        });
                    });
                });
            }
            
            function getFreeSpace(idx) {
                calls++;
                
                execCommand('df',
                    function(stdout) {
                        calls--;
                        var mounts = stdoutToArray(stdout).slice(1);
                        
                        partList[idx].freeSpaceInBytes = 0;
                        
                        if (!partList[idx].lvm) { // no lvm
                            if (!partList[idx].luks) { // no luks
                                mounts.some(function(mnt) {
                                    var tokens = tokenize(mnt);
                                    if (tokens[0] === partList[idx].dev) {
                                        partList[idx].freeSpaceInBytes =
                                            parseInt(tokens[3], 10) * 1024;
                                        return true;
                                    }
                                });
                            } else { // luks
                                mounts.some(function(mnt) {
                                    var tokens = tokenize(mnt);
                                    if (tokens[0] === partList[idx].luksDev) {
                                        partList[idx].freeSpaceInBytes =
                                            parseInt(tokens[3], 10) * 1024;
                                        return true;
                                    }
                                });
                            }
                        } else { // uses lvm
                            getLVMfreeSpace(idx, mounts);
                        }
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot retrieve df information', true);
                    });
            }
            
            function getNumBlocks(idx) {
                calls++;
                var devPath = partList[idx].dev.split('/');
                
                execCommand('egrep \'\\s' + devPath[devPath.length - 1] +
                    '$\' /proc/partitions | awk \'{print $3}\'',
                    function(stdout) {
                        calls--;
                        partList[idx].blocks = parseInt(stdout, 10);
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot determine number of ' +
                            'blocks for partition ' + idx, true);
                    });
            }
            
            function getLVMInfo(part, mounts) {
                part.lvm = true;
                part.lvmGroups = {};
                
                mounts.forEach(function(mnt, idx, arr) {
                    var tokens = tokenize(mnt);
                    
                    if (tokens[2] === 'lvm') {
                        var lvmInfo = tokens[0].split('-');
                        if (!part.lvmGroups.hasOwnProperty(lvmInfo[0])) {
                            part.lvmGroups[lvmInfo[0]] = [];
                        }
                        
                        if (idx === arr.length - 1) {
                            part.lvmGroups[lvmInfo[0]].encrypted = false;
                            part.lvmGroups[lvmInfo[0]].push({
                                luks: false,
                                mount: tokens[3],
                                lvName: lvmInfo[1],
                                lvDev: '/dev/' + tokens[4]
                            });
                        } else if (tokenize(arr[idx + 1])[2] === 'crypt') {
                            var ctokens = tokenize(arr[idx + 1]);
                            part.lvmGroups[lvmInfo[0]].encrypted = true;
                            part.lvmGroups[lvmInfo[0]].push({
                                luks: true,
                                luksUUID: ctokens[0],
                                luksDev: '/dev/' + ctokens[4],
                                mount: ctokens[3],
                                lvName: lvmInfo[1],
                                lvDev: '/dev/' + tokens[3]
                            });
                        } else {
                            callback('Cannot determine determine LVM information', true);
                        }
                    }
                });
            }
            
            function getMounts(idx) {
                calls++;
                execCommand('lsblk -b -l -n -o NAME,TYPE,MOUNTPOINT,KNAME ' +
                    partList[idx].dev + '',
                    function(stdout) {
                        calls--;
                        
                        var arr = stdoutToArray(stdout);
                        
                        if (arr.length === 1) { // not encrypted, no lvm
                            partList[idx].mount = tokenize(arr[0])[2];
                        } else if (arr.length > 1) { // could be encrypted, could use lvm
                            var tokens = tokenize(arr[1]);
                            
                            if (tokens[2] === 'lvm') { // lvm, could use encrypted volumes
                                getLVMInfo(partList[idx], arr.slice(1));
                            } else if (tokens[2] === 'crypt') { // no lvm, uses luks
                                partList[idx].encrypted = true;
                                partList[idx].luks = true;
                                partList[idx].luksUUID = tokens[0];
                                partList[idx].luksDev = '/dev/' + tokens[4];
                                partList[idx].mount = tokens[3];
                            } else {
                                callback('Unable to process mount information', true);
                            }
                        } else {
                            callback('Cannot determine mounts for partition ' +
                                idx, true);
                        }
                        
                        getFreeSpace(idx);
                    },
                    function(err) {
                        callback('Cannot get partition mounts', true);
                    });
            }
            
            execCommand('ls /dev/disk/by-path/' +
                '$(udevadm info -q property -n ' + input + ' | egrep ID_PATH | ' +
                'awk -F= \'{print $2}\')* | egrep part',
                processPartition,
                function(err) {
                    callback('Cannot find partitions on device', true);
                });
        },
        windows: function(args, input, callback) {
            var partList = [],
                calls = 0;
                
            function getPartInfo(part) {
                calls++;
                execCommand('wmic partition where (DeviceID = "' +
                    part.dev + '") list/format:value',
                    function(stdout) {
                        calls--;
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
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Error retrieving partition information', true);
                    });
            }
            
            function logicalDiskToPartition() {
                calls++;
                execCommand('wmic path win32_logicaldisktopartition get /format:value',
                    function(stdout) {
                        calls--;
                        stdoutToArray(stdout).forEach(function(str, idx, arr) {
                            var parts = str.split('=');
                            
                            if (parts[0] === 'Antecedent') {
                                var dev = parts[2].replace(regex.doubleQuote, ''),
                                    mount = arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '');
                                
                                partList.some(function(part, i) {
                                    if (part.dev === dev) {
                                        part.mount = mount;
                                        logicalPartitionInfo(part);
                                        return true;
                                    }
                                });
                            }
                        });
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot determine logical partitions', true);
                    });             
            }
            
            function logicalPartitionInfo(part) {
                calls++;
                execCommand('wmic logicaldisk where DeviceID="' +
                    part.mount + '" list/format:value',
                    function(stdout) {
                        calls--;
                        stdoutToArray(stdout).forEach(function(kv) {
                            var pair = kv.split('=');
                            
                            switch (pair[0]) {
                                case 'FileSystem':
                                    part.fs = pair[1]; break;
                                case 'FreeSpace':
                                    part.freeSpaceInBytes = parseInt(pair[1], 10); break;
                            }
                        });
                        
                        if (calls === 0) {
                            callback(partList);
                        }
                    },
                    function(err) {
                        callback('Cannot gather logical disk information', true);
                    });
            }
                
            execCommand('wmic path win32_diskdrivetodiskpartition get /format:value',
                function(stdout) {                    
                    stdoutToArray(stdout).forEach(function(str, idx, arr) {
                        var parts = str.split('=');
                        if (parts[0] === 'Antecedent' &&
                            '"' + input + '""' === parts[2]) {
                            partList.push({
                                lvm: false,
                                encrypted: false,
                                freeSpaceInBytes: 0,
                                dev: arr[idx + 1].split('=')[2].replace(regex.doubleQuote, '')
                            });
                        }
                    });
                        
                    partList.forEach(function(part, idx) {
                        getPartInfo(part);
                    });
                    
                    logicalDiskToPartition();
                },
                function(err) {
                    callback('Cannot execute disk.info command', true);
                });
        }
    }
};