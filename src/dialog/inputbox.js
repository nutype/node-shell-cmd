cmds['dialog.inputbox'] = {
    desc: 'Simple inputbox dialog box',
    args: {
        title: {
            type: 'string',
            desc: 'The title for the inputbox',
            required: true
        },
        chars: {
            type: 'number',
            desc: 'The total number of characters for the inputbox.',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 10,
                output = '';
                
            if (args.chars < 20) {
                callback('Inputlist chars arg must be at least 20', true);
                return;
            }

            execDialogCmd([
                '--inputbox',
                args.title,
                height,
                args.chars],
                function(code, result) {
                    if (typeof result === 'string') {
                        output = result.replace(regex.doubleQuote, '');
                    }
                    
                    callback({
                        ok: (code === 0 ? true : false),
                        output: output
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};