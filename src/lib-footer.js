function platformInfoReady() {
    platformInfoIsReady = true;
    unprocessedCalls.forEach(function(cmd) {
        exports.callCmd.apply(null, cmd);
    });
}
