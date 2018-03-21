---
date: 2014-06-09T16:13:00+01:00
lastmod: 2014-06-09T16:13:00+01:00
title: "Creating a useful AngularJS project structure and toolchain"
description: "This article describes in great detail what I learned about setting up AngularJS applications in terms of project structure, tools, dependency management, test automation and code distribution. The result is a seed project that is easily extendable, clearly structured, self-documenting, and comfortable to work with."
authors: ["manuelkiessling"]
slug: 2014/06/09/creating-a-useful-angularjs-project-structure-and-toolchain
---

<h2>About</h2>
<p>
This article describes in great detail what I learned about setting up AngularJS applications in terms of project structure, tools, dependency management, test automation and code distribution. The result is a seed project that is easily extendable, clearly structured, self-documenting, and comfortable to work with.
</p>

<h2>Requirements</h2>
<p>
One of the key points of this setup is that everything that is needed for the application itself to run and the tests to works, and every other relevant task related to developing the application, is pulled in through tool-based dependency management. However, the tools that do the job need a basic global setup – which is not specific to the project itself – available on your development machine: <em>Node.js</em>, the <em>Grunt CLI</em>, and <em>Bower</em>.
</p>

<p>
The following steps describe how to create this setup on a Linux or Mac OS X system.
</p>

<h3>Step 1: Installing Node.js</h3>

<p>
Node.js is the server-side runtime environment for JavaScript based on the V8 engine by Google. We use its package manager, NPM, to pull in external dependencies for our project which we will use during development, like <em>Grunt</em> and its plugins for handling all development-related tasks, <em>Bower</em> for managing external libraries, or <em>Karma</em> for running test cases.
</p>

<p>
</p><ul>
<li>Download the latest available version of the source code of Node.js from <a href="http://www.nodejs.org/download/">http://nodejs.org/download</a>. As of this writing, the latest version is 0.10.28, available as <em>node-v0.10.28.tar.gz</em>.</li>
<li>Run <code class="inline">tar xvfz node-v0.10.28.tar.gz</code> to extract the archive.</li>
<li>Run <code class="inline">./configure &amp;&amp; make &amp;&amp; sudo make install</code> in order to compile and install the software</li>.
</ul>
<p></p>

<h3>Step 2: Installing the Grunt CLI</h3>

<p>
The <em>Grunt Command Line Interface</em> is a Node.js module which allows us to execute the Grunt tasks of our project on the command line. This way, we can handle every task that is related to the development process of the application – e.g. syntax checking, code style verification, running the unit tests, building a distributable – through a single interface, and we can configure all available tasks in great detail, making Grunt the one-stop assistant for all our project needs (with the notable exception of writing code and tests, which, I’m afraid, still has to be done by us).
</p>

<p>
The Grunt CLI ships as a Node.js module and is therefore installed using the Node Package Manager, <em>NPM</em>:
</p>

<p>
<code>npm install -g grunt-cli</code>
</p>

<p>
The <em>-g</em> switch installs the command line tool globally, that is, to a central location on our system. Grunt needs additional modules to actually do something useful, but these will be installed locally to the project location, as we will see later. The globally installed command line tool, which is invoked as <em>grunt</em>, will then use these local modules to execute the tasks for our project.
</p>

<h3>Step 3: Installing Bower</h3>

<p>
The final global requirement we will need is <em>Bower</em>. Bower is to frontend JavaScript libraries what NPM is to backend Node.js libraries. A package and dependency manager that pulls libraries like AngularJS, Restangular, jQuery, Underscore, and whatever else is needed, into our project from remote locations. It frees us from downloading these libraries by hand and putting them into a folder structure of our project manually.
</p>

<p>
In order to make the command line tool <em>bower</em> available on our system, we install it through NPM just as we did with the Grunt CLI:
</p>

<p>
<code>npm install -g bower</code>
</p>

<h2>Creating an initial project structure</h2>

<p>
With all global requirements installed and in place, we can now start to create our project, putting NPM, Grunt and Bower to use.
</p>

