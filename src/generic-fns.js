function bugOut(msg) {
    console.error(msg);
    console.trace();
    process.exit(1);
}

function validCommand(cmd) {
    return typeof cmd === 'string' &&
        cmds.hasOwnProperty(cmd);
}

function execCommand(cmd, callback) {
    exec(cmd, function(err, stdout, stderr) {
        if (err !== null ||
            stderr.length > 0) {
            callback({
                err: err,
                code: err.code,
                signal: err.signal,
                stderr: stderr
            });
        } else {
            callback(stdout);
        }
    });
}

function stdoutToArray(stdout, filters) {
    filters = (Array.isArray(filters) ? filters : []);
    
    return stdout.replace(regex.windowsLinebreak, '')
                 .replace(regex.trailingSpaces, '\n')
                 .split('\n')
                 .filter(function(line) {
                    return !regex.blankLine.test(line) &&
                        !filters.some(function(f) {
                            return f.test(line);
                        });
                 });
}
