/* jshint expr:true */
'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mockery = require('mockery');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

var Xml2Js = require('xml2js');
var validator = require('validator');
var chai = require('chai'),
  expect = chai.expect;

var util = require('./../_testUtils');


// sub:generator options
var options = {};
var prompts = {};

/* +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */

describe('office:mail', function () {

  var projectDisplayName = 'My Office Add-in';
  var projectEscapedName = 'my-office-add-in';
  var manifestFileName = 'manifest-' + projectEscapedName + '.xml';

  beforeEach(function (done) {
    options = {
      name: projectDisplayName
    };
    
    // Since mail invokes commands, we
    // need to mock responding to the prompts for
    // info
    prompts = {
      buttonTypes: ['uiless'],
      functionFileUrl: 'https://localhost:8443/manifest-only/functions.html',
      iconUrl: 'https://localhost:8443/manifest-only/icon.png'
    };
    done();
  });

  /**
   * Test scrubbing of name with illegal characters
   */
  it('project name is alphanumeric only', function (done) {
    options = {
      name: 'Some\'s bad * character$ ~!@#$%^&*()',
      rootPath: '',
      tech: 'ng',
      extensionPoint: [
        'MessageReadCommandSurface', 
        'MessageComposeCommandSurface', 
        'AppointmentAttendeeCommandSurface', 
        'AppointmentOrganizerCommandSurface'
      ],
      startPage: 'https://localhost:8443/manifest-only/index.html'
    };

    // run generator
    helpers.run(path.join(__dirname, '../../generators/mail'))
      .withOptions(options)
      .withPrompts(prompts)
      .on('end', function () {
        var expected = {
          name: 'somes-bad-character',
          version: '0.1.0',
          devDependencies: {
            chalk: '^1.1.1',
            del: '^2.1.0',
            gulp: '^3.9.0',
            'gulp-load-plugins': '^1.0.0',
            'gulp-minify-css': '^1.2.2',
            'gulp-task-listing': '^1.0.1',
            'gulp-uglify': '^1.5.1',
            'gulp-webserver': '^0.9.1',
            minimist: '^1.2.0',
            'run-sequence': '^1.1.5',
            'xml2js': '^0.4.15',
            xmllint: 'git+https://github.com/kripken/xml.js.git'
          }
        };

        assert.file('package.json');
        util.assertJSONFileContains('package.json', expected);

        done();
      });
  });

  describe('run on existing project (non-empty folder)', function () {
    var addinRootPath = 'src/public';

    // generator ran at 'src/public' so for files
    //  in the root, need to back up to the root
    beforeEach(function (done) {
      // set to current folder
      options.rootPath = addinRootPath;
      done();
    });

    /**
     * Test addin when technology = ng
     */
    describe('technology:ng', function () {

      describe('Outlook extension points:MessageReadCommandSurface, MessageComposeCommandSurface, '
             + 'AppointmentAttendeeCommandSurface, AppointmentOrganizerCommandSurface', 
      function () {

        beforeEach(function (done) {
          // set language to html
          options.tech = 'ng';
  
          // set outlook form type
          options.extensionPoint = [
            'MessageReadCommandSurface', 
            'MessageComposeCommandSurface', 
            'AppointmentAttendeeCommandSurface', 
            'AppointmentOrganizerCommandSurface'
          ];

          helpers.run(path.join(__dirname, '../../generators/mail'))
            .withOptions(options)
            .withPrompts(prompts)
            .on('ready', function (gen) {
              util.setupExistingProject(gen);
            }.bind(this))
            .on('end', done);
        });

        afterEach(function () {
          mockery.disable();
        });
  
        /**
        * All expected files are created.
        */
        it('creates expected files', function (done) {
          var expected = [
            '.bowerrc',
            'bower.json',
            'gulpfile.js',
            'package.json',
            manifestFileName,
            'manifest.xsd',
            'tsd.json',
            'jsconfig.json',
            'tsconfig.json',
            addinRootPath + '/appcompose/index.html',
            addinRootPath + '/appcompose/app.module.js',
            addinRootPath + '/appcompose/app.routes.js',
            addinRootPath + '/appcompose/home/home.controller.js',
            addinRootPath + '/appcompose/home/home.html',
            addinRootPath + '/appcompose/services/data.service.js',
            addinRootPath + '/appread/index.html',
            addinRootPath + '/appread/app.module.js',
            addinRootPath + '/appread/app.routes.js',
            addinRootPath + '/appread/home/home.controller.js',
            addinRootPath + '/appread/home/home.html',
            addinRootPath + '/appread/services/data.service.js',
            addinRootPath + '/content/Office.css',
            addinRootPath + '/images/close.png',
            addinRootPath + '/images/hi-res-icon.png',
            addinRootPath + '/scripts/MicrosoftAjax.js'
          ];


          assert.file(expected);
          done();
        });
  
        /**
        * bower.json is good
        */
        it('bower.json contains correct values', function (done) {
          var expected = {
            name: 'ProjectName',
            version: '0.1.0',
            dependencies: {
              'microsoft.office.js': '*',
              jquery: '~1.9.1',
              angular: '~1.4.4',
              'angular-route': '~1.4.4',
              'angular-sanitize': '~1.4.4',
              'office-ui-fabric': '*'
            }
          };

          assert.file('bower.json');
          util.assertJSONFileContains('bower.json', expected);
          done();
        });
  
        /**
        * package.json is good
        */
        it('package.json contains correct values', function (done) {
          var expected = {
            name: 'ProjectName',
            description: 'HTTPS site using Express and Node.js',
            version: '0.1.0',
            main: 'src/server/server.js',
            dependencies: {
              express: '^4.12.2'
            },
            devDependencies: {
              chalk: '^1.1.1',
              del: '^2.1.0',
              gulp: '^3.9.0',
              'gulp-load-plugins': '^1.0.0',
              'gulp-minify-css': '^1.2.2',
              'gulp-task-listing': '^1.0.1',
              'gulp-uglify': '^1.5.1',
              'gulp-webserver': '^0.9.1',
              minimist: '^1.2.0',
              'run-sequence': '^1.1.5',
              xmllint: 'git+https://github.com/kripken/xml.js.git'
            }
          };

          assert.file('package.json');
          util.assertJSONFileContains('package.json', expected);
          done();
        });
  
        /**
        * manifest-*.xml is good
        */
        describe('manifest-*.xml contents', function () {
          var manifest = {};

          beforeEach(function (done) {
            var parser = new Xml2Js.Parser();
            fs.readFile(manifestFileName, 'utf8', function (err, manifestContent) {
              parser.parseString(manifestContent, function (err, manifestJson) {
                manifest = manifestJson;

                done();
              });
            });
          });

          it('has valid ID', function (done) {
            expect(validator.isUUID(manifest.OfficeApp.Id)).to.be.true;
            done();
          });

          it('has correct display name', function (done) {
            expect(manifest.OfficeApp.DisplayName[0].$.DefaultValue).to.equal(projectDisplayName);
            done();
          });
          
          it('has valid hi-res icon URL', function (done) {
            expect(manifest.OfficeApp.HighResolutionIconUrl[0].$.DefaultValue)
              .to.match(/^https:\/\/.+\.(png|jpe?g|gif|bmp)$/i);
            done();
          });

          it('has correct start page', function (done) {
            var valid = false;
            var subject = manifest.OfficeApp.FormSettings[0].Form[0]
                                  .DesktopSettings[0].SourceLocation[0].$.DefaultValue;

            if (subject === 'https://localhost:8443/appcompose/index.html' ||
              subject === 'https://localhost:8443/appread/index.html') {
              valid = true;
            }

            expect(valid, 'start page is not valid compose or edit form').to.be.true;
            done();
          });
  
          /**
          * Form for ItemRead present
          */
          it('includes form for ItemRead', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.FormSettings[0].Form, function (formSetting) {
              if (formSetting.$['xsi:type'] === 'ItemRead') {
                found = true;
              }
            });

            expect(found, '<Form xsi:type="ItemRead"> exist').to.be.true;
            done();
          });
  
          /**
          * Form for ItemEdit present
          */
          it('includes form for ItemEdit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.FormSettings[0].Form, function (formSetting) {
              if (formSetting.$['xsi:type'] === 'ItemEdit') {
                found = true;
              }
            });

            expect(found, '<Form xsi:type="ItemEdit"> exist').to.be.true;
            done();
          });
  
          /**
          * Rule for Mail Read present
          */
          it('includes rule for mail read', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Message' &&
                rule.$.FormType === 'Read') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Message" FormType="Read" />').to.be.true;
            done();
          });
  
          /**
          * Rule for Mail Edit present
          */
          it('includes rule for mail edit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Message' &&
                rule.$.FormType === 'Edit') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Message" FormType="Edit" />').to.be.true;
            done();
          });
  
          /**
          * Rule for Appointment Read present
          */
          it('includes rule for appointment read', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Appointment' &&
                rule.$.FormType === 'Read') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Appointment" FormType="Read" />').to.be.true;
            done();
          });
  
          /**
          * Rule for Appointment Edit present
          */
          it('includes rule for appointment edit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Appointment' &&
                rule.$.FormType === 'Edit') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Appointment" FormType="Edit" />').to.be.true;
            done();
          });

        }); // describe('manifest-*.xml contents')
  
        /**
        * tsd.json is good
        */
        describe('tsd.json contents', function () {
          var tsd = {};

          beforeEach(function (done) {
            fs.readFile('tsd.json', 'utf8', function (err, tsdJson) {
              tsd = JSON.parse(tsdJson);

              done();
            });
          });

          it('has correct *.d.ts references', function (done) {
            expect(tsd.installed).to.exist;
            // make sure the existing ones are present (to verify we didn't overwrite, but rather update)
            expect(tsd.installed['lodash/lodash.d.ts']).to.exist;
            // make sure the new ones are present
            expect(tsd.installed['angularjs/angular.d.ts']).to.exist;
            expect(tsd.installed['angularjs/angular-route.d.ts']).to.exist;
            expect(tsd.installed['angularjs/angular-sanitize.d.ts']).to.exist;
            expect(tsd.installed['office-js/office-js.d.ts']).to.exist;
            done();
          });

        }); // describe('tsd.json contents')
  
        /**
        * gulpfile.js is good
        */
        describe('gulpfule.js contents', function () {

          it('contains task \'help\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'help\',');
            done();
          });

          it('contains task \'default\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'default\',');
            done();
          });

          it('contains task \'serve-static\'', function (done) {

            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'serve-static\',');
            done();
          });
          
          it('contains task \'validate\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'validate\',');
            done();
          });
            
          it('contains task \'validate-forcatalog\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'validate-forcatalog\',');
            done();
          });
            
          it('contains task \'validate-forstore\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'validate-forstore\',');
            done();
          });
            
          it('contains task \'validate-highResolutionIconUrl\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'validate-highResolutionIconUrl\',');
            done();
          });

          it('contains task \'validate-xml\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'validate-xml\',');
            done();
          });
          
          it('contains task \'dist-remove\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'dist-remove\',');
            done();
          });
          
          it('contains task \'dist-copy-files\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'dist-copy-files\',');
            done();
          });
          
          it('contains task \'dist-minify\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'dist-minify\',');
            done();
          });
          
          it('contains task \'dist-minify-js\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'dist-minify-js\',');
            done();
          });
          
          it('contains task \'dist-minify-css\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'dist-minify-css\',');
            done();
          });
          
          it('contains task \'dist\'', function (done) {
            assert.file('gulpfile.js');
            assert.fileContent('gulpfile.js', 'gulp.task(\'dist\',');
            done();
          });

        }); // describe('gulpfile.js contents')

      }); // describe('Outlook extension points:MessageReadCommandSurface,
          // MessageComposeCommandSurface, AppointmentAttendeeCommandSurface,
          // AppointmentOrganizerCommandSurface')
      
      describe('Outlook extension points:MessageReadCommandSurface, '
             + 'AppointmentAttendeeCommandSurface', 
      function () {

        beforeEach(function (done) {
          // set language to html
          options.tech = 'ng';
  
          // set outlook form type
          options.extensionPoint = [
            'MessageReadCommandSurface', 
            'AppointmentAttendeeCommandSurface'
          ];

          helpers.run(path.join(__dirname, '../../generators/mail'))
            .withOptions(options)
            .withPrompts(prompts)
            .on('ready', function (gen) {
              util.setupExistingProject(gen);
            }.bind(this))
            .on('end', done);
        });

        afterEach(function () {
          mockery.disable();
        });
  
        /**
        * All expected files are created.
        */
        it('creates expected files', function (done) {
          var expected = [
            '.bowerrc',
            'bower.json',
            'gulpfile.js',
            'package.json',
            manifestFileName,
            'manifest.xsd',
            'tsd.json',
            'jsconfig.json',
            'tsconfig.json',
            addinRootPath + '/appread/index.html',
            addinRootPath + '/appread/app.module.js',
            addinRootPath + '/appread/app.routes.js',
            addinRootPath + '/appread/home/home.controller.js',
            addinRootPath + '/appread/home/home.html',
            addinRootPath + '/appread/services/data.service.js',
            addinRootPath + '/content/Office.css',
            addinRootPath + '/images/close.png',
            addinRootPath + '/images/hi-res-icon.png',
            addinRootPath + '/scripts/MicrosoftAjax.js'
          ];


          assert.file(expected);
          done();
        });
  
        /**
        * manifest-*.xml is good
        */
        describe('manifest-*.xml contents', function () {
          var manifest = {};

          beforeEach(function (done) {
            var parser = new Xml2Js.Parser();
            fs.readFile(manifestFileName, 'utf8', function (err, manifestContent) {
              parser.parseString(manifestContent, function (err, manifestJson) {
                manifest = manifestJson;

                done();
              });
            });
          });
  
          /**
          * Form for ItemRead present
          */
          it('includes form for ItemRead', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.FormSettings[0].Form, function (formSetting) {
              if (formSetting.$['xsi:type'] === 'ItemRead') {
                found = true;
              }
            });

            expect(found, '<Form xsi:type="ItemRead"> exist').to.be.true;
            done();
          });
  
          /**
          * Form for ItemEdit not present
          */
          it('doesn\'t include form for ItemEdit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.FormSettings[0].Form, function (formSetting) {
              if (formSetting.$['xsi:type'] === 'ItemEdit') {
                found = true;
              }
            });

            expect(found, '<Form xsi:type="ItemEdit"> exist').to.be.false;
            done();
          });
  
          /**
          * Rule for Mail Read present
          */
          it('includes rule for mail read', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Message' &&
                rule.$.FormType === 'Read') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Message" FormType="Read" />').to.be.true;
            done();
          });
  
          /**
          * Rule for Mail Edit not present
          */
          it('doesn\'t include rule for mail edit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Message' &&
                rule.$.FormType === 'Edit') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Message" FormType="Edit" />').to.be.false;
            done();
          });
  
          /**
          * Rule for Appointment Read present
          */
          it('includes rule for appointment read', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Appointment' &&
                rule.$.FormType === 'Read') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Appointment" FormType="Read" />').to.be.true;
            done();
          });
  
          /**
          * Rule for Appointment Edit not present
          */
          it('doesn\'t include rule for appointment edit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Appointment' &&
                rule.$.FormType === 'Edit') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Appointment" FormType="Edit" />').to.be.false;
            done();
          });

        }); // describe('manifest-*.xml contents')
  
      }); // describe('Outlook extension points:MessageReadCommandSurface, 
          // AppointmentAttendeeCommandSurface')
      
      describe('Outlook extension points:MessageComposeCommandSurface, '
             + 'AppointmentOrganizerCommandSurface', 
      function () {

        beforeEach(function (done) {
          // set language to html
          options.tech = 'ng';
  
          // set outlook form type
          options.extensionPoint = [
            'MessageComposeCommandSurface', 
            'AppointmentOrganizerCommandSurface'
          ];

          helpers.run(path.join(__dirname, '../../generators/mail'))
            .withOptions(options)
            .withPrompts(prompts)
            .on('ready', function (gen) {
              util.setupExistingProject(gen);
            }.bind(this))
            .on('end', done);
        });

        afterEach(function () {
          mockery.disable();
        });
  
        /**
        * All expected files are created.
        */
        it('creates expected files', function (done) {
          var expected = [
            '.bowerrc',
            'bower.json',
            'gulpfile.js',
            'package.json',
            manifestFileName,
            'manifest.xsd',
            'tsd.json',
            'jsconfig.json',
            'tsconfig.json',
            addinRootPath + '/appcompose/index.html',
            addinRootPath + '/appcompose/app.module.js',
            addinRootPath + '/appcompose/app.routes.js',
            addinRootPath + '/appcompose/home/home.controller.js',
            addinRootPath + '/appcompose/home/home.html',
            addinRootPath + '/appcompose/services/data.service.js',
            addinRootPath + '/content/Office.css',
            addinRootPath + '/images/close.png',
            addinRootPath + '/images/hi-res-icon.png',
            addinRootPath + '/scripts/MicrosoftAjax.js'
          ];


          assert.file(expected);
          done();
        });
  
        /**
        * manifest-*.xml is good
        */
        describe('manifest-*.xml contents', function () {
          var manifest = {};

          beforeEach(function (done) {
            var parser = new Xml2Js.Parser();
            fs.readFile(manifestFileName, 'utf8', function (err, manifestContent) {
              parser.parseString(manifestContent, function (err, manifestJson) {
                manifest = manifestJson;

                done();
              });
            });
          });
  
          /**
          * Form for ItemRead not present
          */
          it('doesn\'t include form for ItemRead', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.FormSettings[0].Form, function (formSetting) {
              if (formSetting.$['xsi:type'] === 'ItemRead') {
                found = true;
              }
            });

            expect(found, '<Form xsi:type="ItemRead"> exist').to.be.false;
            done();
          });
  
          /**
          * Form for ItemEdit present
          */
          it('includes form for ItemEdit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.FormSettings[0].Form, function (formSetting) {
              if (formSetting.$['xsi:type'] === 'ItemEdit') {
                found = true;
              }
            });

            expect(found, '<Form xsi:type="ItemEdit"> exist').to.be.true;
            done();
          });
  
          /**
          * Rule for Mail Read not present
          */
          it('doesn\'t include rule for mail read', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Message' &&
                rule.$.FormType === 'Read') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Message" FormType="Read" />').to.be.false;
            done();
          });
  
          /**
          * Rule for Mail Edit present
          */
          it('includes rule for mail edit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Message' &&
                rule.$.FormType === 'Edit') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Message" FormType="Edit" />').to.be.true;
            done();
          });
  
          /**
          * Rule for Appointment Read not present
          */
          it('doesn\'t include rule for appointment read', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Appointment' &&
                rule.$.FormType === 'Read') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Appointment" FormType="Read" />').to.be.false;
            done();
          });
  
          /**
          * Rule for Appointment Edit present
          */
          it('includes rule for appointment edit', function (done) {
            var found = false;
            _.forEach(manifest.OfficeApp.Rule[0].Rule, function (rule) {
              if (rule.$['xsi:type'] === 'ItemIs' &&
                rule.$.ItemType === 'Appointment' &&
                rule.$.FormType === 'Edit') {
                found = true;
              }
            });

            expect(found, '<Rule xsi:type="ItemIs" ItemType="Appointment" FormType="Edit" />').to.be.true;
            done();
          });

        }); // describe('manifest-*.xml contents')
  
      }); // describe('Outlook extension points:MessageComposeCommandSurface, 
          // AppointmentOrganizerCommandSurface')

    }); // describe('technology:ng')

  }); // describe('run on existing project (non-empty folder)')

});