<h3>Dependency management</h3>
<p>
The first step is to define the local dependencies of our project – we need several backend libraries (managed through NPM) and several frontend libraries (managed through Bower). Both tools need a JSON configuration file that defines these dependencies. Let’s start with the NPM packages by creating a file <em>package.json</em> in our project root:
</p>

<p>
<span class="filename beforecode">package.json</span>
</p><pre><code>{
  "name": "Example",
  "namelower": "example",
  "version": "0.0.1",
  "description": "An example AngularJS project",
  "readme": "README.md",
  "repository": {
    "type": "git",
    "url": "git@git.example.com:example.git"
  },
  "devDependencies": {
    "grunt": "0.4.2",
    "grunt-contrib-concat":     "0.3.0",
    "grunt-contrib-copy":       "0.5.0",
    "grunt-contrib-jshint":     "0.8.0",
    "grunt-contrib-nodeunit":   "0.3.0",
    "grunt-contrib-uglify":     "0.2.2",
    "grunt-contrib-watch":      "0.5.3",
    "grunt-jsdoc":              "0.5.4",
    "grunt-exec":               "0.4.5",
    "grunt-karma":              "0.8.3",
    "karma":                    "0.12.16",
    "karma-jasmine":            "0.1.5",
    "karma-phantomjs-launcher": "0.1.4"
  },
  "scripts": {
    "postinstall": "bower install"
  }
}</code></pre>
<p></p>

<p>
As you can see, these are all development dependencies; none of these packages are needed to run the actual application. We are going to pull in the local grunt module and several of its plugins, and we make <em>Karma</em>, the AngularJS test runner, available. Satisfying these dependencies allows us to use the Grunt command line interface on this project and enables us to run Jasmine test cases against the PhantomJS headless browser.
</p>

<p>
Note the <em>scripts</em> block: we can use the <em>postinstall</em> statement to make NPM run <em>bower install</em> after installing its modules – this way, we need to execute only one command in order to pull in development <em>and</em> application dependencies.
</p>

<p>
We also need a configuration file for Bower, again in the root directory of the project, named <em>bower.json</em>:
</p>

<p>
<span class="filename beforecode">bower.json</span>
</p><pre><code>{
    "name": "example",
    "version": "0.0.0",
    "dependencies": {
        "angular":          "1.2.16",
        "angular-route":    "1.2.16",
        "angular-sanitize": "1.2.16",
        "angular-mocks":    "1.2.16",
        "jquery":           "1.8.3",
        "underscore":       "1.6.0",
        "restangular":      "1.4.0"
    },
    "analytics": false
}</code></pre>
<p></p>

<p>
These are all dependencies which the application needs to actually run.
</p>

<p>
Both JSON files belong into version control; however, the libraries they pull in should not be added to a repository; instead, they should be ignored:
</p>

<p>
</p><pre><code>~# <strong>echo "node_modules/" &gt;&gt; .gitignore</strong>
~# <strong>echo "bower_components/" &gt;&gt; .gitignore</strong></code></pre>
<p></p>

<p>
We can now start to create our very first test and implementation code and see if the setup is able to run the test case.
</p>


<h3>Setting up the test infrastructure</h3>
<p>
We start by creating a specification for an <em>ExampleController</em> in a new folder called <em>test</em>:
</p>

<p>
<span class="filename beforecode">test/ExampleControllerSpec.js</span>
</p><pre><code>describe('ExampleController', function() {
    var scope, controller, httpBackend;

    // Initialization of the AngularJS application before each test case
    beforeEach(module('ExampleApp'));

    // Injection of dependencies, $http will be mocked with $httpBackend
    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
        scope = $rootScope;
        controller = $controller;
        httpBackend = $httpBackend;
    }));

    it('should query the webservice', function() {

        // Which HTTP requests do we expect to occur, and how do we response?
        httpBackend.expectGET('/users').respond('[{"name": "First User"}, {"name": "Second User"}]');

        // Starting the controller
        controller('ExampleController', {'$scope': scope });

        // Respond to all HTTP requests
        httpBackend.flush();

        // Triggering the AngularJS digest cycle in order to resolve all promises
        scope.$apply();

        // We expect the controller to put the right value onto the scope
        expect(scope.firstUsername).toEqual('First User');

    });

});</code></pre>
<p></p>

