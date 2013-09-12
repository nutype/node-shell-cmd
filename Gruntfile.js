module.exports = function(grunt) {
    // make sure line endings are standardized
    grunt.util.linefeed = '\n';
    
    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            'node-shell-cmd': {
                src: [
                    'src/header.js',
                    'src/fns.js',
                    // arr
                    'src/arr/first.js',
                    'src/arr/last.js',
                    'src/arr/length.js',
                    // disk
                    //'src/disk/info.js',
                    // disks
                    // disks.all
                    'src/disks/all/devNames.js',
                    'src/disks/all/list.js',
                    // disks.local
                    'src/disks/local/list.js',
                    // is
                    'src/is/blockDev.js',
                    'src/is/charDev.js',
                    'src/is/dir.js',
                    'src/is/fifo.js',
                    'src/is/file.js',
                    'src/is/root.js',
                    'src/is/socket.js',
                    'src/is/symlink.js',
                    'src/footer.js'
                ],
                dest: 'build/node-shell-cmd'
            }
        },
        jshint: {
            all: [
                'build/node-shell-cmd'
            ]
        },
        chmod: {
            options: {
                mode: '755'
            },
            'node-shell-cmd': {
                src: ['build/node-shell-cmd']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-chmod');
    
    grunt.registerTask('default',
        [
            'concat:node-shell-cmd',
            'chmod',
            'jshint'
        ]
    );
};