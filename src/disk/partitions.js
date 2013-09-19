// notes:
// udev block stat: https://www.kernel.org/doc/Documentation/block/stat.txt
cmds['disk.partitions'] = {
    desc: 'Returns an array of partition information objects for a particular disk.',
    input: {
        type: 'disk',
        desc: 'The /dev path in Linux or the \\\\.\\PHYSICALDRIVE name in Windows'
    },
    cmd: {
        linux: function(args, input, callback) {
            var partList = [];
            
            execCommand('ls /dev/disk/by-path/' +
                '$(udevadm info -q property -n ' + input + ' | egrep ID_PATH | ' +
                'awk -F= \'{print $2}\')* | egrep part',
                function(stdout) {
                    var udevCounter = 0,
                        blkSizeCounter = 0,
                        blkCountCounter = 0;
                    
                    stdoutToArray(stdout).forEach(function(part, idx, parts) {
                        partList.push({});
                        
                        fs.stat(part, function(err, stats) {
                            if (err) {
                                callback('Error getting block size for partition', true);
                            }
                            
                            blkSizeCounter++;
                            partList[idx].blockSize = stats.blksize;
                            
                            if (udevCounter === parts.length &&
                                blkSizeCounter === parts.length &&
                                blkCountCounter === parts.length) {
                                callback(partList);
                            }
                        });
                        
                        execCommand('udevadm info -q property -n ' + part,
                            function(stdout) {
                                udevCounter++;
                                
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
                                    }
                                });
                                
                                var devPath = partList[idx].dev.split('/');
                                execCommand('egrep ' + devPath[devPath.length - 1] +
                                    ' /proc/partitions | awk \'{print $3}\'',
                                    function(stdout) {
                                        blkCountCounter++;
                                        partList[idx].blocks = parseInt(stdout, 10);
                                        
                                        if (udevCounter === parts.length &&
                                            blkSizeCounter === parts.length &&
                                            blkCountCounter === parts.length) {
                                            callback(partList);
                                        }
                                    },
                                    function(err) {
                                        callback('Cannot determine number of ' +
                                            'blocks for partition ' + idx, true);
                                    });
                            },
                            function(err) {
                                callback('Error retrieving udev partition information', true);
                            });
                    });
                },
                function(err) {
                    callback('Cannot find partitions on device', true);
                });
        },
        windows: function(args, input, callback) {
            
        }
    }
};