<p>
We now need to set up the Karma test runner configuration, which will allow us to run the test case. To do so, we need to create a configuration file for Karma at the root folder of the project, called <em>karma.conf.js</em>:
</p>

<p>
<span class="filename beforecode">karma.conf.js</span>
</p><pre><code>module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    files: [
      'bower_components/jquery/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/restangular/dist/restangular.js',
      'bower_components/underscore/underscore.js',
      'bower_components/underscore/underscore.js',
      'test/**/*Spec.js',
      'source/**/*.js'
    ],

    // list of files to exclude
    exclude: [

    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {

    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};</code></pre>
<p></p>

<p>
Let’s see if we can run the specification. We don’t expect it to pass, of course, because we have not yet written a single piece of implementation code – however, at this point it is interesting to see if the infrastructure we created so far is already sufficient to run test cases.
</p>

<p>
If our setup is correct, then we should be able to launch Karma, the AngularJS test runner, as soon as our project dependencies are put in place through NPM. The following commands all need to be executed at the top level of the project folder structure.
</p>

<p>
</p><pre><code>~# <strong>npm install</strong></code></pre>
<p></p>

<p>
This installs all local Node.js dependencies and then runs <em>bower install</em>, which installs the application dependencies. We can now run Karma:
</p>

<p>
</p><pre><code>~# <strong>./node_modules/karma/bin/karma start karma.conf.js</strong></code></pre>
<p></p>

<p>
Which results in a failing test run, but should demonstrate that the testcase can at least be executed:
</p>

<p>
</p><pre><code>INFO [karma]: Karma v0.12.16 server started at http://localhost:9876/
INFO [launcher]: Starting browser PhantomJS
WARN [watcher]: Pattern "/path/to/project/source/**/*.js" does not match any file.
INFO [PhantomJS 1.9.7 (Linux)]: Connected on socket ipy4Oxm5mNuYz-NrJ_PB with id 14596927
PhantomJS 1.9.7 (Linux) ExampleController should query the webservice FAILED
	Error: [$injector:modulerr] Failed to instantiate module ExampleApp due to:
	Error: [$injector:nomod] Module 'ExampleApp' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.
...
PhantomJS 1.9.7 (Linux): Executed 1 of 1 (1 FAILED) ERROR (0.042 secs / 0.011 secs)</code></pre>
<p></p>

<h3>A first implementation</h3>
<p>
We will now add the implementation code that is neccessary to make the test case pass. Let’s start by adding controller code to <em>source/controllers.js</em>:
</p>

<p>
<span class="filename beforecode">source/controllers.js</span>
</p><pre><code>/**
 * This is an example controller.
 * It triggers the UserdataService and puts the returned value on the scope
 *
 * @see services
 */
var controllers = angular.module('ExampleApp.controllers', [])
    .controller('ExampleController', function ($scope, UserdataService) {

        UserdataService.getFirstUsername().then(function(firstUsername) {
            $scope.firstUsername = firstUsername;
        });

    });</code></pre>
<p></p>

<p>
This obviously needs a <em>UserdataService</em>, so let’s implement that, too:
</p>

<p>
<span class="filename beforecode">source/services.js</span>
</p><pre><code>/**
 * Restangular-based data service, fetches user data from the backend
 *
 * @see https://github.com/mgonto/restangular
 */
var services = angular.module('ExampleApp.services', [])
    .factory('UserdataService', ['Restangular', '$q', function UserdataService(Restangular, $q) {
        return {
            /**
             * @function getFirstUsername
             * @returns a Promise that eventually resolves to the username of the first user
             */
            getFirstUsername: function() {
                var firstUsernameDeferred = $q.defer();
                var response = Restangular.one('users').getList().then(function(response) {
                    firstUsernameDeferred.resolve(response[0].name);
                });
                return firstUsernameDeferred.promise;
            }
        };
    }]);</code></pre>
<p></p>

<p>
Finally, we can set up the application in <em>source/app.js</em>:
</p>

<p>
<span class="filename beforecode">source/app.js</span>
</p><pre><code>/**
 * Setup of main AngularJS application, with Restangular being defined as a dependency.
 *
 * @see controllers
 * @see services
 */
var app = angular.module('ExampleApp',
    [
        'restangular',
        'ExampleApp.controllers',
        'ExampleApp.services'
    ]
);</code></pre>
<p></p>

<p>
Now the testcase runs <em>and</em> passes:
</p>

<p>
</p><pre><code>~# <strong>./node_modules/karma/bin/karma start karma.conf.js</strong>

INFO [karma]: Karma v0.12.16 server started at http://localhost:9876/
INFO [launcher]: Starting browser PhantomJS
INFO [PhantomJS 1.9.7 (Linux)]: Connected on socket z_SJLuQxFZkHxLO_Zk5x with id 41252485
PhantomJS 1.9.7 (Linux): Executed 1 of 1 <span class="highlight">SUCCESS</span> (0.038 secs / 0.022 secs)</code></pre>
<p></p>

<p>
Running unit tests is the first of many differents tasks that need to be performed while developing a project. We can configure all these tasks into Grunt, which results in a unified interface for managing our project tasks. In order to set up unit test execution as a Grunt task, we need to describe it in a file named <em>Gruntfile.js</em> in our project root folder:
</p>

<p>
<span class="filename beforecode">Gruntfile.js</span>
</p><pre><code>module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    'meta': {
      'jsFilesForTesting': [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore/underscore.js',
        'test/**/*Spec.js'
      ]
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'source/**/*.js'
          ],
        }
      }
	}
  });

  grunt.registerTask('test', ['karma:development']);

};</code></pre>
<p></p>

