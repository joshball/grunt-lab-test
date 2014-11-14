'use strict';
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Add our custom tasks.
    grunt.loadTasks('tasks');

    // Project configuration.
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true            },
            all: {
                src: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
            }
        },
        labTest: {
            options: {
                disableLeakDetection : false,
                color       : true,
                coverage    : false,
                verbose     : true,
                minCoverage : 0,
                reporter: 'console'
            },
            all: {
                src: ['tests/**/*.js']
            },
            fail: {
                src: ['tests/**/*.fail.*.js']
            },
            unit: {
                src: ['tests/**/*.unit.*.js']
            },
            integration: {
                src: ['tests/**/*.integration.*.js']
            },
            //unsupportedOption: {
            //    options: {
            //        flat       : true
            //    },
            //    src: ['tests/**/*.integration.*.js']
            //},
            coverage: {
                src: ['tests/**/*.coverage.*.js']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'labTest']);
};