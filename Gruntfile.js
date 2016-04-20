module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: [ 'src/*.js' ]
        },

        uglify: {
            jslib: {
                options: {
                    sourceMap: true
                },
                files: {
                    'dist/lib.min.js': [
                        'src/lib/three.min.js',
                        'src/lib/detect.min.js',
                        'src/lib/CanvasRenderer.js',
                        'src/lib/Projector.js',
                        'src/lib/stats.js',
                        'src/lib/jquery-1.11.3.min.js',
                        'src/lib/screenfull.min.js',
                        'src/lib/clipboard.min.js',
                        'src/lib/jquery.fullscreen-0.4.1.min.js',
                        'src/lib/jquery.magnific-popup.min.js',
                        'src/lib/js.cookie.min.js'
                    ]
                }
            },
            jsapp: {
                options: {
                    sourceMap: true
                },
                files: {
                    'dist/app.min.js': [
                        'src/api.js',
                        'src/class.js',
                        'src/functions.js',
                        'src/listener.js',
                        'src/view.js',
                        'src/ui.js',
                        'src/uiListener.js',
                        'src/help.js',
                        'src/user.js',
                        'src/loader.js',
                        'src/gyrobtn.js',
                        'src/likelist.js',
                        'src/uiUtils.js',
                        'src/devices.js',
                        'src/application.js'
                    ]
                }
            }
        },

        cssmin: {
            dist: {
                options: {
                },
                files: {
                    'dist/all.min.css': [ 'dist/style.css', 'css/lib/*.css' ]
                }
            }
        },

        postcss: {
            lint: {
                options: {
                    processors: [
                        require('stylelint')({
                            config: {
                                'extends': 'stylelint-config-standard'
                            }
                        })
                    ]
                },
                src: 'css/*.css',
                dest: 'dist/.tmp.css'
            },
            transform: {
                options: {
                    processors: [
                        require('postcss-cssnext')(),
                        require('precss')()
                    ]
                },
                src: 'css/style.css',
                dest: 'dist/style.css'
            }
        },

        shell: {
            clean: {
                command: 'rm -rf dist/*'
            },
            moveimgs: {
                command: 'cp -r css/images dist/'
            }
        },

        watch: {
            jslib: {
                files: [ 'src/lib/*.js' ],
                tasks: [ 'uglify:jslib' ]
            },
            jsapp: {
                files: [ 'src/*.js' ],
                tasks: [ 'eslint', 'uglify:jsapp' ]
            },
            css: {
                files: [ 'css/*.css' ],
                tasks: [ 'css' ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('js', [ 'eslint', 'uglify' ]);
    grunt.registerTask('css', [ 'postcss', 'cssmin', 'shell:moveimgs' ]);
    grunt.registerTask('clean', [ 'shell:clean' ]);
    grunt.registerTask('default', [ 'clean', 'js', 'css' ]);
    grunt.registerTask('dev', [ 'default', 'watch' ]);
};

