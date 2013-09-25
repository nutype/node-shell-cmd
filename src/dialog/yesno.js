cmds['dialog.yesno'] = {
    desc: 'Simple Yes/No dialog box',
    args: {
        question: {
            type: 'string',
            desc: 'The Yes/No question to the user.',
            required: true
        }
    },
    cmd: {
        linux: function(args, input, callback) {
            var height = 5,
                width = 40;
                
            if (args.question.length === 0) {
                callback('Yes/No dialog cannot have empty question', true);
                return;
            } else {
                height += Math.floor(args.question.length / 30); 
            }

            execDialogCmd([
                '--yesno',
                args.question,
                height,
                width],
                function(code, result) {
                    callback((code === 0 ? true : false));
                },
                function(err) {
                    callback('Error executing dialog command', true);
                });
        }
    }
};