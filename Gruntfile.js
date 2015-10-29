
module.exports = function(grunt) {
    grunt.initConfig({
        uglify: {
            dist: {
                files: {
                    'dist/toppano.min.js': [
                        'src/lib/three.min.js',
                        'src/lib/detect.min.js',
                        'src/lib/CanvasRenderer.js',
                        'src/lib/Projector.js',
                        'src/lib/stats.js',
                        'src/api.js',
                        'src/class.js',
                        'src/functions.js',
                        'src/view.js',
                        'src/listener.js'
                    ]
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify']); // Default grunt tasks maps to grunt

};
