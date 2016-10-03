module.exports = function (grunt) {

// Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      files: ['public_html/tests/unittests/*.html']
    },
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: '\n\n/*################################################*/\n\n'
      },
      dist: {
        src: ['public_html/js/eblib/*.js'],
        dest: 'public_html/dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: 'public_html/dist/<%= pkg.name %>.js',
        dest: 'public_html/dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      files: ['public_html/js/**/*.js'],
      options: {
//        curly: false,
//        eqeqeq: true,
//        immed: true,
//        latedef: true,
//        newcap: true,
//        noarg: true,
//        sub: true,
//        undef: true,
//        boss: true,
//        eqnull: true,
//        node: true,
        multistr: false,
        browser: true,
        devel:true
      }
    },
    globals: {
      exports: true,
      module: false
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public_html/dist/<%= pkg.name %>*.js',
        dest: 'public_html/dist/<%= pkg.name %>.min.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  // Default task(s).
  grunt.registerTask('default', ['concat']);
};
