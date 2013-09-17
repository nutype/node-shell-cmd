
var origPipe = buildPipe(process.argv.slice(2));

if (origPipe.length === 0) {
    bugOut('Invalid command string specified');
} else {
    nextCommand(origPipe, origPipe[0][2], function(obj) {
        console.log(JSON.stringify(obj));
    });
}