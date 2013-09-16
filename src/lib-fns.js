exports.callCmd = function callCmd(cmdName, args, input, callback) {
    if (!validCommand(cmdName)) {
        bugOut('Invalid command name called "' + cmdName + '"');
    } else if (!cmds[cmdName].cmd.hasOwnProperty(platform)) {
        bugOut('Cannot execute command "' + cmdName + '" on the "' +
            platform + '" platform');
    } else if (cmds[cmdName].requiresInput &&
        typeof input === 'undefined') {
        bugOut('Command "' + cmdName + '" requires input');
    } else if (arguments.length === 2) {
        if (typeof args !== 'function') {
            bugOut('Callback function is required');
        } else {
            cmds[cmdName].cmd[platform](null, null, args);
        }
    } else if (typeof callback !== 'function') {
        bugOut('Callback function is required');
    } else {
        cmds[cmdName].cmd[platform](args, input, callback);
    }
};
