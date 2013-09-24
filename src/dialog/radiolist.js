cmds['dialog.radiolist'] = {
    desc: 'Simple radiolist dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the radiolist',
            required: true
        },
        list: {
            type: 'array',
            desc: 'The list of radios. Every item is a radio string and the ' +
                'first index is the default selection',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 10,
                width = 40,
                listHeight = 0,
                counter = 0,
                list = [],
                selected = 0;
                
            if (args.list.length === 0) { // not even length
                callback('Invalid list specified', true);
                return;
            }
                
            args.list.forEach(function(val, idx) {
                height++;
                listHeight++;
                list.push(counter++, val, (idx === 0 ? 'on' : 'off'));
            });

            execDialogCmd([
                '--radiolist',
                args.title,
                height,
                width,
                listHeight].concat(list),
                function(code, result) {
                    if (typeof result === 'string') {
                        selected = parseInt(
                            result.replace(regex.doubleQuote, ''), 10);
                    }
                    
                    callback({
                        ok: (code === 0 ? true : false),
                        list: selected
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};