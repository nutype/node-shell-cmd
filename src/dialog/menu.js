cmds['dialog.menu'] = {
    desc: 'Simple menu dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the menu',
            required: true
        },
        list: {
            type: 'array',
            desc: 'The list of different menu options with each value being ' +
                'a menu option string',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 10,
                width = 40,
                listHeight = 0,
                list = [],
                selected = 0;
                
            if (args.list.length === 0) {
                callback('Menu list cannot be missing', true);
                return;
            }
            
            args.list.forEach(function(val, idx) {
                height++;
                listHeight++;
                list.push(idx, val);
            });

            execDialogCmd([
                '--menu',
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
                        selected: selected
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};