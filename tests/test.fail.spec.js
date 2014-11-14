'use strict';

var chai = require('chai');
var expect = chai.expect;

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;


describe('COVERAGE Tests', function () {
    describe('TEST TEST', function () {
        it('should BE TRUE', function (done) {
            expect(true).to.be.false;
            done();
        });
    });
});

