"use strict";
 
module.exports = function (grunt) {
    // Load all grunt tasks.
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks('grunt-contrib-jshint');
  	grunt.loadNpmTasks('grunt-contrib-uglify');
	  grunt.loadNpmTasks('grunt-contrib-cssmin');
  	grunt.loadNpmTasks('grunt-contrib-watch');
  	grunt.loadNpmTasks('grunt-contrib-concat');
  	grunt.loadNpmTasks('grunt-concat-css');
 
    grunt.initConfig({
    		pkg: grunt.file.readJSON('package.json'),
        watch: {
            // If any .less file changes in directory "less" then run the "less" task.
            files: "less/*.less",
            tasks: ["less"]
        },
        less: {
            // Production config is also available.
            development: {
                options: {
                    // Specifies directories to scan for @import directives when parsing.
                    // Default value is the directory of the source, which is probably what you want.
                    paths: ["less/"],
                    compress: true
                },
                files: {
                    "styles.css": "less/styles.less"
                }
            },
        },
        // javascript
        uglify: {
				  options: {
				    banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
				  },
				  build: {
				    files: {
				      'amd/build/helloworld.min.js': [
				      	'amd/src/helloworld.js',
				      	'amd/src/select2.js'
				      	] 
				    }
				  }
				},
				// css
				concat_css: {
					options: {},
					files: {
						'styles.css': ['css/select2.min.css','css/style.css'],
					},
				},
    });
    // The default task (running "grunt" in console).
    grunt.registerTask("default", ["uglify", "concat_css"]);
};