<p>
This configures the task <em>karma:development</em> using the <em>grunt-karma</em> plugin, plus an alias <em>test</em> that maps to <em>karma:development</em>. Note that Grunt isn’t just a dumb command executor like a bash script – with its specialized plugins, it understands the tools it runs in its tasks; as you can see, we configure the basic set of files that are needed for a test run in <em>meta.jsFilesForTesting</em>, and then use this set in <em>karma.development.options.files</em>. Later, we are going to define other Karma subtasks (in addition to <em>karma.development</em>), pointing at the basic set of files but including other files than <em>source/**/*js</em>.
</p>

<p>
Don’t worry if this doesn’t make sense right now; we will take it step by step.
</p>

<p>
Because now we configure the <em>files</em> set within the Grunt config files, we no longer need it in our <em>karma.conf</em> file:
</p>

<p>
<span class="filename beforecode">karma.conf.js</span>
</p><pre><code>module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files to exclude
    exclude: [

    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {

    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};</code></pre>
<p></p>

<p>
With this, we can start the unit test run using Grunt:
</p>

<p>
</p><pre><code>~# <strong>grunt test</strong></code></pre>
<p></p>

<p>
Note that it doesn’t matter in which subfolder of our project we are while running this command – Grunt gets the paths right for us, another benefit of using Grunt that makes working with our project more comfortable.
</p>

<h3>Linting code using Grunt</h3>
<p>
Let’s see if we can find other useful tasks that Grunt can handle for us. An important building block of any useful JavaScript development workflow is linting, i.e., checking our code base for syntax and style errors. The tool of choice here is <em>JSHint</em>, and Grunt makes it easy to integrate it into the workflow:
</p>

<p>
<span class="filename beforecode">Gruntfile.js</span>
</p><pre><code>module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  <span class="highlight">grunt.loadNpmTasks('grunt-contrib-jshint');</span>

  grunt.initConfig({

    'meta': {
      'jsFilesForTesting': [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore/underscore.js',
        'test/**/*Spec.js'
      ]
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'source/**/*.js'
          ],
        }
      },
    },

    <span class="highlight">'jshint': {
      'beforeconcat': ['source/**/*.js'],
    }</span>

  });

  grunt.registerTask('test', ['karma:development']);

};</code></pre>
<p></p>

<p>
With this, running <em>grunt jshint</em> lints our source code files:
</p>

<p>
</p><pre><code>~# <strong>grunt jshint</strong>

