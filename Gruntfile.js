module.exports = function(grunt) {
    // make sure line endings are standardized
    grunt.util.linefeed = '\n';
    
    var cmds = [
        // arr
        'src/arr/first.js',
        'src/arr/last.js',
        'src/arr/length.js',
        // convert
        'src/convert/b/gb.js',
        'src/convert/b/kb.js',
        'src/convert/b/mb.js',
        'src/convert/b/tb.js',
        // dialog
        'src/dialog/checklist.js',
        'src/dialog/inputbox.js',
        'src/dialog/menu.js',
        'src/dialog/radiolist.js',
        // disk
        'src/disk/availableSpaceInBytes.js',
        'src/disk/info.js',
        'src/disk/partitions.js',
        // disks
        // disks.all
        'src/disks/all/list.js',
        // disks.local
        'src/disks/local/list.js',
        // is
        'src/is/blockDev.js',
        'src/is/charDev.js',
        'src/is/dir.js',
        'src/is/disk.js',
        'src/is/fifo.js',
        'src/is/file.js',
        'src/is/opticalDrive.js',
        'src/is/root.js',
        'src/is/socket.js',
        'src/is/symlink.js',
        // obj
        'src/obj/prop.js'
    ];
    
    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            'node-shell-cmd': {
                src: [
                    'src/shell-shebang.sh',
                    'src/header.js',
                    'src/generic-fns.js',
                    'src/shell-fns.js'
                ].concat(cmds).concat([
                    'src/shell-footer.js',
                    'src/platform-info.js',
                    'src/footer.js'
                ]),
                dest: 'bin/node-shell-cmd'
            },
            'node-shell-cmd.js': {
                src: [
                    'src/header.js',
                    'src/generic-fns.js',
                    'src/lib-fns.js'
                ].concat(cmds).concat([
                    'src/platform-info.js',
                    'src/footer.js'
                ]),
                dest: 'lib/node-shell-cmd.js'
            }
        },
        jshint: {
            all: [
                'bin/node-shell-cmd',
                'lib/node-shell-cmd.js'
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
            'concat',
            'chmod',
            'jshint'
        ]
    );
};