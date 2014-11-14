'use strict';

var lab = require('lab');
var Fs = require('fs');
var _ = require('lodash');
var Path = require('path');

var Coverage = lab.coverage;
var RunnerReport = lab.report;


var internals = {};

// This task was inspired by mochaTest

module.exports = function (grunt) {


    grunt.registerMultiTask('labTest', 'Run node tests with Lab', function () {
        var done = this.async();
        var options = this.options();
        //var files = this.files;

        try {
            internals.run(options, this.filesSrc, done);
        }
        catch(e){
            if(e.ok){
                grunt.log.write(e.message);
                grunt.log.ok();
                done();
                return;
            }
            else {
                grunt.log.error(e.message);
                grunt.log.fail();
                done(false);
                return;
            }
        }
    });

    internals.run = function (options, filesSrc, done) {

        // options = grunt.config.get("labTest");
        // check if there are files to test
        if (filesSrc.length === 0) {
            throw new Warning('No files to check...');
        }

        var settings = internals.options(options);

        settings.coveragePath = process.cwd();
        settings.coverageExclude = ['test', 'node_modules'];
        settings.lintingPath = process.cwd();

        if (settings.coverage) {
            Coverage.instrument(settings);
        }

        if (settings.environment) {
            process.env.NODE_ENV = settings.environment;
        }

        if (settings.sourcemaps) {
            require('source-map-support').install();
        }

        var scripts = internals.traverse(filesSrc, settings);
        return RunnerReport(scripts, settings, function(arg){
            done();
        });
    };

    internals.traverse = function (filesSrc, options) {

        var traverse = function (path) {

            var files = [];

            var stat = Fs.statSync(path);
            if (stat.isFile()) {
                return path;
            }

            Fs.readdirSync(path).forEach(function (file) {

                file = Path.join(path, file);
                var stat = Fs.statSync(file);
                if (stat.isDirectory() &&
                    !options.flat) {

                    files = files.concat(traverse(file, options));
                    return;
                }

                if (stat.isFile() &&
                    /\.(js)$/.test(file) &&
                    Path.basename(file)[0] !== '.') {

                    files.push(file);
                }
            });

            return files;
        };

        var testFiles = [];
        filesSrc.forEach(function (path) {
            testFiles = testFiles.concat(traverse(path));
        });

        testFiles = testFiles.map(function (path) {
            return Path.resolve(path);
        });

        var scripts = [];
        if (testFiles.length) {
            testFiles.forEach(function (file) {

                global._labScriptRun = false;
                file = Path.resolve(file);
                var pkg = require(file);

                if (pkg.lab &&
                    pkg.lab._root) {

                    scripts.push(pkg.lab);

                    if (pkg.lab._cli) {
                        internals.applyOptions(options, pkg.lab._cli);
                    }
                }
                else if (global._labScriptRun) {
                    options.output.write('The file: ' + file + ' includes a lab script that is not exported via exports.lab');
                    return process.exit(1);
                }
            });
        }

        return scripts;
    };

    internals.applyOptions = function (parent, child) {
        Object.keys(child).forEach(function (key) {
            parent[key] = child[key];
        });
    };

    internals.options = function(gruntOptions){
        if(gruntOptions.flat){
            throw new Error('options.flat is not supported. use the grunt.task files');
        }
        var defaultOptions = {
            colors: null,                                   // true, false, null (based on tty)
            coverage: false,
            dry: false,
            environment: 'test',
            flat: false,
            globals: null,
            grep: null,
            ids: [],
            leaks: true,
            lint: false,
            output: process.stdout,
            parallel: false,
            path: ['test'],
            progress: 1,
            reporter: 'console',
            silence: false,
            sourcemaps: false,
            threshold: 0,
            timeout: 2000
            // assert: { incomplete(), count() },
            // coveragePath: process.cwd(),
            // coverageExclude: ['node_modules', 'test'],
            // flat: false,
            // schedule: true,
        };

        var options = _.extend({}, defaultOptions, gruntOptions);

        options.environment = options.environment && options.environment.trim();
        options.coverage = (options.coverage || options.threshold > 0 || options.reporter === 'html' || options.reporter === 'lcov' || options.reporter === 'clover');
        if (options.globals) {
            options.globals = options.globals.trim().split(',');
        }

        if (options.silence) {
            options.progress = 0;
        }
        else if (options.verbose) {
            options.progress = 2;
        }

        if (options.id) {
            options.ids = options.id;
        }
        return options;
    };

    function Warning(message) {
        this.name = 'Warning';
        this.ok = true;
        this.message = message;
    }
    Warning.prototype = new Error();
    Warning.prototype.constructor = Warning;

};