Running "jshint:beforeconcat" (jshint) task
&gt;&gt; 3 files lint free.

Done, without errors.</code></pre>
<p></p>

<h3>Real developers ship</h3>
<p>
Until now we have only handled our source files. But that’s probably not the format we want to use when shipping our application to production. A minified single file with all our source code concatenated together is usually the preferred end result.
</p>

<p>
The goal is to end up with two files in the <em>dist</em> folder of our project root:
</p>

<p>
</p><pre><code>
<strong>bower_components/</strong>
bower.json
<span class="highlight"><strong>dist/</strong>
    example-0.0.1.js
    example-0.0.1.min.js</span>
.gitignore
Gruntfile.js
<strong>node_modules/</strong>
karma.conf.js
package.json
<strong>source/</strong>
<strong>test/</strong>
</code></pre>
<p></p>

<p>
As you can see, the file name contains the name and version of our project. Grunt can be configured to derive these values from the <em>package.json</em> file of our project. Then, the <em>concat</em> plugin can be used to generate a non-minified dist file that contains the content of all source files concatenated together, and the <em>uglify</em> plugin then generates a minified version of this file. Let’s look at the changes to our Gruntfile:
</p>

<p>
<span class="filename beforecode">Gruntfile.js</span>
</p><pre><code>module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  <span class="highlight">grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');</span>

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'meta': {
      'jsFilesForTesting': [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore/underscore.js',
        'test/**/*Spec.js'
      ]
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'source/**/*.js'
          ],
        }
      },
    },

    'jshint': {
      'beforeconcat': ['source/**/*.js'],
    },

    <span class="highlight">'concat': {
      'dist': {
        'src': ['source/**/*.js'],
        'dest': 'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js'
      }
    },

    'uglify': {
      'options': {
        'mangle': false
      },
      'dist': {
        'files': {
          'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.min.js': ['dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js']
        }
      }
    },</span>

  });

  grunt.registerTask('test', ['karma:development']);

};</code></pre>
<p></p>

<p>
Now we can run both tasks…
</p>

<p>
</p><pre><code>~# <strong>grunt concat</strong>
~# <strong>grunt uglify</strong></code></pre>
<p></p>

<p>
…and the dist files will be generated.
</p>

<h3>From single tasks to complete workflows</h3>
<p>
Another really nice aspect of managing tasks through Grunt is that tasks can be combined into workflows. A very likely workflow during development is to lint and unit test our code, then concatenate and minify it if no errors were detected. Instead of running each of these tasks manually, we can use <em>registerTask</em> to create a new task which executes the other tasks for us:
</p>


<p>
<span class="filename beforecode">Gruntfile.js</span>
</p><pre><code>module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'meta': {
      'jsFilesForTesting': [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore/underscore.js',
        'test/**/*Spec.js'
      ]
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'source/**/*.js'
          ],
        }
      },
	},

    'jshint': {
      'beforeconcat': ['source/**/*.js'],
    },

    'concat': {
      'dist': {
        'src': ['source/**/*.js'],
        'dest': 'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js'
      }
    },

    'uglify': {
      'options': {
        'mangle': false
      },
      'dist': {
        'files': {
          'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.min.js': ['dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js']
        }
      }
    },

  });

  grunt.registerTask('test', ['karma:development']);
  <span class="highlight">grunt.registerTask('build',
    [
      'jshint',
      'karma:development',
      'concat',
      'uglify'
    ]);</span>

};</code></pre>
<p></p>

<p>
Now, running <code class="inline">grunt build</code> will execute this workflow.
</p>

<h3>Real developers ship <em>tested</em> files</h3>
<p>
We are not yet using our Grunt-based task management approach to its full potential; now that the most important moving parts are in place, reaping additional benefits is simple. It would be great, for example, to unit test our dist files, too – this way we get additional safety in regards to the stability of our code without extra costs. All that is needed to achieve this is to add two additional Karma subtasks, and to make them part of the <em>build</em> workflow:
</p>

