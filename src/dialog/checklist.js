cmds['dialog.checklist'] = {
    desc: 'Simple checklist dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the checklist',
            required: true
        },
        list: {
            type: 'array',
            desc: 'The list of checkboxes. Even index is an option string and ' +
                'odd index is whether or not it is selected',
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
                listResult = [];
                
            if (args.list.length === 0 ||
                args.list.length % 2 !== 0) { // not even length
                callback('Invalid list specified', true);
                return;
            }
                
            args.list.forEach(function(val, idx) {
                if (idx % 2 === 0) { // even
                    height++;
                    listHeight++;
                    listResult.push(false);
                    list.push(counter++, val, (args.list[idx + 1] ? 'on' : 'off'));
                }
            });

            execDialogCmd([
                '--checklist',
                args.title,
                height,
                width,
                listHeight].concat(list),
                function(code, result) {
                    if (typeof result === 'string') {
                        result.split(' ').forEach(function(val) {
                            listResult[
                                parseInt(val.replace(regex.doubleQuote, ''), 10)] = true;
                        });
                    }
                    
                    callback({
                        ok: (code === 0 ? true : false),
                        list: listResult
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};