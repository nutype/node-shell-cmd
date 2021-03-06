cmds['dialog.msgbox'] = {
    desc: 'Simple message box dialog box',
    args: {
        msg: {
            type: 'string',
            desc: 'The message to display to the user.',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 5,
                width = 40;
                
            if (args.msg.length === 0) {
                callback('Message box message cannot be empty', true);
                return;
            } else {
                height += Math.floor(args.msg.length / 30); 
            }

            execDialogCmd([
                '--msgbox',
                args.msg,
                height,
                width],
                function(code, result) { 
                    callback({
                        ok: (code === 0 ? true : false)
                    });
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};