<p>
<span class="filename beforecode">Gruntfile.js</span>
</p><pre><code>module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'meta': {
      'jsFilesForTesting': [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore/underscore.js',
        'test/**/*Spec.js'
      ]
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'source/**/*.js'
          ],
        }
      },
      <span class="highlight">'dist': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js'
          ],
        }
      },
      'minified': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.min.js'
          ],
        }
      }</span>
    },

    'jshint': {
      'beforeconcat': ['source/**/*.js'],
    },

    'concat': {
      'dist': {
        'src': ['source/**/*.js'],
        'dest': 'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js'
      }
    },

    'uglify': {
      'options': {
        'mangle': false
      },
      'dist': {
        'files': {
          'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.min.js': ['dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js']
        }
      }
    },

  });

  grunt.registerTask('test', ['karma:development']);
  grunt.registerTask('build',
    [
      'jshint',
      'karma:development',
      'concat',
      <span class="highlight">'karma:dist',</span>
      'uglify',
      <span class="highlight">'karma:minified'</span>
    ]);

};</code></pre>
<p></p>

<p>
And with this, we have at our fingertips a complete AngularJS workflow: our source code is linted and tested, merged into a distribution file, which is tested, too, and then minified and tested again. Our application is verified and ready to ship with a single command:
</p>

<p>
</p><pre><code>~# <strong>grunt build</strong>

Running "jshint:beforeconcat" (jshint) task
&gt;&gt; 3 files lint free.

Running "karma:development" (karma) task
INFO [karma]: Karma v0.12.16 server started at http://localhost:9876/
INFO [launcher]: Starting browser PhantomJS
INFO [PhantomJS 1.9.7 (Linux)]: Connected on socket F7fLBEBaNrHk2cU6CYFq with id 89087960
PhantomJS 1.9.7 (Linux): Executed 1 of 1 SUCCESS (0.036 secs / 0.039 secs)

Running "concat:dist" (concat) task
File "dist/example-0.0.1.js" created.

Running "karma:dist" (karma) task
INFO [karma]: Karma v0.12.16 server started at http://localhost:9876/
INFO [launcher]: Starting browser PhantomJS
INFO [PhantomJS 1.9.7 (Linux)]: Connected on socket jGrx9Gvwj_NL2hdXCYXx with id 25650934
PhantomJS 1.9.7 (Linux): Executed 1 of 1 SUCCESS (0.042 secs / 0.022 secs)

Running "uglify:dist" (uglify) task
File "dist/example-0.0.1.min.js" created.

Running "karma:minified" (karma) task
INFO [karma]: Karma v0.12.16 server started at http://localhost:9876/
INFO [launcher]: Starting browser PhantomJS
INFO [PhantomJS 1.9.7 (Linux)]: Connected on socket 4X26gG7Ob53ePR4DCYhQ with id 88795558
PhantomJS 1.9.7 (Linux): Executed 1 of 1 SUCCESS (0.038 secs / 0.022 secs)

Done, without errors.</code></pre>
<p></p>

<h3>Effortless documentation</h3>
<p>
With a first complete workflow in place, we can now add other useful steps; for example, generating a JSDoc documentation from our inline source code comments is straight-forward:
</p>

<p>
First, we add the plugin and task configuration for JSDoc to the Gruntfile, and make the <em>jsdoc</em> task part of our <em>build</em> workflow:
</p>

<p>
<span class="filename beforecode">Gruntfile.js</span>
</p><pre><code>module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  <span class="highlight">grunt.loadNpmTasks('grunt-jsdoc');</span>

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'meta': {
      'jsFilesForTesting': [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore/underscore.js',
        'test/**/*Spec.js'
      ]
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'source/**/*.js'
          ],
        }
      },
      'dist': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js'
          ],
        }
      },
      'minified': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '&lt;%= meta.jsFilesForTesting %&gt;',
            'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.min.js'
          ],
        }
      }
    },

    'jshint': {
      'beforeconcat': ['source/**/*.js'],
    },

    'concat': {
      'dist': {
        'src': ['source/**/*.js'],
        'dest': 'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js'
      }
    },

    'uglify': {
      'options': {
        'mangle': false
      },
      'dist': {
        'files': {
          'dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.min.js': ['dist/&lt;%= pkg.namelower %&gt;-&lt;%= pkg.version %&gt;.js']
        }
      }
    },

    <span class="highlight">'jsdoc': {
      'src': ['source/**/*.js'],
      'options': {
        'destination': 'doc'
      }
    }</span>

  });

  grunt.registerTask('test', ['karma:development']);
  grunt.registerTask('build',
    [
      'jshint',
      'karma:development',
      'concat',
      'karma:dist',
      'uglify',
      'karma:minified'<span class="highlight">,
      'jsdoc'</span>
    ]);

};</code></pre>
<p></p>

