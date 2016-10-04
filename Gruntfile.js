module.exports = function (grunt) {

// Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8383/tests/unittests/mxtests.html'
          ]
        }
      }
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
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> Version:<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */',
        compress: true,
        mangle: true
      },
      dist: {
        files: {
          'public_html/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
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
        devel: true
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit', 'concat', 'uglify']
    }

  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // task(s).
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('test', ['jshint', 'qunit']);
};
