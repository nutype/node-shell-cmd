    cmds['disk.info'] = {
        desc: 'Gets detailed information for a particular disk.',
        requiresInput: true,
        cmd: {
            linux: function(args, pipe, input, callback) {
                nextCommand([['is.blockDev', input]], function(result) {
                    if (result) {
                        execCommand('udevadm info -q property -n ' + input,
                            function(stdout) {
                                nextCommand(pipe, stdoutToArray(stdout), callback);
                            });
                    } else {
                        bugOut('The provided input "' + input + '" is not a ' +
                            'valid device name for the command "disk.info"');
                    }
                });
            },
            windows: function(args, pipe, input, callback) {
                //nextCommand([['is.dir', input]], function(result) {
                    //if (result) {
                        execCommand('wmic diskdrive where DeviceID="' +
                            input.replace(regex.backslash, '\\\\') + '" list/format:value',
                            function(stdout) {
                                var obj = {};
                                stdout.replace(regex.windowsLinebreak, '').split('\n').filter(function(kv) {
                                    return kv.length > 0;
                                }).forEach(function(kv) {
                                    var pair = kv.split('=');
                                    switch (pair[0]) {
                                        case 'DeviceID': obj.devName = pair[1]; break;
                                        case 'Manufacturer': obj.manf = pair[1]; break;
                                        case 'Model': obj.model = pair[1]; break;
                                        case 'BytesPerSector': obj.blockSize = pair[1]; break;
                                        case 'TotalSectors': obj.sectors = pair[1]; break;
                                        case 'TotalHeads': obj.heads = pair[1]; break;
                                        case 'TotalTracks': obj.tracks = pair[1]; break;
                                        case 'TracksPerCylinder': obj.tracksPerCyl = pair[1]; break;
                                    }
                                });
                                nextCommand(pipe, obj, callback);
                            });
                    /*} else {
                        bugOut('The provided input "' + input + '" is not a ' +
                            'valid device name for the command "disk.info"');
                    }
                });*/
            }
        }
    };