<p>
If you don’t want the generated documentation to be part of the repository, add the <em>doc</em> folder to <em>.gitignore</em>:
</p>

<p>
</p><pre><code>~# <strong>echo "doc/" &gt;&gt; .gitignore</strong></code></pre>
<p></p>

<p>
Now, generating the documentation is simple:
</p>

<p>
</p><pre><code>~# <strong>grunt jsdoc</strong></code></pre>
<p></p>


<h3>From task management to Continuous Integration</h3>
<p>
One of the huge benefits of having each project-related task managed by a tool like Grunt is that automation is now simple. And that’s the key to the final step: Setting up the project for Continuous Integration. We will look at what needs to be done to make our project usable with TravisCI and Jenkins, respectively.
</p>

<h3>Integrating with TravisCI</h3>
<p>
We need to do some minimal changes to our project to make it able to run on TravisCI. First, let’s create the obligatory <em>.travis.yml</em> file:
</p>

<p>
<span class="filename beforecode">.travis.yml</span>
</p><pre><code>language: node_js
node_js:
  - 0.10
before_install:
  - npm install -g grunt-cli
  - npm install -g bower</code></pre>
<p></p>

<p>
As you can see, we declare our project to be a Node.js project. This is because from TravisCI’s point of view, only Node.js scripts (<em>npm install</em>, <em>grunt build</em>, <em>karma</em> etc.) are run for building and testing the project.
</p>

<p>
Just as we prepared our personal development environment, we need to globally install <em>grunt-cli</em> and <em>bower</em> globally.
</p>

<p>
This is all we need to put into the <em>.travis.yml</em> file because TravisCI runs <em>npm install</em> and then <em>npm test</em> on Node.js projects by default, after checking them out of version control. However, <em>npm test</em> doesn’t do anything useful yet for our project. Let’s change that by adding a line to our <em>package.json</em>:
</p>

<p>
<span class="filename beforecode">package.json</span>
</p><pre><code>{
  "name": "Example",
  "namelower": "example",
  "version": "0.0.1",
  "description": "An example AngularJS project",
  "readme": "README.md",
  "repository": {
    "type": "git",
    "url": "git@git.example.com:example.git"
  },
  "devDependencies": {
    "grunt": "0.4.2",
    "grunt-contrib-concat":     "0.3.0",
    "grunt-contrib-copy":       "0.5.0",
    "grunt-contrib-jshint":     "0.8.0",
    "grunt-contrib-nodeunit":   "0.3.0",
    "grunt-contrib-uglify":     "0.2.2",
    "grunt-contrib-watch":      "0.5.3",
    "grunt-jsdoc":              "0.5.4",
    "grunt-exec":               "0.4.5",
    "grunt-karma":              "0.8.3",
    "karma":                    "0.12.16",
    "karma-jasmine":            "0.1.5",
    "karma-phantomjs-launcher": "0.1.4"
  },
  "scripts": {
    "postinstall": "bower install"<span class="highlight">,
    "test": "grunt build"</span>
  }
}</code></pre>
<p></p>

<p>
Now, TravisCI executing <em>npm test</em> will result in <em>grunt build</em> being run. Should any single step in <em>grunt build</em> fail, then the TravisCI run will fail; if everything succeeds, then TravisCI will consider the run a success, too.
</p>

<h3>Going further</h3>
<p>
If you would like to use the project setup described herein as a base template for your own projects, see <a href="https://github.com/manuelkiessling/angular-seed-enhanced">https://github.com/manuelkiessling/angular-seed-enhanced</a>.
</p>
