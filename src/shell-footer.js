nextCommand(buildPipe(process.argv.slice(2)), undefined, function(obj) {
    console.log(JSON.stringify(obj));
});
